// Shopify Admin GraphQL client with token handling, throttling and retries,
// plus a recording mock used in TEST_MODE and unit tests.
//
// VERIFY BEFORE GO-LIVE: mutation shapes target Admin API 2026-07. Shopify
// versions its API quarterly; run `npm run shopify-smoke` (see SHOPIFY-SETUP.md)
// against a development store after any version change.

const gid = (type, id) => (String(id).startsWith('gid://') ? String(id) : `gid://shopify/${type}/${id}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class ShopifyError extends Error {
  constructor(message, details) { super(message); this.details = details; }
}

export function createShopifyClient(cfg, { fetchImpl = fetch, log } = {}) {
  const { shopDomain, apiVersion, adminToken, clientId, clientSecret } = cfg;
  let cached = adminToken ? { token: adminToken, expiresAt: Infinity } : null;

  async function token() {
    if (cached && cached.expiresAt > Date.now() + 5 * 60_000) return cached.token;
    if (!clientId || !clientSecret) throw new ShopifyError('No Shopify credentials configured');
    // Client-credentials grant for Dev Dashboard apps installed on your own store.
    const res = await fetchImpl(`https://${shopDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
    });
    if (!res.ok) throw new ShopifyError(`Token request failed: HTTP ${res.status}`);
    const j = await res.json();
    cached = { token: j.access_token, expiresAt: Date.now() + (Number(j.expires_in) || 86_400) * 1000 };
    return cached.token;
  }

  async function graphql(query, variables = {}, attempt = 0) {
    const res = await fetchImpl(`https://${shopDomain}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': await token() },
      body: JSON.stringify({ query, variables }),
    });
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      const wait = Number(res.headers.get('retry-after')) * 1000 || 500 * 2 ** attempt;
      log?.warn('shopify', `HTTP ${res.status}, retrying in ${wait}ms`);
      await sleep(wait);
      return graphql(query, variables, attempt + 1);
    }
    if (res.status === 401 && !adminToken && attempt < 1) { cached = null; return graphql(query, variables, attempt + 1); }
    if (!res.ok) throw new ShopifyError(`Shopify HTTP ${res.status}`);
    const body = await res.json();
    const throttled = body.errors?.some((e) => e.extensions?.code === 'THROTTLED');
    if (throttled && attempt < 5) {
      const t = body.extensions?.cost?.throttleStatus;
      const need = body.extensions?.cost?.requestedQueryCost ?? 100;
      const wait = t ? Math.ceil(((need - t.currentlyAvailable) / t.restoreRate) * 1000) + 250 : 1000 * 2 ** attempt;
      await sleep(Math.max(250, wait));
      return graphql(query, variables, attempt + 1);
    }
    if (body.errors?.length) throw new ShopifyError('Shopify GraphQL error', body.errors);
    return body.data;
  }

  function userErrors(payload, op) {
    if (payload?.userErrors?.length) throw new ShopifyError(`${op} failed`, payload.userErrors);
    return payload;
  }

  return {
    mode: 'live',
    graphql,

    async getOrderStatus(orderId) {
      const d = await graphql(`query($id: ID!) { order(id: $id) {
        id name displayFinancialStatus displayFulfillmentStatus cancelledAt tags
        risk { recommendation assessments { riskLevel } } } }`, { id: gid('Order', orderId) });
      const o = d.order;
      if (!o) return null;
      const levels = (o.risk?.assessments ?? []).map((a) => a.riskLevel);
      return {
        id: orderId,
        financialStatus: o.displayFinancialStatus, // e.g. PAID
        cancelledAt: o.cancelledAt,
        tags: o.tags ?? [],
        riskRecommendation: o.risk?.recommendation ?? 'NONE', // ACCEPT | INVESTIGATE | CANCEL | NONE
        riskLevel: levels.includes('HIGH') ? 'HIGH' : levels.includes('MEDIUM') ? 'MEDIUM' : levels.length ? 'LOW' : 'NONE',
      };
    },

    async setProductStatus(productId, status) {
      const d = await graphql(`mutation($product: ProductUpdateInput!) { productUpdate(product: $product) {
        product { id status } userErrors { field message } } }`, { product: { id: gid('Product', productId), status } });
      return userErrors(d.productUpdate, 'productUpdate').product;
    },

    async setVariantPrice(productId, variantId, price) {
      const d = await graphql(`mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          productVariants { id price } userErrors { field message } } }`,
      { productId: gid('Product', productId), variants: [{ id: gid('ProductVariant', variantId), price: price.toFixed(2) }] });
      return userErrors(d.productVariantsBulkUpdate, 'productVariantsBulkUpdate').productVariants;
    },

    async setInventory(inventoryItemId, locationId, quantity) {
      const d = await graphql(`mutation($input: InventorySetQuantitiesInput!) { inventorySetQuantities(input: $input) {
        inventoryAdjustmentGroup { reason } userErrors { field message } } }`,
      { input: { name: 'available', reason: 'correction', ignoreCompareQuantity: true,
        quantities: [{ inventoryItemId: gid('InventoryItem', inventoryItemId), locationId: gid('Location', locationId), quantity }] } });
      return userErrors(d.inventorySetQuantities, 'inventorySetQuantities');
    },

    async createFulfilment(orderId, { number, company, url }, notifyCustomer) {
      const d = await graphql(`query($id: ID!) { order(id: $id) { fulfillmentOrders(first: 10) { nodes { id status } } } }`, { id: gid('Order', orderId) });
      const open = (d.order?.fulfillmentOrders?.nodes ?? []).filter((f) => ['OPEN', 'IN_PROGRESS'].includes(f.status));
      if (!open.length) return { skipped: true, reason: 'No open fulfilment orders (already fulfilled?)' };
      const m = await graphql(`mutation($fulfillment: FulfillmentInput!) { fulfillmentCreate(fulfillment: $fulfillment) {
        fulfillment { id status } userErrors { field message } } }`,
      { fulfillment: { notifyCustomer, trackingInfo: { number, company, url }, lineItemsByFulfillmentOrder: open.map((f) => ({ fulfillmentOrderId: f.id })) } });
      return userErrors(m.fulfillmentCreate, 'fulfillmentCreate').fulfillment;
    },

    async createDraftProduct({ title, descriptionHtml, vendor, productType, tags, seo }) {
      const d = await graphql(`mutation($product: ProductCreateInput!) { productCreate(product: $product) {
        product { id handle status } userErrors { field message } } }`,
      { product: { title, descriptionHtml, vendor, productType, tags, status: 'DRAFT', seo } });
      return userErrors(d.productCreate, 'productCreate').product;
    },
  };
}

/** In-memory stand-in used when TEST_MODE=true. Records every call. */
export function createMockShopify(seed = {}) {
  const orders = new Map(Object.entries(seed.orders ?? {}));
  const calls = [];
  const rec = (op, args, result) => { calls.push({ op, args }); return result; };
  return {
    mode: 'mock',
    calls,
    orders,
    async getOrderStatus(id) {
      const o = orders.get(String(id)) ?? (seed.assumePaid ? {} : undefined);
      return rec('getOrderStatus', [id], o ? { id, financialStatus: 'PAID', cancelledAt: null, tags: [], riskRecommendation: 'ACCEPT', riskLevel: 'LOW', ...o } : null);
    },
    async setProductStatus(productId, status) { return rec('setProductStatus', [productId, status], { id: productId, status }); },
    async setVariantPrice(productId, variantId, price) { return rec('setVariantPrice', [productId, variantId, price], [{ id: variantId, price }]); },
    async setInventory(itemId, locationId, qty) { return rec('setInventory', [itemId, locationId, qty], { ok: true }); },
    async createFulfilment(orderId, tracking, notify) { return rec('createFulfilment', [orderId, tracking, notify], { id: `mock-fulfilment-${orderId}`, status: 'SUCCESS' }); },
    async createDraftProduct(p) { return rec('createDraftProduct', [p], { id: `gid://shopify/Product/mock-${calls.length}`, handle: 'mock', status: 'DRAFT' }); },
  };
}
