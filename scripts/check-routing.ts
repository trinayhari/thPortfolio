/**
 * Routing calibration check.  npm run check:nlp  [-- "a query to explain"]
 *
 * Every query in router.test-queries.ts must land where it says. Run this
 * after touching the thresholds in router.ts, the synonym tables in text.ts,
 * or the intent phrasings — all three interact.
 */
import { route } from '../src/terminal/nlp/router';
import { QUERIES } from '../src/terminal/nlp/router.test-queries';

let pass = 0;
const fails: string[] = [];

for (const { q, expect } of QUERIES) {
  const r = route(q);
  let got: string;
  if (r.kind === 'intent') got = r.intent!;
  else if (r.kind === 'entity') got = 'entity:' + r.entity;
  else if (r.kind === 'topic') got = 'topic';
  else got = 'unknown';

  const ok = got === expect;
  if (ok) pass++;
  else {
    const detail =
      r.kind === 'topic' ? ' [' + (r.docs || []).map((d) => d.id).join(',') + ']' : '';
    fails.push(
      `  ${q.padEnd(42)} want ${expect.padEnd(18)} got ${got.padEnd(18)} conf ${r.confidence.toFixed(3)}${detail}`
    );
  }
}

console.log(`\n${pass}/${QUERIES.length} routed correctly\n`);
if (fails.length) {
  console.log('FAILURES');
  console.log(fails.join('\n'));
}

/* `npm run check:nlp -- "some query"` explains one routing decision */
const probe = process.argv[2];
if (probe) {
  console.log('\nPROBE:', probe);
  console.dir(route(probe), { depth: 4 });
}

/* Non-zero exit is the whole point of the gate: `npm run build` chains this
   ahead of vite, so a routing regression fails the deploy instead of
   shipping a terminal that shrugs at questions it used to answer. */
if (fails.length) {
  console.log(`\n✗ ${fails.length} routing regression${fails.length > 1 ? 's' : ''} — not shipping.\n`);
  process.exit(1);
}
