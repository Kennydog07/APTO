// Builds product-data/PRODUCT-SHORTLIST.csv. Supplier/SKU/cost/stock/delivery
// fields are intentionally left as TO VERIFY — they must come from a real
// supplier listing. target_max_landed_cost_gbp is computed by the pricing
// engine: the highest supplier cost + shipping that still meets the margin
// rules at the provisional selling price.
import { writeFileSync } from 'node:fs';
import { calculate } from '../ops-service/src/pricing.js';
import { loadJson } from '../ops-service/src/config.js';

const A = loadJson('pricing.json');
const maxLanded = (price) => { let lo = 0, hi = price; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (calculate({ priceIncVat: price, supplierCost: m, shippingCost: 0 }, A).acceptable) lo = m; else hi = m; } return Math.floor(lo * 100) / 100; };

const P = [
  ['NO-01', 'Two-tier sliding under-sink organiser', 'Kitchen organisation', 'Powder-coated steel frame; PP baskets', 24.99, 'low', 'low', 'Check load rating and sharp edges on frame; stable footprint', 7, 8, 5],
  ['NO-02', 'Expandable bamboo drawer dividers (set of 4)', 'Kitchen organisation', 'Bamboo; spring-loaded', 16.99, 'low', 'low', 'Spring tension can pinch — check finish and mould-free treatment evidence', 7, 8, 6],
  ['NO-03', 'Stackable metal cupboard shelf riser (set of 2)', 'Kitchen organisation', 'Coated steel', 14.99, 'low', 'low', 'Load rating must be supplier-stated; no sharp edges', 6, 7, 6],
  ['NO-04', 'Over-door hooks (set of 4)', 'Home organisation', 'Steel with protective pads', 12.99, 'low', 'low', 'Door-thickness fit must be stated to avoid returns', 6, 6, 5],
  ['NO-05', 'Collapsible fabric storage boxes with lids (set of 3)', 'Home organisation', 'Non-woven fabric; card inserts', 22.99, 'low', 'low', 'Textile — confirm no flammability claims; check odour/finish', 7, 9, 7],
  ['NO-06', 'Cascading wardrobe space-saver hangers (set of 6)', 'Wardrobe organisation', 'ABS plastic', 12.99, 'low', 'low', 'Load per hook to be stated by supplier', 6, 8, 6],
  ['NO-07', 'Under-bed storage bags with clear window (set of 2)', 'Bedroom storage', 'Non-woven fabric; PVC window; zip', 18.99, 'low', 'low', 'PVC window: request REACH/phthalate compliance statement', 6, 7, 5],
  ['NO-08', 'Non-slip turntable organiser (2-pack)', 'Kitchen organisation', 'PP plastic; non-slip base', 13.99, 'low', 'low', 'Not marketed for direct food contact; containers only', 6, 8, 6],
  ['NO-09', 'Over-door clear-pocket organiser', 'Home organisation', 'PVC pockets; fabric; metal hooks', 17.99, 'low', 'medium', 'PVC: request REACH/phthalate statement before listing', 6, 7, 4],
  ['NO-10', 'No-drill corner shower caddy (adhesive)', 'Bathroom organisation', 'Aluminium; adhesive pads', 19.99, 'medium', 'medium', 'Adhesive failure risk — only list with clear supplier load rating and fitting instructions', 7, 8, 4],
  ['NO-11', 'Cable management box', 'Desk & home office', 'ABS plastic', 16.99, 'low', 'medium', 'Never claim fire safety unless certified; ventilation guidance needed', 6, 6, 3],
  ['NO-12', 'Stackable 3-tier shoe rack', 'Hallway storage', 'Steel tubes; PP connectors', 24.99, 'medium', 'low', 'Bulky — courier cost may breach the 25% shipping rule; check carefully', 6, 7, 3],
  ['NO-13', 'Vacuum storage bags with hand pump (set of 6)', 'Bedroom storage', 'PA/PE film; valve; hand pump', 19.99, 'medium', 'low', 'Valve failure = returns; no electrical pump to avoid electrical compliance', 7, 7, 6],
  ['NO-14', 'Clear stackable drawer organiser trays (set of 8)', 'Bathroom organisation', 'PP plastic', 14.99, 'low', 'low', 'Sizes must be listed precisely to avoid fit returns', 6, 8, 7],
];
const head = ['candidate_id', 'product_name', 'category', 'materials', 'supplier_code', 'supplier', 'supplier_sku', 'supplier_variant_id', 'specifications', 'supplier_cost_gbp', 'shipping_cost_gbp', 'cost_verified', 'uk_delivery_estimate', 'stock_verified', 'uk_warehouse', 'tracked_delivery', 'supplier_api', 'imagery_rights', 'est_selling_price_gbp', 'target_max_landed_cost_gbp', 'returns_risk', 'safety_risk', 'safety_notes', 'demand_score', 'marketing_score', 'repeat_score', 'evidence_status'];
const q = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const rows = P.map(([id, name, cat, mat, price, safety, returns, notes, d, m, r]) => [id, name, cat, mat, '', 'TO VERIFY (Avasam UK / CJ UK warehouse)', 'TO VERIFY', '', 'TO VERIFY from supplier listing', '', '', 'no', 'VERIFY with supplier', 'no', 'no', 'no', 'no', 'no', price.toFixed(2), maxLanded(price).toFixed(2), returns, safety, notes, d, m, r, 'PROVISIONAL — selling price is a planning assumption; scores are judgement, not measured demand']);
writeFileSync(new URL('../PRODUCT-SHORTLIST.csv', import.meta.url), [head, ...rows].map((r) => r.map(q).join(',')).join('\n') + '\n');
console.log(rows.map((r) => `${r[0]} £${r[18]} -> max landed £${r[19]}`).join('\n'));
