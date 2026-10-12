// Pricing and profit engine. Pure functions — no I/O — so every rule is
// unit-testable. All money is GBP. Retail prices are VAT-inclusive (UK B2C).

const r2 = (n) => Math.round(n * 100) / 100;

export const DEFAULT_ASSUMPTIONS = {
  vatRegistered: true,
  vatRate: 0.2,
  paymentFeePct: 0.044,
  paymentFeeFixedGbp: 0.3,
  platformTxnFeePct: 0.02,
  fxFeePct: 0.03,
  returnsAllowancePct: 0.06,
  cacPerOrderGbp: 1.5,
  otherVariablePerOrderGbp: 0.2,
  targetGrossMarginPct: 0.4,
  minContributionPct: 0.12,
  minContributionGbp: 2.5,
  maxShippingShareOfNet: 0.25,
  maxAutoPriceChangePct: 0.1,
  uncompetitiveTolerancePct: 0.15,
};

export function withDefaults(a = {}) {
  const out = { ...DEFAULT_ASSUMPTIONS };
  for (const [k, v] of Object.entries(a)) if (!k.startsWith('_') && v !== undefined) out[k] = v;
  return out;
}

/**
 * Contribution calculation for one unit.
 * @param {object} p  { priceIncVat, supplierCost, shippingCost, competitorPrice? }
 *   supplierCost/shippingCost are what you pay the supplier, net of any VAT
 *   you can reclaim (enter gross if you are not VAT-registered).
 */
export function calculate(p, assumptions = {}) {
  const a = withDefaults(assumptions);
  const price = Number(p.priceIncVat);
  const cost = Number(p.supplierCost);
  const ship = Number(p.shippingCost ?? 0);
  if (!(price > 0)) throw new Error('priceIncVat must be > 0');
  if (!(cost >= 0) || !(ship >= 0)) throw new Error('costs must be >= 0');

  const vat = a.vatRegistered ? price - price / (1 + a.vatRate) : 0;
  const netRevenue = price - vat;
  // Card/PayPal fees are charged on the gross amount the customer pays.
  const paymentFees = price * a.paymentFeePct + a.paymentFeeFixedGbp;
  const platformFees = price * a.platformTxnFeePct;
  const fxFees = price * a.fxFeePct;
  const returnsAllowance = netRevenue * a.returnsAllowancePct;
  const landedCost = cost + ship;
  const grossProfit = netRevenue - landedCost;
  const grossMarginPct = grossProfit / netRevenue;
  const variable = paymentFees + platformFees + fxFees + returnsAllowance + a.cacPerOrderGbp + a.otherVariablePerOrderGbp;
  const contribution = grossProfit - variable;
  const contributionPct = contribution / netRevenue;

  const flags = [];
  if (contribution < 0) flags.push('negative_margin');
  if (grossMarginPct < a.targetGrossMarginPct) flags.push('below_target_gross_margin');
  if (contribution < a.minContributionGbp || contributionPct < a.minContributionPct) flags.push('poor_contribution');
  if (netRevenue > 0 && ship / netRevenue > a.maxShippingShareOfNet) flags.push('excessive_shipping');
  if (p.competitorPrice && price > p.competitorPrice * (1 + a.uncompetitiveTolerancePct)) flags.push('uncompetitive_price');

  return {
    priceIncVat: r2(price),
    vat: r2(vat),
    netRevenue: r2(netRevenue),
    supplierCost: r2(cost),
    shippingCost: r2(ship),
    landedCost: r2(landedCost),
    grossProfit: r2(grossProfit),
    grossMarginPct: r2(grossMarginPct * 100) / 100,
    paymentFees: r2(paymentFees),
    platformFees: r2(platformFees),
    fxFees: r2(fxFees),
    returnsAllowance: r2(returnsAllowance),
    acquisitionCost: r2(a.cacPerOrderGbp),
    otherVariable: r2(a.otherVariablePerOrderGbp),
    contribution: r2(contribution),
    contributionPct: r2(contributionPct * 100) / 100,
    flags,
    acceptable: !flags.some((f) => ['negative_margin', 'below_target_gross_margin', 'poor_contribution', 'excessive_shipping'].includes(f)),
  };
}

// Round up to a "x.99" style retail price, never below the input.
export function retailRound(price) {
  const up = Math.ceil(price);
  const candidate = up - 0.01;
  return r2(candidate >= price ? candidate : up + 0.99);
}

/**
 * Lowest VAT-inclusive price that meets the target gross margin AND the
 * minimum contribution rules. Returns null if no price under the ceiling works.
 */
export function recommendPrice(p, assumptions = {}, ceiling = 500) {
  const a = withDefaults(assumptions);
  const landed = Number(p.supplierCost) + Number(p.shippingCost ?? 0);
  const vatFactor = a.vatRegistered ? 1 + a.vatRate : 1;
  // Starting point from the gross-margin target alone.
  let price = Math.max(1, (landed / (1 - a.targetGrossMarginPct)) * vatFactor);
  for (let i = 0; i < 2000 && price <= ceiling; i++) {
    const rounded = retailRound(price);
    const c = calculate({ ...p, priceIncVat: rounded }, a);
    if (c.contribution >= a.minContributionGbp && c.contributionPct >= a.minContributionPct && c.grossMarginPct >= a.targetGrossMarginPct) {
      return { price: rounded, breakdown: c };
    }
    price = rounded + 0.5;
  }
  return null;
}

// Price at which contribution is exactly zero (the absolute floor).
export function breakEvenPrice(p, assumptions = {}) {
  let lo = 0.01, hi = 10000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (calculate({ ...p, priceIncVat: mid }, assumptions).contribution >= 0) hi = mid; else lo = mid;
  }
  return r2(hi);
}

/**
 * Guard for automatic price changes. Returns { action: 'apply' | 'approval' | 'reject', reason }.
 * - Never below break-even.
 * - Changes beyond maxAutoPriceChangePct need owner approval.
 * - If price changes are paused, everything needs approval.
 */
export function evaluatePriceChange({ currentPrice, proposedPrice, supplierCost, shippingCost }, assumptions = {}, { paused = false } = {}) {
  const a = withDefaults(assumptions);
  const floor = breakEvenPrice({ supplierCost, shippingCost }, a);
  if (!(proposedPrice > 0)) return { action: 'reject', reason: 'Proposed price must be positive' };
  if (proposedPrice < floor) return { action: 'reject', reason: `Proposed £${proposedPrice} is below break-even £${floor}` };
  const changePct = currentPrice > 0 ? Math.abs(proposedPrice - currentPrice) / currentPrice : 1;
  if (paused) return { action: 'approval', reason: 'Automatic price changes are paused', changePct: r2(changePct) };
  if (changePct > a.maxAutoPriceChangePct) {
    return { action: 'approval', reason: `Change of ${(changePct * 100).toFixed(1)}% exceeds the ${(a.maxAutoPriceChangePct * 100).toFixed(0)}% automatic limit`, changePct: r2(changePct) };
  }
  return { action: 'apply', reason: 'Within automatic limits', changePct: r2(changePct) };
}

/**
 * Supplier cost monitor for a product row. Decides whether the listing is
 * still viable and what to do about it.
 */
export function reviewProduct(product, latest, assumptions = {}, { pricePaused = false } = {}) {
  const a = withDefaults(assumptions);
  const cost = latest.supplierCost ?? product.cost_gbp;
  const ship = latest.shippingCost ?? product.shipping_gbp;
  const result = { sku: product.sku, actions: [], previousCost: product.cost_gbp, cost, shipping: ship };
  if (cost == null || product.price_gbp == null) {
    result.actions.push({ type: 'pause', reason: 'Missing verified cost or price' });
    return result;
  }
  const current = calculate({ priceIncVat: product.price_gbp, supplierCost: cost, shippingCost: ship, competitorPrice: product.competitor_price_gbp }, a);
  result.current = current;
  if (product.cost_gbp != null && cost > product.cost_gbp) {
    result.actions.push({ type: 'alert', reason: `Supplier cost rose from £${product.cost_gbp} to £${cost}` });
  }
  if (current.flags.includes('excessive_shipping')) result.actions.push({ type: 'alert', reason: 'Shipping cost exceeds configured share of revenue' });
  if (current.flags.includes('uncompetitive_price')) result.actions.push({ type: 'alert', reason: 'Price is above the competitor reference by more than the tolerance' });
  if (current.flags.includes('negative_margin')) {
    result.actions.push({ type: 'pause', reason: 'Negative contribution at current price' });
  }
  if (!current.acceptable) {
    const rec = recommendPrice({ supplierCost: cost, shippingCost: ship }, a);
    if (rec) {
      const decision = evaluatePriceChange({ currentPrice: product.price_gbp, proposedPrice: rec.price, supplierCost: cost, shippingCost: ship }, a, { paused: pricePaused });
      result.actions.push({ type: 'price_change', proposedPrice: rec.price, decision });
    } else {
      result.actions.push({ type: 'pause', reason: 'No viable price under ceiling' });
    }
  }
  return result;
}
