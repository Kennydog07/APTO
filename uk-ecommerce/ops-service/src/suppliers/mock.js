// Simulated supplier for TEST_MODE and automated tests. Never contacts anyone.
// Failure injection: supplier SKUs containing FAIL throw a definite error;
// TIMEOUT simulates an ambiguous failure (order may or may not exist).
export function createMockSupplier() {
  const placed = new Map(); // idempotencyKey -> externalId (supplier-side dedupe)
  const stock = new Map();
  const tracking = new Map();
  return {
    name: 'MOCK',
    mode: 'mock',
    placed,
    setStock(sku, qty, cost, shipping) { stock.set(sku, { stock: qty, cost, shipping }); },
    setTracking(externalId, t) { tracking.set(externalId, t); },
    async submitOrder({ idempotencyKey, lines }) {
      if (lines.some((l) => /FAIL/.test(l.supplier_sku))) throw Object.assign(new Error('Supplier rejected order (simulated)'), { definite: true });
      if (lines.some((l) => /TIMEOUT/.test(l.supplier_sku))) throw Object.assign(new Error('Supplier timeout (simulated)'), { definite: false });
      if (placed.has(idempotencyKey)) return { externalId: placed.get(idempotencyKey), status: 'confirmed', duplicate: true };
      const externalId = `MOCK-${placed.size + 1000}`;
      placed.set(idempotencyKey, externalId);
      return { externalId, status: 'confirmed' };
    },
    async getStock(items) {
      return items.map((i) => ({ supplierSku: i.supplier_sku, ...(stock.get(i.supplier_sku) ?? { stock: 25, cost: i.cost_gbp, shipping: i.shipping_gbp }) }));
    },
    async getTracking(externalId) { return tracking.get(externalId) ?? null; },
  };
}
