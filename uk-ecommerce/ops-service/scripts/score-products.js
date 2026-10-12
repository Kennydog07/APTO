// Product scoring engine CLI.
// Usage: npm run score-products -- ../product-data/PRODUCT-SHORTLIST.csv [--json]
import { readFileSync } from 'node:fs';
import { loadConfig } from '../src/config.js';
import { parseCsv, scoreProduct } from '../src/scoring.js';

const file = process.argv[2] ?? '../product-data/PRODUCT-SHORTLIST.csv';
const cfg = loadConfig();
const rows = parseCsv(readFileSync(file, 'utf8'));
const scored = rows.map((r) => scoreProduct(r, cfg.pricing)).sort((a, b) => b.score - a.score);
if (process.argv.includes('--json')) { console.log(JSON.stringify(scored, null, 2)); process.exit(0); }
console.log(`Scored ${scored.length} candidates (weights: supplier 25, margin 25, demand 20, safety 15, marketing 10, repeat 5)\n`);
for (const s of scored) {
  console.log(`${s.score.toFixed(1).padStart(5)}  ${s.status.padEnd(19)} ${s.sku}  ${s.name}${s.provisional ? '  [PROVISIONAL]' : ''}`);
  for (const r of s.reasons) console.log(`        - ${r}`);
}
