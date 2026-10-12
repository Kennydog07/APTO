// A Shopify supplier app (e.g. Avasam, DSers) places the supplier order and
// pushes tracking back to Shopify itself. This adapter deliberately does
// NOTHING external, so our automation can never create a second order.
export function createAppManagedSupplier(name) {
  return {
    name,
    mode: 'app_managed',
    async submitOrder() { return { externalId: null, status: 'app_managed' }; },
    async getStock() { return []; }, // stock is synced by the app into Shopify
    async getTracking() { return null; }, // fulfilment arrives via Shopify webhook
  };
}
