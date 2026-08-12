/**
 * The searchable index of the work, plus the entity table used to recognise
 * when a query names a specific project or employer.
 *
 * Everything is derived from `data.ts`, so adding a project automatically adds
 * it to search — there is no second list to keep in sync.
 */

import { EXPERIENCE, LEADERSHIP, PROJECTS } from '../data';
import { contentTerms } from './text';
import type { Indexed } from './bm25';

export type DocKind = 'project' | 'experience' | 'leadership';

export type WorkDoc = {
  id: string;
  kind: DocKind;
  title: string;
  /** the command that opens this document */
  cmd: string;
};

/** Extra names people use that do not appear in the data itself. */
const ALIASES: Record<string, string[]> = {
  aws: ['amazon', 'amazon web services'],
  travelers: ['traveler'],
  paybridge: ['pay bridge'],
  channelflex: ['channel flex', 'fractal', 'fractal software'],
  slait: ['slait.dev'],
  echoboard: ['echo board', 'echoboard.us'],
  proq: [],
  sailo: [],
  routini: [],
};

/**
 * Names that identify a document. Kept deliberately literal — topical words
 * like "payments" or "lambda" stay out, so that asking about a topic searches
 * rather than jumping straight into one entry.
 */
export type Entity = { id: string; names: string[] };

export const ENTITIES: Entity[] = [
  ...PROJECTS.map((p) => ({ id: p.id, names: [p.id, p.name.toLowerCase(), ...(ALIASES[p.id] || [])] })),
  ...EXPERIENCE.map((x) => ({
    id: x.id,
    names: [x.id, x.company.toLowerCase(), x.company.toLowerCase().replace(/\b(llc|inc|technologies|insurance|services)\b/g, '').trim(), ...(ALIASES[x.id] || [])],
  })),
].map((e) => ({ ...e, names: [...new Set(e.names.filter(Boolean))] }));

/** Single-word entity names, for cheap token-level matching. */
export const ENTITY_TOKENS = new Map<string, string>();
for (const e of ENTITIES) {
  for (const n of e.names) {
    if (!n.includes(' ')) ENTITY_TOKENS.set(n, e.id);
  }
}

/** Multi-word entity names, matched against the raw query string. */
export const ENTITY_PHRASES: [string, string][] = ENTITIES.flatMap((e) =>
  e.names.filter((n) => n.includes(' ')).map((n) => [n, e.id] as [string, string])
);

/**
 * The vocabulary typo repair aims at: names, stacks, tags and keywords only —
 * never prose. Spell-correcting against every word in every write-up lets
 * "weather" land on "whether" and retrieve a project about coding agents.
 */
export const KEY_TERMS: string[] = [
  ...new Set([
    ...ENTITIES.flatMap((e) => e.names.flatMap((n) => n.split(' '))),
    ...PROJECTS.flatMap((p) => contentTerms([p.name, p.stack.join(' '), p.tags.join(' '), p.keywords.join(' ')].join(' '))),
    ...EXPERIENCE.flatMap((x) => contentTerms([x.company, x.title, x.tags.join(' '), x.keywords.join(' ')].join(' '))),
  ]),
];

/** The BM25 corpus: one document per project, role and leadership entry. */
export const WORK_DOCS: Indexed<WorkDoc>[] = [
  ...PROJECTS.map((p) => ({
    id: p.id,
    boost: p.draft ? 0.85 : 1,
    value: { id: p.id, kind: 'project' as const, title: p.name, cmd: 'open ' + p.id },
    terms: contentTerms(
      [
        p.name,
        p.subtitle,
        p.desc,
        p.role,
        p.status,
        p.stack.join(' '),
        p.tags.join(' '),
        p.keywords.join(' '),
        p.sections.map((s) => s.label + ' ' + s.body).join(' '),
      ].join(' ')
    ),
  })),
  ...EXPERIENCE.map((x) => ({
    id: x.id,
    boost: 1,
    value: { id: x.id, kind: 'experience' as const, title: x.title + ' · ' + x.company, cmd: 'open ' + x.id },
    terms: contentTerms([x.title, x.company, x.desc, x.tags.join(' '), x.keywords.join(' '), x.bullets.join(' ')].join(' ')),
  })),
  ...LEADERSHIP.map((l, i) => ({
    id: 'leadership-' + i,
    boost: 0.8,
    value: { id: 'leadership-' + i, kind: 'leadership' as const, title: l.title, cmd: '/leadership' },
    terms: contentTerms([l.title, l.org, l.bullets.join(' ')].join(' ')),
  })),
];
