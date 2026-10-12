// CJdropshipping API adapter (API v2.0).
//
// STATUS: UNVERIFIED. Written from CJ's public API conventions; endpoint
// paths and field names MUST be confirmed against CJ's current developer
// documentation and exercised with a sandbox/low-value test order (with the
// owner's approval) before mode "api" is enabled for real orders.
//
// Safety: orders are created UNPAID unless CJ_AUTO_PAY=true. An unpaid CJ
// order is not dispatched, so the default is fail-safe.
export function createCjSupplier({ apiBase, apiKey, logisticName, autoPay = false, fetchImpl = fetch }) {
  let tok = null;
  async function accessToken() {
    if (tok && tok.exp > Date.now() + 60_000) return tok.value;
    const r = await fetchImpl(`${apiBase}/authentication/getAccessToken`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey }),
    });
    const j = await r.json();
    if (!r.ok || !j?.data?.accessToken) throw Object.assign(new Error(`CJ auth failed: ${j?.message ?? r.status}`), { definite: true });
    tok = { value: j.data.accessToken, exp: Date.parse(j.data.accessTokenExpiryDate) || Date.now() + 3_600_000 };
    return tok.value;
  }
  async function call(method, path, body) {
    const r = await fetchImpl(`${apiBase}${path}`, {
      method, headers: { 'Content-Type': 'application/json', 'CJ-Access-Token': await accessToken() },
      body: body ? JSON.stringify(body) : undefined,
    });
    let j = null;
    try { j = await r.json(); } catch { /* non-JSON */ }
    if (!r.ok || j?.result === false) {
      // 4xx with a body is a definite rejection; 5xx/timeouts are ambiguous.
      throw Object.assign(new Error(`CJ ${path}: ${j?.message ?? `HTTP ${r.status}`}`), { definite: r.status >= 400 && r.status < 500 });
    }
    return j?.data;
  }
  return {
    name: 'CJ',
    mode: 'api',
    async submitOrder({ idempotencyKey, order, lines, address }) {
      // orderNumber doubles as CJ-side idempotency: CJ rejects a repeated orderNumber.
      const data = await call('POST', '/shopping/order/createOrderV2', {
        orderNumber: idempotencyKey,
        shippingCountryCode: 'GB', shippingCountry: 'United Kingdom',
        shippingProvince: address.province ?? '', shippingCity: address.city, shippingAddress: [address.address1, address.address2].filter(Boolean).join(', '),
        shippingZip: address.zip, shippingCustomerName: address.name, shippingPhone: address.phone ?? '',
        fromCountryCode: 'GB', logisticName,
        products: lines.map((l) => ({ vid: l.supplier_variant_id, quantity: l.quantity })),
        remark: `Shopify ${order.name}`,
      });
      const externalId = data?.orderId ?? data?.id;
      if (autoPay && externalId) await call('POST', '/shopping/pay/payBalance', { orderId: externalId });
      return { externalId, status: autoPay ? 'confirmed' : 'awaiting_payment' };
    },
    async getStock(items) {
      const out = [];
      for (const i of items) {
        const data = await call('GET', `/product/stock/queryByVid?vid=${encodeURIComponent(i.supplier_variant_id)}`);
        const uk = (Array.isArray(data) ? data : []).filter((w) => w.countryCode === 'GB');
        out.push({ supplierSku: i.supplier_sku, stock: uk.reduce((s, w) => s + (Number(w.storageNum) || 0), 0), cost: null, shipping: null });
      }
      return out;
    },
    async getTracking(externalId) {
      const d = await call('GET', `/shopping/order/getOrderDetail?orderId=${encodeURIComponent(externalId)}`);
      if (!d?.trackNumber) return null;
      return { number: d.trackNumber, company: d.logisticName ?? 'Other', url: null, delivered: d.orderStatus === 'DELIVERED' };
    },
  };
}
