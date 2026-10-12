import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreProduct, scoreNiche, parseCsv, WEIGHTS } from '../src/scoring.js';
import { DEFAULT_ASSUMPTIONS as A } from '../src/pricing.js';

const good = {
  candidate_id: 'C1', product_name: 'Stackable pantry bin', category: 'Kitchen organisation', materials: 'PP plastic',
  supplier_sku: 'SUP-1', supplier_cost_gbp: '6', shipping_cost_gbp: '2.5', est_selling_price_gbp: '24.99', cost_verified: 'yes', stock_verified: 'yes',
  uk_warehouse: 'yes', tracked_delivery: 'yes', supplier_api: 'yes', uk_delivery_estimate: '2-4 working days (supplier)', imagery_rights: 'yes',
  safety_risk: 'low', returns_risk: 'low', demand_score: '7', marketing_score: '8', repeat_score: '6',
};

test('weights sum to 100%', () => {
  assert.equal(Math.round(Object.values(WEIGHTS).reduce((a, b) => a + b, 0) * 100), 100);
});

test('fully verified viable product is ready for owner approval', () => {
  const s = scoreProduct(good, A);
  assert.equal(s.status, 'ready_for_approval');
  assert.equal(s.provisional, false);
  assert.ok(s.score > 60, `score ${s.score}`);
});

test('unverified data cannot reach approval and is labelled provisional', () => {
  const s = scoreProduct({ ...good, cost_verified: 'no', imagery_rights: 'unconfirmed', uk_delivery_estimate: 'VERIFY' }, A);
  assert.equal(s.status, 'needs_verification');
  assert.equal(s.provisional, true);
  assert.ok(s.reasons.some((r) => /imagery/i.test(r)));
});

test('excluded categories and high safety risk are rejected', () => {
  assert.equal(scoreProduct({ ...good, product_name: 'Heated lunch box', category: 'Electrical' }, A).status, 'reject');
  assert.equal(scoreProduct({ ...good, product_name: 'Baby bath seat' }, A).status, 'reject');
  assert.equal(scoreProduct({ ...good, safety_risk: 'high' }, A).status, 'reject');
});

test('poor economics are rejected', () => {
  assert.equal(scoreProduct({ ...good, supplier_cost_gbp: '15', est_selling_price_gbp: '19.99' }, A).status, 'reject');
});

test('niche score is weighted and provisional unless all evidence verified', () => {
  const c = (score, evidence = 'provisional') => ({ score, evidence });
  const n = scoreNiche({ name: 'X', criteria: { supplier: c(10), margin: c(10), demand: c(10), safety: c(10), marketing: c(10), repeat: c(10) } });
  assert.equal(n.score, 100);
  assert.equal(n.provisional, true);
});

test('CSV parser handles quotes, commas and newlines', () => {
  const rows = parseCsv('a,b,c\n1,"x, y","multi\nline"\n2,"say ""hi""",z\n');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].b, 'x, y');
  assert.equal(rows[0].c, 'multi\nline');
  assert.equal(rows[1].b, 'say "hi"');
});
