/**
 * Okapi BM25 — the retrieval half of the router.
 *
 * Plain term-overlap counting (what the first version of this terminal did)
 * rewards long documents and common words equally. BM25 fixes both: rare terms
 * count for more, repeated terms saturate, and length is normalized away.
 */

const K1 = 1.5;
const B = 0.75;

export type Indexed<T> = { id: string; terms: string[]; boost: number; value: T };

export type Hit<T> = {
  id: string;
  score: number;
  /**
   * Share of the query's total inverse document frequency that this document
   * actually matched, 0..1. Score alone can look healthy when a long query
   * connects on one throwaway word; coverage says how much of what the person
   * asked for was found.
   */
  coverage: number;
  value: T;
};

export class BM25<T> {
  private docs: (Indexed<T> & { tf: Map<string, number>; len: number })[] = [];
  private df = new Map<string, number>();
  private avgLen = 0;

  constructor(entries: Indexed<T>[]) {
    for (const e of entries) {
      const tf = new Map<string, number>();
      for (const t of e.terms) tf.set(t, (tf.get(t) || 0) + 1);
      for (const t of tf.keys()) this.df.set(t, (this.df.get(t) || 0) + 1);
      this.docs.push({ ...e, tf, len: e.terms.length || 1 });
    }
    this.avgLen = this.docs.reduce((s, d) => s + d.len, 0) / (this.docs.length || 1);
  }

  /** Inverse document frequency, floored so a term in every doc still counts a little. */
  idf(term: string): number {
    const n = this.docs.length;
    const df = this.df.get(term) || 0;
    return Math.max(0.05, Math.log(1 + (n - df + 0.5) / (df + 0.5)));
  }

  /** Terms actually present in the index — the vocabulary fuzzy matching aims at. */
  vocabulary(): string[] {
    return [...this.df.keys()];
  }

  /**
   * Score every document, returned best-first. Scores are divided by the
   * query's own best-possible score, so the result is roughly 0..1 and
   * comparable between queries of different lengths.
   */
  search(queryTerms: string[], limit = 8, optional?: Set<string>): Hit<T>[] {
    if (!queryTerms.length || !this.docs.length) return [];
    /* Terms the visitor actually typed set the bar. Synonym guesses are added
       to the bar only when they pay off, so an expansion that matches nothing
       cannot quietly halve every score. */
    const required = queryTerms.reduce((s, t) => s + (optional?.has(t) ? 0 : this.idf(t)), 0);

    const hits: Hit<T>[] = [];
    for (const d of this.docs) {
      let score = 0;
      let matchedIdf = 0;
      let bonusCeiling = 0;
      for (const t of queryTerms) {
        const f = d.tf.get(t);
        if (!f) continue;
        const idf = this.idf(t);
        const norm = f * (K1 + 1);
        const denom = f + K1 * (1 - B + (B * d.len) / this.avgLen);
        score += idf * (norm / denom);
        matchedIdf += idf;
        if (optional?.has(t)) bonusCeiling += idf;
      }
      if (score > 0) {
        const ceiling = Math.max(0.001, required + bonusCeiling);
        hits.push({ id: d.id, score: (score / ceiling) * d.boost, coverage: matchedIdf / ceiling, value: d.value });
      }
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
