/**
 * Typo tolerance. Damerau-Levenshtein with an early bail-out, so a query token
 * only ever compares against the small domain vocabulary and stops as soon as
 * it exceeds the allowed distance.
 */

/** Edit distance between two strings, giving up once it passes `max`. */
export function editDistance(a: string, b: string, max = 2): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  const m = a.length;
  const n = b.length;
  let prev2: number[] = [];
  let prev: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  let curr: number[] = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    const lo = Math.max(1, i - max);
    const hi = Math.min(n, i + max);
    /* cells outside the band can never beat `max`, so they are poisoned */
    for (let j = 1; j < lo; j++) curr[j] = max + 1;
    for (let j = hi + 1; j <= n; j++) curr[j] = max + 1;

    for (let j = lo; j <= hi; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      /* transposition — "recieve" vs "receive" is one edit, not two */
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1);
      }
      curr[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = curr;
    curr = new Array(n + 1);
  }
  return prev[n];
}

/** How much misspelling to forgive, scaled to word length. */
export function toleranceFor(word: string): number {
  if (word.length <= 3) return 0;
  if (word.length <= 5) return 1;
  return 2;
}

export type FuzzyHit = { term: string; distance: number };

/** Closest vocabulary entry to `token`, or null if nothing is close enough. */
export function nearest(token: string, vocabulary: Iterable<string>): FuzzyHit | null {
  const max = toleranceFor(token);
  if (max === 0) return null;
  let best: FuzzyHit | null = null;
  for (const term of vocabulary) {
    if (term === token) return { term, distance: 0 };
    const d = editDistance(token, term, max);
    if (d <= max && (!best || d < best.distance)) best = { term, distance: d };
    if (best?.distance === 1) break;
  }
  return best;
}
