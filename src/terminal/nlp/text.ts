/**
 * Text normalization for the query router.
 *
 * Everything here runs in the visitor's browser on every keystroke-completed
 * query, so it is deliberately cheap: string passes and table lookups, no
 * model, no network. The goal is to collapse the many ways a person can phrase
 * the same question down to a comparable bag of stems.
 */

/** Contractions and shorthand, expanded before tokenizing. */
const REWRITES: [RegExp, string][] = [
  [/[’‘`]/g, "'"],
  [/\bwhat's\b/g, 'what is'],
  [/\bwho's\b/g, 'who is'],
  [/\bhow's\b/g, 'how is'],
  [/\bwhere's\b/g, 'where is'],
  [/\bwhen's\b/g, 'when is'],
  [/\bthat's\b/g, 'that is'],
  [/\bit's\b/g, 'it is'],
  [/\bthere's\b/g, 'there is'],
  [/\blet's\b/g, 'let us'],
  [/\byou're\b/g, 'you are'],
  [/\byou've\b/g, 'you have'],
  [/\byou'd\b/g, 'you would'],
  [/\byou'll\b/g, 'you will'],
  [/\bi'm\b/g, 'i am'],
  [/\bi've\b/g, 'i have'],
  [/\bi'd\b/g, 'i would'],
  [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bdidn't\b/g, 'did not'],
  [/\bcan't\b/g, 'can not'],
  [/\bwon't\b/g, 'will not'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  /* texting shorthand — recruiters type fast */
  [/\bur\b/g, 'your'],
  [/\bu\b/g, 'you'],
  [/\br\b/g, 'are'],
  [/\bpls\b|\bplz\b/g, 'please'],
  [/\babt\b/g, 'about'],
  [/\bexp\b/g, 'experience'],
  [/\bproj\b/g, 'project'],
  [/\binfo\b/g, 'information'],
  [/\bbg\b/g, 'background'],
  [/\bdun\b/g, 'done'],
  [/\bthru\b/g, 'through'],
  [/\bwat\b/g, 'what'],
  [/\bhav\b/g, 'have'],
  [/\bcs\b/g, 'computer science'],
  [/\bswe\b/g, 'software engineer'],
  [/\bsde\b/g, 'software engineer'],
  [/\byoe\b/g, 'years of experience'],
];

/**
 * Words carrying no routing signal. Deliberately short — question words
 * (what/where/when/how) stay in, because they separate "where are you based"
 * from "what are you building", and inverse document frequency already damps
 * the ones that appear in every phrase.
 */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'from', 'by', 'as',
  'and', 'or', 'but', 'if', 'then', 'than', 'so', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'am', 'do', 'does', 'did', 'doing', 'i', 'you', 'your', 'yours',
  'my', 'mine', 'me', 'we', 'us', 'our', 'it', 'its', 'they', 'them', 'their',
  'that', 'this', 'these', 'those', 'there', 'please', 'any', 'some', 'thing',
  'things', 'lot', 'bit', 'kind', 'sort', 'stuff',
  /* auxiliaries and all-purpose verbs — too common to distinguish anything,
     and without them "have you used redis" stops matching the skills intent
     on "have" and "used" alone */
  'have', 'has', 'had', 'having', 'use', 'used', 'using', 'uses', 'get', 'got',
  'getting', 'also', 'really', 'very', 'much', 'able',
  /* "about" is pure preamble — "tell me about your projects" is a question
     about projects, and letting it score pulled everything toward /about */
  'about',
  /* request verbs. They frame every question and distinguish none of them;
     left in, "tell me about your projects" routed on "tell" rather than
     "projects", because "tell" happens to be the rarer word. */
  'tell', 'told', 'show', 'shows', 'give', 'list', 'explain', 'describe',
  'share', 'walk', 'ask', 'asking',
]);

/**
 * Additionally dropped when indexing and querying the *work* corpus. These
 * carry intent signal ("what can you do" is the help intent) but no topical
 * signal, and leaving them in means "what is the weather" retrieves every
 * project that happens to contain the phrase "what I built".
 */
const CONTENT_NOISE = new Set([
  'what', 'how', 'why', 'when', 'where', 'who', 'whom', 'whose', 'which',
  'can', 'could', 'would', 'should', 'will', 'shall', 'may', 'might', 'must',
  'want', 'need', 'like', 'see', 'look', 'go', 'say', 'said', 'let', 'come',
  'take', 'put', 'well', 'good', 'bad', 'new',
]);

/**
 * Terms the stemmer must not touch. Chopping the trailing "s" off "aws" or
 * "css" destroys the strongest signal in the query, so the domain vocabulary
 * is protected wholesale.
 */
const PROTECTED = new Set([
  'aws', 'css', 'js', 'ts', 'ios', 'os', 'sql', 'nosql', 'ml', 'ai', 'etl', 'ux',
  'ui', 'api', 'apis', 'llm', 'llms', 'evals', 'ops', 'devops', 'saas', 'gt', 'gpa',
  'ci', 'cd', 'cdk', 's3', 'rds', 'gpt', 'nlp', 'ta', 'vc', 'vcs', 'pnl', 'kpis',
  'redis', 'redshift', 'atlas', 'lens', 'analysis', 'business', 'address', 'less',
]);

/** Irregular verbs that matter in this corpus. */
const IRREGULAR: Record<string, string> = {
  built: 'build',
  building: 'build',
  builds: 'build',
  wrote: 'write',
  written: 'write',
  made: 'make',
  making: 'make',
  ran: 'run',
  running: 'run',
  taught: 'teach',
  teaching: 'teach',
  led: 'lead',
  leading: 'lead',
  shipped: 'ship',
  shipping: 'ship',
  best: 'good',
  better: 'good',
  worst: 'bad',
  worse: 'bad',
  hardest: 'hard',
  harder: 'hard',
  toughest: 'tough',
  tougher: 'tough',
  biggest: 'big',
  bigger: 'big',
  strongest: 'strong',
  stronger: 'strong',
  proudest: 'proud',
  people: 'person',
};

/**
 * Query-side vocabulary expansion. The left-hand term is what the corpus
 * says; the right-hand terms are what a visitor is likely to type instead.
 * Matching any variant adds the canonical term to the query.
 */
const SYNONYMS: Record<string, string[]> = {
  /* note: "resume", "cv" and "background" deliberately do not expand to
     experience — they belong to the résumé and about intents respectively */
  experience: ['job', 'jobs', 'work', 'worked', 'working', 'career', 'employment', 'employer', 'intern', 'internship', 'internships', 'position', 'positions', 'role', 'roles', 'company', 'companies', 'workplace', 'professional', 'history'],
  project: ['projects', 'portfolio', 'side', 'app', 'apps', 'product', 'products', 'thing', 'demo', 'demos', 'repo', 'repos', 'github'],
  skill: ['skills', 'stack', 'tech', 'technology', 'technologies', 'language', 'languages', 'tool', 'tools', 'framework', 'frameworks', 'proficient', 'know', 'knows', 'familiar', 'competent', 'expertise'],
  education: ['school', 'college', 'university', 'degree', 'major', 'study', 'studying', 'studies', 'student', 'graduate', 'graduating', 'graduation', 'gpa', 'grades', 'coursework', 'classes', 'courses', 'academic'],
  contact: ['email', 'reach', 'contact', 'touch', 'hire', 'hiring', 'available', 'availability', 'recruit', 'recruiter', 'connect', 'linkedin', 'message', 'talk', 'chat', 'call'],
  current: ['now', 'currently', 'today', 'lately', 'recent', 'recently', 'latest', 'present', 'nowadays'],
  leadership: ['lead', 'leader', 'mentor', 'mentoring', 'teach', 'teaching', 'ta', 'volunteer', 'club', 'organization', 'community'],
  hard: ['difficult', 'challenging', 'complex', 'tricky', 'toughest', 'hardest', 'gnarly'],
  good: ['impressive', 'favorite', 'favourite', 'proud', 'strongest', 'standout', 'showcase', 'highlight'],
  ai: ['llm', 'llms', 'gpt', 'genai', 'ml', 'model', 'models', 'agent', 'agents', 'machine learning', 'openai', 'anthropic', 'claude', 'eval', 'evals', 'inference', 'prompt'],
  backend: ['server', 'servers', 'api', 'apis', 'infrastructure', 'infra', 'systems', 'distributed', 'scale', 'scaling', 'scalability', 'pipeline', 'pipelines', 'database', 'databases'],
  founder: ['startup', 'startups', 'founded', 'founding', 'entrepreneur', 'entrepreneurship', 'company', 'venture', 'vc', 'cofounder'],
  about: ['who', 'bio', 'yourself', 'introduce', 'introduction', 'summary', 'overview'],
};

/** variant → canonical terms, inverted once at module load. */
const EXPANSIONS: Record<string, string[]> = {};
for (const [canonical, variants] of Object.entries(SYNONYMS)) {
  for (const v of variants) {
    (EXPANSIONS[v] ||= []).push(canonical);
  }
}

/** Lowercase, strip accents, expand contractions and shorthand. */
export function normalize(input: string): string {
  let s = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[“”]/g, '"');
  for (const [re, to] of REWRITES) s = s.replace(re, to);
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Split into tokens, keeping the characters that carry meaning in tech names:
 * `+` for c++, `#` for c#, `.` for next.js and slait.dev.
 */
export function tokenize(normalized: string): string[] {
  return normalized
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ''))
    .filter(Boolean);
}

/** Conservative suffix stripper — plurals and the common verb endings only. */
export function stem(word: string): string {
  if (PROTECTED.has(word) || word.length <= 3) return word;
  if (IRREGULAR[word]) return IRREGULAR[word];
  /* a token containing . or + is a tech name, never an inflected word */
  if (/[.+#]/.test(word)) return word;

  let w = word;
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (/(ss|sh|ch|x|z)es$/.test(w)) return w.slice(0, -2);
  if (w.endsWith('s') && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
  if (w.endsWith('ing') && w.length > 5) {
    w = w.slice(0, -3);
    if (/([bdfglmnprt])\1$/.test(w)) w = w.slice(0, -1);
    else if (!/[aeiou]/.test(w.slice(-2))) w += 'e';
  } else if (w.endsWith('ed') && w.length > 4) {
    w = w.slice(0, -2);
    if (/([bdfglmnprt])\1$/.test(w)) w = w.slice(0, -1);
  } else if (w.endsWith('ly') && w.length > 4) {
    w = w.slice(0, -2);
  }
  return w;
}

export type Analysis = {
  /** the normalized source string */
  text: string;
  /** every token, in order, before stopword removal — used for phrase checks */
  raw: string[];
  /** stemmed content tokens plus synonym expansions, for scoring */
  terms: string[];
  /**
   * The subset of `terms` the visitor did not actually type — added by synonym
   * expansion. Scoring treats these as optional: a guess that pans out helps,
   * but one that matches nothing must not be held against the query.
   */
  expanded: Set<string>;
};

/** Run the whole pipeline: normalize → tokenize → expand → stem. */
export function analyze(input: string): Analysis {
  const text = normalize(input);
  const raw = tokenize(text);

  const typed = new Set(raw.map(stem));
  const all: string[] = [];
  for (const t of raw) {
    all.push(t);
    const syn = EXPANSIONS[t];
    if (syn) all.push(...syn);
  }
  /* two-word synonyms ("machine learning") are checked against the string */
  for (const [variant, canon] of Object.entries(EXPANSIONS)) {
    if (variant.includes(' ') && text.includes(variant)) all.push(...canon);
  }

  const seen = new Set<string>();
  const terms: string[] = [];
  const expanded = new Set<string>();
  for (const t of all) {
    if (STOPWORDS.has(t)) continue;
    const s = stem(t);
    if (s.length < 2 || seen.has(s)) continue;
    seen.add(s);
    terms.push(s);
    if (!typed.has(s)) expanded.add(s);
  }
  return { text, raw, terms, expanded };
}

/** Stem a corpus string the same way, keeping duplicates for term frequency. */
export function indexTerms(input: string): string[] {
  const out: string[] = [];
  for (const t of tokenize(normalize(input))) {
    if (STOPWORDS.has(t)) continue;
    const s = stem(t);
    if (s.length >= 2) out.push(s);
  }
  return out;
}

/**
 * Ordinary English that happens not to appear in the intent phrasings. Typo
 * repair must leave these alone: without the guard, "any" is one edit from
 * "an" and "have you done any internships" quietly becomes a different
 * question.
 */
export function isCommonWord(token: string): boolean {
  return STOPWORDS.has(token) || CONTENT_NOISE.has(token);
}

/** Terms for the work corpus — `indexTerms` minus the question scaffolding. */
export function contentTerms(input: string): string[] {
  return indexTerms(input).filter((t) => !CONTENT_NOISE.has(t));
}

/** Content-side view of an already-analyzed query. */
export function contentOf(a: Analysis): string[] {
  return a.terms.filter((t) => !CONTENT_NOISE.has(t));
}
