// Product and niche scoring engine. Scores are only as good as their inputs:
// anything estimated is labelled "provisional", and products whose cost,
// stock, delivery or imagery rights are unverified cannot reach approval.
import { calculate } from './pricing.js';

export const WEIGHTS = {
  supplier: 0.25, // supplier reliability and UK delivery
  margin: 0.25, // potential contribution margin
  demand: 0.2, // demand and differentiation
  safety: 0.15, // product safety and returns risk (higher = safer)
  marketing: 0.1, // organic marketing potential
  repeat: 0.05, // repeat sales and bundling
};

/** Niche score: each criterion 0–10 with an evidence flag. */
export function scoreNiche(niche) {
  let total = 0;
  let provisional = false;
  const breakdown = {};
  for (const [k, w] of Object.entries(WEIGHTS)) {
    const c = niche.criteria[k];
    if (!c || typeof c.score !== 'number' || c.score < 0 || c.score > 10) throw new Error(`Niche ${niche.name}: criterion ${k} needs a 0-10 score`);
    if (c.evidence !== 'verified') provisional = true;
    breakdown[k] = Math.round(c.score * w * 10 * 10) / 10;
    total += c.score * w * 10;
  }
  return { name: niche.name, score: Math.round(total * 10) / 10, provisional, breakdown };
}

// Categories excluded at launch (owner brief, section 5).
const EXCLUDED = [
  /\bfood\b/i, /supplement/i, /cosmetic/i, /skin ?care/i, /medic/i, /\bbaby\b/i, /\binfant\b/i, /child(ren)?'?s? safety/i, /\btoy\b/i,
  /\belectric(al)?\b/i, /\bbattery\b/i, /lithium/i, /\bcharger\b/i, /\bheated?\b/i, /replica/i, /\bbranded\b/i, /\bglass\b/i, /ceramic/i,
];

const yes = (v) => ['true', 'yes', 'y', '1', 'confirmed', 'verified'].includes(String(v ?? '').trim().toLowerCase());
const n = (v) => (v === '' || v === undefined || v === null ? null : Number(v));

/**
 * Score one candidate product (one row of PRODUCT-SHORTLIST.csv).
 * Returns { sku, score, status, reasons[], pricing? }
 * status: 'reject' | 'needs_verification' | 'ready_for_approval'
 */
export function scoreProduct(row, assumptions = {}) {
  const reasons = [];
  const verificationGaps = [];
  const text = `${row.product_name ?? ''} ${row.category ?? ''} ${row.materials ?? ''}`;
  for (const re of EXCLUDED) if (re.test(text)) reasons.push(`Excluded category/material match: ${re.source}`);
  if (String(row.safety_risk).toLowerCase() === 'high') reasons.push('High product-safety risk');

  const cost = n(row.supplier_cost_gbp);
  const ship = n(row.shipping_cost_gbp);
  const price = n(row.est_selling_price_gbp);

  if (!yes(row.cost_verified) || cost === null) verificationGaps.push('Supplier cost not verified');
  if (!yes(row.stock_verified)) verificationGaps.push('Stock availability not verified');
  if (!yes(row.uk_warehouse)) verificationGaps.push('UK warehouse stock not confirmed');
  if (!row.uk_delivery_estimate || /verify|unknown|tbc/i.test(row.uk_delivery_estimate)) verificationGaps.push('UK delivery estimate not supplied by supplier');
  if (!yes(row.imagery_rights)) verificationGaps.push('Product imagery rights not confirmed');
  if (!row.supplier_sku || /verify|tbc/i.test(row.supplier_sku)) verificationGaps.push('Supplier SKU missing');

  // Sub-scores 0–10.
  const s = {};
  s.supplier = (yes(row.uk_warehouse) ? 5 : 1) + (yes(row.tracked_delivery) ? 3 : 0) + (yes(row.supplier_api) ? 2 : 1);
  let pricing = null;
  if (cost !== null && price) {
    pricing = calculate({ priceIncVat: price, supplierCost: cost, shippingCost: ship ?? 0 }, assumptions);
    s.margin = Math.max(0, Math.min(10, pricing.contributionPct * 25)); // 40% contribution → 10
    if (!pricing.acceptable) reasons.push(`Unacceptable economics at £${price}: ${pricing.flags.join(', ')}`);
  } else {
    s.margin = 0;
  }
  s.demand = Math.max(0, Math.min(10, n(row.demand_score) ?? 0));
  const risk = { low: 9, medium: 5, high: 0 }[String(row.safety_risk).toLowerCase()] ?? 3;
  const returns = { low: 1, medium: 0, high: -3 }[String(row.returns_risk).toLowerCase()] ?? -1;
  s.safety = Math.max(0, Math.min(10, risk + returns));
  s.marketing = Math.max(0, Math.min(10, n(row.marketing_score) ?? 0));
  s.repeat = Math.max(0, Math.min(10, n(row.repeat_score) ?? 0));

  let score = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) score += s[k] * w * 10;
  score = Math.round(score * 10) / 10;

  let status = 'ready_for_approval';
  if (reasons.length) status = 'reject';
  else if (verificationGaps.length) status = 'needs_verification';

  return {
    sku: row.candidate_id ?? row.sku,
    name: row.product_name,
    score,
    provisional: verificationGaps.length > 0,
    status,
    reasons: [...reasons, ...verificationGaps],
    subScores: s,
    pricing,
  };
}

// Minimal RFC 4180 CSV parser (quoted fields, embedded commas/newlines).
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((f) => f !== '')) rows.push(row); }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}
