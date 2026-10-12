import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, recommendPrice, breakEvenPrice, evaluatePriceChange, reviewProduct, retailRound, DEFAULT_ASSUMPTIONS as A } from '../src/pricing.js';

test('contribution maths matches a hand calculation (defaults: not VAT-registered, Shopify Payments)', () => {
  const c = calculate({ priceIncVat: 24.99, supplierCost: 6, shippingCost: 2.5 }, A);
  // net = 24.99; fees = 24.99*2% + 0.25 = 0.7498; returns = 1.4994; CAC 1.5; other 0.2
  assert.equal(c.vat, 0);
  assert.equal(c.netRevenue, 24.99);
  assert.equal(c.paymentFees, 0.75);
  assert.equal(c.grossMarginPct, 0.6599);
  assert.equal(c.contribution, 12.54);
  assert.equal(c.acceptable, true);
});

// VAT-registered with cross-border PayPal-style fees (worst case kept as a regression check).
const WORST = { ...A, vatRegistered: true, paymentFeePct: 0.044, paymentFeeFixedGbp: 0.3, platformTxnFeePct: 0.02, fxFeePct: 0.03 };

test('contribution maths matches a hand calculation (VAT-registered, high-fee case)', () => {
  const c = calculate({ priceIncVat: 24.99, supplierCost: 6, shippingCost: 2.5 }, WORST);
  // net = 24.99/1.2 = 20.825; fees = 1.39956 + 0.4998 + 0.7497; returns = 1.2495; CAC 1.5; other 0.2
  assert.equal(c.netRevenue, 20.83);
  assert.equal(c.landedCost, 8.5);
  assert.equal(c.contribution, 6.73);
  assert.equal(c.grossMarginPct, 0.5918);
  assert.deepEqual(c.flags, []);
  assert.equal(c.acceptable, true);
});

test('becoming VAT-registered removes 1/6 of the VAT-inclusive price from revenue', () => {
  const c = calculate({ priceIncVat: 24, supplierCost: 5, shippingCost: 0 }, { ...A, vatRegistered: true });
  assert.equal(c.vat, 4);
  assert.equal(c.netRevenue, 20);
});

test('negative margin and excessive shipping are flagged and rejected', () => {
  const c = calculate({ priceIncVat: 12, supplierCost: 8, shippingCost: 4 }, A);
  assert.ok(c.flags.includes('negative_margin'));
  assert.ok(c.flags.includes('excessive_shipping'));
  assert.equal(c.acceptable, false);
});

test('uncompetitive price flagged against competitor reference', () => {
  const c = calculate({ priceIncVat: 30, supplierCost: 5, shippingCost: 1, competitorPrice: 20 }, A);
  assert.ok(c.flags.includes('uncompetitive_price'));
});

test('recommended price meets every rule and ends in .99', () => {
  const r = recommendPrice({ supplierCost: 7.2, shippingCost: 2.95 }, A);
  assert.ok(r);
  assert.match(r.price.toFixed(2), /\.99$/);
  assert.ok(r.breakdown.grossMarginPct >= A.targetGrossMarginPct);
  assert.ok(r.breakdown.contribution >= A.minContributionGbp);
  assert.ok(r.breakdown.acceptable);
});

test('break-even price gives ~zero contribution', () => {
  const p = breakEvenPrice({ supplierCost: 6, shippingCost: 2.5 }, A);
  const c = calculate({ priceIncVat: p, supplierCost: 6, shippingCost: 2.5 }, A);
  assert.ok(Math.abs(c.contribution) <= 0.02);
});

test('retail rounding', () => {
  assert.equal(retailRound(23.1), 23.99);
  assert.equal(retailRound(23.99), 23.99);
  assert.equal(retailRound(24), 24.99);
});

test('price-change guard: small change applies, large needs approval, below break-even rejected, paused needs approval', () => {
  const base = { currentPrice: 24.99, supplierCost: 6, shippingCost: 2.5 };
  assert.equal(evaluatePriceChange({ ...base, proposedPrice: 25.99 }, A).action, 'apply');
  assert.equal(evaluatePriceChange({ ...base, proposedPrice: 29.99 }, A).action, 'approval');
  assert.equal(evaluatePriceChange({ ...base, proposedPrice: 5 }, A).action, 'reject');
  assert.equal(evaluatePriceChange({ ...base, proposedPrice: 25.99 }, A, { paused: true }).action, 'approval');
});

test('supplier cost increase triggers alert and an approval-gated price change; extreme cost pauses', () => {
  const product = { sku: 'S', price_gbp: 24.99, cost_gbp: 6, shipping_gbp: 2.5 };
  const r = reviewProduct(product, { supplierCost: 14 }, A);
  assert.ok(r.actions.some((a) => a.type === 'alert'));
  const pc = r.actions.find((a) => a.type === 'price_change');
  assert.ok(pc && pc.decision.action === 'approval', 'big rise must need approval');
  const r2 = reviewProduct(product, { supplierCost: 30 }, A);
  assert.ok(r2.actions.some((a) => a.type === 'pause'));
});
