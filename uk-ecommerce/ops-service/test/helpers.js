import { loadConfig } from '../src/config.js';
import { openDb } from '../src/db.js';
import { createContext } from '../src/app.js';
import { createMockShopify } from '../src/shopify/client.js';
import { createMockSupplier } from '../src/suppliers/mock.js';
import { createAppManagedSupplier } from '../src/suppliers/app-managed.js';
import { createManualSupplier } from '../src/suppliers/manual.js';
import { upsertProduct } from '../src/catalogue.js';

export const SECRET = 'test-webhook-secret';
export const SHOP = 'test-store.myshopify.com';
export const API_TOKEN = 'x'.repeat(40);

export function testCtx(extra = {}) {
  const cfg = loadConfig();
  cfg.testMode = true;
  cfg.dbPath = ':memory:';
  cfg.apiToken = API_TOKEN;
  cfg.shopify.webhookSecret = SECRET;
  cfg.shopify.shopDomain = SHOP;
  cfg.n8n.orderWebhookUrl = '';
  cfg.ai.apiKeyPresent = false;
  Object.assign(cfg.orders, { autoOrderMaxGbp: 75, dailyAutoOrderCapGbp: 300, shipToCountries: ['GB'] });
  if (extra.cfg) extra.cfg(cfg);
  const supplier = createMockSupplier();
  const shopify = createMockShopify();
  const ctx = createContext(cfg, {
    db: openDb(':memory:'), quiet: true, shopify,
    supplierAdapters: { MOCK: supplier, CJ: Object.assign(createMockSupplier(), { name: 'CJ', mode: 'api' }), AVASAM: createAppManagedSupplier('AVASAM'), MANUAL: createManualSupplier('MANUAL') },
    ...extra.overrides,
  });
  return { ctx, cfg, supplier, shopify };
}

export function seedProduct(ctx, over = {}) {
  return upsertProduct(ctx.db, {
    sku: 'SKU-1', title: 'Stackable Pantry Bin', supplier: 'MOCK', supplier_sku: 'SUP-1', cost_gbp: 6, shipping_gbp: 2.5, price_gbp: 24.99,
    stock: 50, status: 'active', approved: 1, cost_verified: 1, shopify_product_id: '111', shopify_variant_id: '222', inventory_item_id: '333',
    handle: 'stackable-pantry-bin', benefits: 'Stacks securely to use vertical cupboard space|Clear sides so you can see what is inside|Wipe-clean plastic',
    specs: 'Dimensions: 30 × 20 × 15 cm', delivery_estimate: '2–4 working days (supplier estimate)', ...over,
  });
}

export function paidOrderPayload(over = {}) {
  return {
    id: 5001, name: '#1001', email: 'alex@example.com', created_at: new Date().toISOString(), financial_status: 'paid', cancelled_at: null,
    currency: 'GBP', subtotal_price: '24.99', total_price: '24.99', total_tax: '4.17', total_shipping_price_set: { shop_money: { amount: '0.00' } },
    shipping_address: { name: 'Alex Example', address1: '1 High Street', city: 'Leeds', zip: 'LS1 1AA', country_code: 'GB' },
    line_items: [{ id: 9001, sku: 'SKU-1', variant_id: 222, title: 'Stackable Pantry Bin', quantity: 1, price: '24.99' }], tags: '',
    ...over,
  };
}
