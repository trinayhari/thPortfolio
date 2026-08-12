/**
 * The router: free-form text in, a decision about what to show out.
 *
 * Order of operations
 *   1. normalize and expand the query (text.ts)
 *   2. repair typos against the domain vocabulary (fuzzy.ts)
 *   3. look for a named project or employer
 *   4. score the query against every intent phrasing
 *   5. fall back to BM25 retrieval over the work index
 *   6. below the confidence floor, admit it and suggest something
 *
 * Nothing here calls out to a network. The whole thing is a few hundred
 * comparisons over a corpus of a few thousand terms.
 */

import { BM25 } from './bm25';
import type { Indexed } from './bm25';
import { ENTITY_PHRASES, ENTITY_TOKENS, KEY_TERMS, WORK_DOCS } from './corpus';
import type { WorkDoc } from './corpus';
import { nearest } from './fuzzy';
import { INTENTS } from './intents';
import type { IntentId } from './intents';
import { analyze, contentOf, indexTerms, tokenize } from './text';
import type { Analysis } from './text';

/* ── tuning ──────────────────────────────────────────────────────────────
   Calibrated against the query set in nlp/router.test-queries.ts; change
   these together with that list rather than in isolation. */

/** Below this, an intent match is not trusted on its own. */
const INTENT_FLOOR = 0.3;
/** At or above this, an intent beats a competing entity mention. */
const INTENT_STRONG = 0.52;
/** Below this, retrieval is treated as noise rather than an answer. */
const TOPIC_FLOOR = 0.14;
/** Retrieval must also connect on this much of what was actually asked. */
const TOPIC_COVERAGE = 0.45;
/** A second intent this close to the winner means the query is ambiguous. */
const AMBIGUOUS_MARGIN = 0.06;

/**
 * Intents that describe a category of work. When the visitor has named a
 * specific project or employer, the named thing is the better answer — asking
 * "tell me about your experience at Amazon" wants the Amazon entry, not the
 * list of every role.
 */
const YIELDS_TO_ENTITY = new Set<IntentId>(['experience', 'projects', 'about', 'current', 'skills', 'filesystem']);

/* ── indices, built once at module load ─────────────────────────────────── */

type Phrase = { intent: IntentId; boost: number; tokens: string[] };

const PHRASE_DOCS: Indexed<Phrase>[] = INTENTS.flatMap((intent) =>
  intent.examples.map((ex, i) => ({
    id: intent.id + ':' + i,
    boost: intent.boost ?? 1,
    value: { intent: intent.id, boost: intent.boost ?? 1, tokens: tokenize(ex) },
    terms: indexTerms(ex),
  }))
);

const intentIndex = new BM25(PHRASE_DOCS);
const workIndex = new BM25(WORK_DOCS);

/**
 * Repair targets. Intentionally not the whole corpus — see KEY_TERMS. Intent
 * phrasings are included because they are curated rather than prose.
 */
const VOCABULARY: string[] = [
  ...new Set([...intentIndex.vocabulary(), ...KEY_TERMS, ...ENTITY_TOKENS.keys()]),
];

/* ── result shape ───────────────────────────────────────────────────────── */

export type Suggestion = { label: string; cmd: string };

export type Route = {
  /** what to do */
  kind: 'intent' | 'entity' | 'topic' | 'unknown';
  /** for kind:'intent' */
  intent?: IntentId;
  /** for kind:'entity' — a project or experience id */
  entity?: string;
  /** for kind:'topic' — matching work documents, best first */
  docs?: WorkDoc[];
  /** 0..1, how much the router believes its own answer */
  confidence: number;
  /** set when typo repair changed the query, e.g. "expereince" → "experience" */
  corrected?: string;
  /** offered when the router is unsure or has nothing */
  suggestions: Suggestion[];
  /** a close second, when two intents scored within a hair of each other */
  alternative?: Suggestion;
};

/* ── helpers ────────────────────────────────────────────────────────────── */

/** Replace unknown tokens with their closest vocabulary neighbour. */
function repair(text: string): { text: string; changed: boolean } {
  const known = new Set(VOCABULARY);
  let changed = false;
  const out = tokenize(text).map((token) => {
    if (token.length < 4 || known.has(token)) return token;
    /* a stemmed form may be in the vocabulary even when the surface form is not */
    if (known.has(indexTerms(token)[0])) return token;
    const hit = nearest(token, VOCABULARY);
    if (hit && hit.distance > 0) {
      changed = true;
      return hit.term;
    }
    return token;
  });
  return { text: out.join(' '), changed };
}

/** Find a project or employer named in the query. */
function findEntity(text: string, terms: string[]): { id: string; strength: number } | null {
  for (const [phrase, id] of ENTITY_PHRASES) {
    if (text.includes(phrase)) return { id, strength: 1 };
  }
  const tokens = tokenize(text);
  for (const token of tokens) {
    const id = ENTITY_TOKENS.get(token);
    if (id) {
      /* the fewer other content words, the more the query is *about* this thing */
      const strength = Math.min(1, 1.4 / Math.max(1, terms.length - 1));
      return { id, strength: Math.max(0.45, strength) };
    }
  }
  return null;
}

/** True when `needle` appears as a contiguous run inside `haystack`. */
function containsSequence(haystack: string[], needle: string[]): boolean {
  if (!needle.length || needle.length > haystack.length) return false;
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) if (haystack[i + j] !== needle[j]) continue outer;
    return true;
  }
  return false;
}

/**
 * Best score per intent across all of its example phrasings.
 *
 * Bag-of-terms scoring alone cannot separate "what have you built" (projects)
 * from "currently building" (current) once both reduce to `build`, so a query
 * that reproduces a phrasing outright gets a decisive bonus.
 */
function scoreIntents(a: Analysis, useTokens = true): { intent: IntentId; score: number }[] {
  const queryTokens = useTokens ? a.raw : [];
  const best = new Map<IntentId, number>();
  for (const hit of intentIndex.search(a.terms, PHRASE_DOCS.length, a.expanded)) {
    const phrase = hit.value.tokens;
    let score = hit.score;
    if (queryTokens.length) {
      if (phrase.length === queryTokens.length && containsSequence(queryTokens, phrase)) {
        score += 0.7 * hit.value.boost;
      } else if (phrase.length >= 2 && containsSequence(queryTokens, phrase)) {
        score += 0.3 * hit.value.boost * (phrase.length / queryTokens.length);
      }
    }
    const cur = best.get(hit.value.intent) ?? 0;
    if (score > cur) best.set(hit.value.intent, score);
  }
  return [...best.entries()]
    .map(([intent, score]) => ({ intent, score }))
    .sort((a, b) => b.score - a.score);
}

const INTENT_LABEL: Record<IntentId, string> = {
  about: 'About me',
  current: 'What I’m building',
  projects: 'Projects',
  experience: 'Experience',
  resume: 'Résumé',
  skills: 'Skills',
  education: 'Education',
  leadership: 'Leadership',
  contact: 'Contact',
  help: 'Help',
  hardest: 'The hardest thing I’ve built',
  systems: 'Backend and infrastructure work',
  ai: 'AI and ML work',
  founder: 'Startup and founder work',
  filesystem: 'Filesystem',
};

function intentSuggestion(intent: IntentId): Suggestion {
  const def = INTENTS.find((i) => i.id === intent)!;
  return { label: INTENT_LABEL[intent], cmd: def.cmd };
}

/* ── the router ─────────────────────────────────────────────────────────── */

/**
 * How well a reading of the query does overall — the best of naming something,
 * matching an intent, or retrieving a document. Used to decide whether typo
 * repair actually helped.
 */
function strengthOf(a: Analysis): number {
  const named = findEntity(a.text, a.terms);
  return Math.max(
    named ? named.strength : 0,
    scoreIntents(a)[0]?.score ?? 0,
    workIndex.search(contentOf(a), 1, a.expanded)[0]?.score ?? 0
  );
}

export function route(query: string): Route {
  const first = analyze(query);

  /* Always consider a repaired reading, but only adopt it when it genuinely
     scores better — spell-correcting a query that already works can only
     make it worse. */
  let analysis = first;
  let corrected: string | undefined;
  const fixed = repair(first.text);
  if (fixed.changed) {
    const second = analyze(fixed.text);
    if (strengthOf(second) > strengthOf(first)) {
      analysis = second;
      corrected = fixed.text;
    }
  }

  const { text, terms } = analysis;
  const entity = findEntity(text, terms);
  const intents = scoreIntents(analysis);
  const top = intents[0];
  const runnerUp = intents[1];
  const topicHits = workIndex.search(contentOf(analysis), 3, analysis.expanded);

  const alternative =
    top && runnerUp && top.score - runnerUp.score < AMBIGUOUS_MARGIN && runnerUp.score >= INTENT_FLOOR
      ? intentSuggestion(runnerUp.intent)
      : undefined;

  /* 1 — a named project or employer, unless the question reframes it */
  if (entity && (!top || top.score < INTENT_STRONG || YIELDS_TO_ENTITY.has(top.intent))) {
    return {
      kind: 'entity',
      entity: entity.id,
      confidence: Math.max(entity.strength, top?.score ?? 0),
      corrected,
      suggestions: [],
    };
  }

  /* 2 — a confident intent */
  if (top && top.score >= INTENT_FLOOR) {
    return { kind: 'intent', intent: top.intent, confidence: top.score, corrected, suggestions: [], alternative };
  }

  /* 3 — retrieval over the work index */
  if (topicHits.length && topicHits[0].score >= TOPIC_FLOOR && topicHits[0].coverage >= TOPIC_COVERAGE) {
    return {
      kind: 'topic',
      docs: topicHits.filter((h) => h.score >= TOPIC_FLOOR * 0.6).map((h) => h.value),
      confidence: topicHits[0].score,
      corrected,
      suggestions: [],
    };
  }

  /* 4 — nothing convincing; offer the nearest things that did score */
  const suggestions: Suggestion[] = [];
  for (const i of intents.slice(0, 2)) {
    if (i.score > 0.08) suggestions.push(intentSuggestion(i.intent));
  }
  for (const h of topicHits.slice(0, 2)) {
    if (h.score > 0.05) suggestions.push({ label: h.value.title, cmd: h.value.cmd });
  }
  return { kind: 'unknown', confidence: top?.score ?? 0, corrected, suggestions: suggestions.slice(0, 3) };
}
