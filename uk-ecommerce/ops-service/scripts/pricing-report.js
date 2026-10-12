// Pricing dashboard (terminal + HTML). Shows, for each candidate, the
// maximum landed cost that still meets the margin rules at the target price.
// Usage: npm run pricing-report -- ../PRODUCT-SHORTLIST.csv [out.html]
import { readFileSync, writeFileSync } from 'node:fs';
import { loadConfig } from '../src/config.js';
import { parseCsv } from '../src/scoring.js';
import { calculate, breakEvenPrice } from '../src/pricing.js';

const [file = '../PRODUCT-SHORTLIST.csv', out] = process.argv.slice(2);
const cfg = loadConfig();
const rows = parseCsv(readFileSync(file, 'utf8'));

// Highest landed cost that keeps the product acceptable at the given price.
function maxLandedCost(price) {
  let lo = 0, hi = price;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (calculate({ priceIncVat: price, supplierCost: mid, shippingCost: 0 }, cfg.pricing).acceptable) lo = mid; else hi = mid;
  }
  return Math.floor(lo * 100) / 100;
}

const data = rows.map((r) => {
  const price = Number(r.est_selling_price_gbp);
  const hasCost = r.supplier_cost_gbp !== '' && /^(yes|true|verified)$/i.test(r.cost_verified);
  const calc = hasCost ? calculate({ priceIncVat: price, supplierCost: Number(r.supplier_cost_gbp), shippingCost: Number(r.shipping_cost_gbp || 0) }, cfg.pricing) : null;
  return { id: r.candidate_id, name: r.product_name, price, maxLanded: maxLandedCost(price), calc,
    breakEven: hasCost ? breakEvenPrice({ supplierCost: Number(r.supplier_cost_gbp), shippingCost: Number(r.shipping_cost_gbp || 0) }, cfg.pricing) : null };
});
console.log('Candidate                                  Target £   Max landed cost £   Verified contribution');
for (const d of data) console.log(`${(d.id + ' ' + d.name).slice(0, 42).padEnd(42)} ${d.price.toFixed(2).padStart(8)}   ${d.maxLanded.toFixed(2).padStart(17)}   ${d.calc ? `£${d.calc.contribution} (${d.calc.flags.join(', ') || 'ok'})` : 'awaiting verified supplier cost'}`);
if (out) {
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  writeFileSync(out, `<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pricing dashboard</title>
<style>body{font:15px system-ui;margin:16px;background:#f6f5f2;color:#1f2421}table{border-collapse:collapse;width:100%}td,th{padding:6px;border-bottom:1px solid #ddd;text-align:left}.bad{color:#a12a2a}.ok{color:#2e6b3a}</style>
<h1>Pricing dashboard</h1><p>Generated ${new Date().toISOString()}. Assumptions from config/pricing.json (provisional until fees are verified).</p>
<table><tr><th>Candidate</th><th>Target price</th><th>Max landed cost to stay viable</th><th>Contribution (verified costs only)</th><th>Break-even price</th></tr>
${data.map((d) => `<tr><td>${esc(d.id)} ${esc(d.name)}</td><td>£${d.price.toFixed(2)}</td><td>£${d.maxLanded.toFixed(2)}</td><td class="${d.calc ? (d.calc.acceptable ? 'ok' : 'bad') : ''}">${d.calc ? `£${d.calc.contribution} ${esc(d.calc.flags.join(', '))}` : 'Awaiting verified supplier cost'}</td><td>${d.breakEven ? `£${d.breakEven}` : '—'}</td></tr>`).join('')}
</table></html>`);
  console.log(`\nHTML written to ${out}`);
}
