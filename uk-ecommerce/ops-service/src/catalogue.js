// Catalogue operations: product approval, inventory monitoring and the
// pricing monitor. Pausing a product is always allowed (it is the safe
// direction); publishing and price changes respect the pause controls.
import { now } from './db.js';
import { isPaused } from './lib/controls.js';
import { raiseException } from './lib/exceptions.js';
import { requestApproval } from './lib/approvals.js';
import { reviewProduct, evaluatePriceChange } from './pricing.js';
import { scoreProduct } from './scoring.js';

export function upsertProduct(db, p) {
  db.prepare(`INSERT INTO products (sku, title, shopify_product_id, shopify_variant_id, inventory_item_id, supplier, supplier_sku, supplier_variant_id,
      cost_gbp, shipping_gbp, price_gbp, competitor_price_gbp, stock, status, approved, cost_verified, delivery_estimate, specs, handle, image_url, benefits, updated_at)
    VALUES (@sku,@title,@shopify_product_id,@shopify_variant_id,@inventory_item_id,@supplier,@supplier_sku,@supplier_variant_id,
      @cost_gbp,@shipping_gbp,@price_gbp,@competitor_price_gbp,@stock,@status,@approved,@cost_verified,@delivery_estimate,@specs,@handle,@image_url,@benefits,@updated_at)
    ON CONFLICT(sku) DO UPDATE SET title=excluded.title, shopify_product_id=COALESCE(excluded.shopify_product_id, shopify_product_id),
      shopify_variant_id=COALESCE(excluded.shopify_variant_id, shopify_variant_id), inventory_item_id=COALESCE(excluded.inventory_item_id, inventory_item_id),
      supplier=excluded.supplier, supplier_sku=excluded.supplier_sku, supplier_variant_id=excluded.supplier_variant_id, cost_gbp=excluded.cost_gbp,
      shipping_gbp=excluded.shipping_gbp, price_gbp=excluded.price_gbp, competitor_price_gbp=excluded.competitor_price_gbp,
      delivery_estimate=excluded.delivery_estimate, specs=excluded.specs, handle=COALESCE(excluded.handle, handle), image_url=COALESCE(excluded.image_url, image_url), benefits=COALESCE(excluded.benefits, benefits), cost_verified=excluded.cost_verified, updated_at=excluded.updated_at`)
    .run(Object.fromEntries(Object.entries({
      shopify_product_id: null, shopify_variant_id: null, inventory_item_id: null, supplier_variant_id: null, competitor_price_gbp: null,
      stock: null, status: 'draft', approved: 0, cost_verified: 0, delivery_estimate: null, specs: null, handle: null, image_url: null, benefits: null, shipping_gbp: 0, ...p, updated_at: now(),
    }).map(([k, v]) => [k, v === undefined ? null : v])));
  return db.prepare('SELECT * FROM products WHERE sku = ?').get(p.sku);
}

/** Workflow 02: validate a candidate and prepare a Shopify DRAFT listing + approval. */
export async function prepareCandidate(ctx, row) {
  const { db, cfg, shopify } = ctx;
  const s = scoreProduct(row, cfg.pricing);
  if (s.status !== 'ready_for_approval') return { ok: false, score: s };
  const existing = db.prepare('SELECT * FROM products WHERE sku = ?').get(s.sku);
  if (existing?.shopify_product_id) return { ok: true, score: s, product: existing, note: 'Draft already exists' };
  const draft = await shopify.createDraftProduct({
    title: row.product_name, descriptionHtml: row.description_html ?? '', vendor: cfg.support?.storeName ?? 'Store',
    productType: row.category, tags: ['awaiting-approval'], seo: { title: row.product_name, description: (row.seo_description ?? '').slice(0, 160) },
  });
  const product = upsertProduct(db, {
    sku: s.sku, title: row.product_name, shopify_product_id: draft.id, supplier: row.supplier_code, supplier_sku: row.supplier_sku,
    supplier_variant_id: row.supplier_variant_id || null, cost_gbp: Number(row.supplier_cost_gbp), shipping_gbp: Number(row.shipping_cost_gbp || 0),
    price_gbp: Number(row.est_selling_price_gbp), cost_verified: 1, delivery_estimate: row.uk_delivery_estimate, specs: row.specifications,
  });
  requestApproval(db, { type: 'product_publication', ref: s.sku, summary: `Publish ${row.product_name} at £${row.est_selling_price_gbp} (score ${s.score}, contribution £${s.pricing.contribution})`, payload: { score: s } });
  return { ok: true, score: s, product };
}

export async function publishApprovedProduct(ctx, sku) {
  const { db, shopify } = ctx;
  if (isPaused(db, 'pause_product_publication')) return { ok: false, error: 'product_publication_paused' };
  const p = db.prepare('SELECT * FROM products WHERE sku = ?').get(sku);
  if (!p) return { ok: false, error: 'not_found' };
  if (!p.cost_verified) return { ok: false, error: 'cost_not_verified' };
  if (p.shopify_product_id) await shopify.setProductStatus(p.shopify_product_id, 'ACTIVE');
  db.prepare("UPDATE products SET approved = 1, status = 'active', updated_at = ? WHERE sku = ?").run(now(), sku);
  return { ok: true };
}

async function pauseProduct(ctx, p, status, reason) {
  if (p.status === status) return false;
  if (p.shopify_product_id) await ctx.shopify.setProductStatus(p.shopify_product_id, 'DRAFT');
  ctx.db.prepare('UPDATE products SET status = ?, updated_at = ? WHERE sku = ?').run(status, now(), p.sku);
  raiseException(ctx.db, { source: 'catalogue', ref: p.sku, severity: 'warning', message: `${p.title} paused: ${reason}` });
  ctx.log.warn('catalogue', 'Product paused', { sku: p.sku, reason });
  return true;
}

/** Workflow 03: inventory monitor. */
export async function syncInventory(ctx) {
  const { db, cfg, suppliers, shopify } = ctx;
  const products = db.prepare("SELECT * FROM products WHERE approved = 1 AND status IN ('active','paused_stock')").all();
  const bySupplier = {};
  for (const p of products) (bySupplier[p.supplier] ??= []).push(p);
  const summary = { checked: 0, paused: [], restored: [], mismatches: [], errors: [] };
  const lowStock = cfg.pricing.lowStockThreshold ?? 5;

  for (const [code, items] of Object.entries(bySupplier)) {
    const adapter = suppliers.get(code);
    if (adapter.mode === 'app_managed' || adapter.mode === 'manual') continue; // app syncs stock / owner manages
    let feed;
    try { feed = await adapter.getStock(items); } catch (e) {
      summary.errors.push({ supplier: code, error: e.message });
      raiseException(db, { source: 'inventory', ref: code, severity: 'error', message: `Stock feed failed for ${code}: ${e.message}` });
      continue;
    }
    const map = new Map(feed.map((f) => [f.supplierSku, f]));
    for (const p of items) {
      summary.checked++;
      const f = map.get(p.supplier_sku);
      if (!f) {
        const c = p.stock_mismatch_count + 1;
        db.prepare('UPDATE products SET stock_mismatch_count = ?, last_checked_at = ? WHERE sku = ?').run(c, now(), p.sku);
        if (c >= 3) {
          summary.mismatches.push(p.sku);
          raiseException(db, { source: 'inventory', ref: p.sku, severity: 'error', message: `${p.title}: supplier feed has not returned this SKU for ${c} checks` });
          await pauseProduct(ctx, p, 'paused_stock', 'Supplier SKU missing from feed');
        }
        continue;
      }
      db.prepare('UPDATE products SET stock = ?, stock_mismatch_count = 0, last_checked_at = ? WHERE sku = ?').run(f.stock, now(), p.sku);
      if (p.inventory_item_id && process.env.SHOPIFY_LOCATION_ID) {
        try { await shopify.setInventory(p.inventory_item_id, process.env.SHOPIFY_LOCATION_ID, Math.max(0, f.stock)); } catch (e) { summary.errors.push({ sku: p.sku, error: e.message }); }
      }
      if (f.stock <= 0 && p.status === 'active') {
        await pauseProduct(ctx, p, 'paused_stock', 'Out of stock at supplier');
        summary.paused.push(p.sku);
      } else if (f.stock > 0 && p.status === 'paused_stock') {
        if (!isPaused(db, 'pause_product_publication')) {
          if (p.shopify_product_id) await shopify.setProductStatus(p.shopify_product_id, 'ACTIVE');
          db.prepare("UPDATE products SET status = 'active', updated_at = ? WHERE sku = ?").run(now(), p.sku);
          summary.restored.push(p.sku);
        }
      } else if (f.stock > 0 && f.stock <= lowStock) {
        raiseException(db, { source: 'inventory', ref: p.sku, severity: 'info', message: `${p.title} is low on stock (${f.stock})` });
      }
    }
  }
  return summary;
}

/** Workflow 04: pricing monitor. */
export async function runPricingMonitor(ctx) {
  const { db, cfg, suppliers, shopify, log } = ctx;
  const pricePaused = isPaused(db, 'pause_price_changes');
  const products = db.prepare("SELECT * FROM products WHERE approved = 1 AND status IN ('active','paused_margin')").all();
  const out = [];
  for (const p of products) {
    let latest = {};
    const adapter = suppliers.get(p.supplier);
    if (adapter.mode === 'api' || adapter.mode === 'mock') {
      try {
        const [f] = await adapter.getStock([p]);
        if (f && f.cost != null) latest = { supplierCost: f.cost, shippingCost: f.shipping ?? p.shipping_gbp };
      } catch (e) { raiseException(db, { source: 'pricing', ref: p.sku, severity: 'warning', message: `Could not refresh cost for ${p.sku}: ${e.message}` }); }
    }
    const review = reviewProduct(p, latest, cfg.pricing, { pricePaused });
    if (latest.supplierCost != null) db.prepare('UPDATE products SET cost_gbp = ?, shipping_gbp = ?, updated_at = ? WHERE sku = ?').run(latest.supplierCost, latest.shippingCost, now(), p.sku);
    for (const a of review.actions) {
      if (a.type === 'pause') await pauseProduct(ctx, p, 'paused_margin', a.reason);
      if (a.type === 'alert') raiseException(db, { source: 'pricing', ref: p.sku, severity: 'warning', message: `${p.title}: ${a.reason}` });
      if (a.type === 'price_change') {
        if (a.decision.action === 'apply') {
          if (p.shopify_product_id && p.shopify_variant_id) await shopify.setVariantPrice(p.shopify_product_id, p.shopify_variant_id, a.proposedPrice);
          db.prepare('UPDATE products SET price_gbp = ?, updated_at = ? WHERE sku = ?').run(a.proposedPrice, now(), p.sku);
          db.prepare('INSERT INTO price_changes (sku, old_price_gbp, new_price_gbp, reason, status, created_at) VALUES (?,?,?,?,?,?)').run(p.sku, p.price_gbp, a.proposedPrice, a.decision.reason, 'applied', now());
          log.info('pricing', 'Price updated automatically', { sku: p.sku, from: p.price_gbp, to: a.proposedPrice });
        } else if (a.decision.action === 'approval') {
          db.prepare('INSERT INTO price_changes (sku, old_price_gbp, new_price_gbp, reason, status, created_at) VALUES (?,?,?,?,?,?)').run(p.sku, p.price_gbp, a.proposedPrice, a.decision.reason, 'pending_approval', now());
          requestApproval(db, { type: 'price_change', ref: p.sku, summary: `${p.title}: change price £${p.price_gbp} → £${a.proposedPrice} (${a.decision.reason})`, payload: { proposedPrice: a.proposedPrice } });
        }
      }
    }
    out.push(review);
  }
  return out;
}

/** Owner-approved price change (from the approval queue). */
export async function applyApprovedPrice(ctx, sku, price) {
  const { db, cfg, shopify } = ctx;
  const p = db.prepare('SELECT * FROM products WHERE sku = ?').get(sku);
  if (!p) return { ok: false, error: 'not_found' };
  const check = evaluatePriceChange({ currentPrice: p.price_gbp, proposedPrice: price, supplierCost: p.cost_gbp, shippingCost: p.shipping_gbp }, cfg.pricing);
  if (check.action === 'reject') return { ok: false, error: check.reason }; // even the owner cannot price below break-even here
  if (p.shopify_product_id && p.shopify_variant_id) await shopify.setVariantPrice(p.shopify_product_id, p.shopify_variant_id, price);
  db.prepare('UPDATE products SET price_gbp = ?, updated_at = ? WHERE sku = ?').run(price, now(), sku);
  db.prepare("UPDATE price_changes SET status = 'applied' WHERE sku = ? AND status = 'pending_approval'").run(sku);
  return { ok: true };
}
