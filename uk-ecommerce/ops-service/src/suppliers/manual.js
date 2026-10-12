// Owner places the order by hand. We only prepare the instructions.
export function createManualSupplier(name) {
  return {
    name,
    mode: 'manual',
    async submitOrder() { return { externalId: null, status: 'awaiting_manual' }; },
    async getStock() { return []; },
    async getTracking() { return null; },
  };
}
