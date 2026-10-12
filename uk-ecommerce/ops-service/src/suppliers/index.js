// Supplier registry: maps supplier codes to adapters based on config.
import { createMockSupplier } from './mock.js';
import { createAppManagedSupplier } from './app-managed.js';
import { createManualSupplier } from './manual.js';
import { createCjSupplier } from './cj.js';

export function createSupplierRegistry(cfg, overrides = {}) {
  const adapters = {};
  for (const [code, s] of Object.entries(cfg.suppliers?.suppliers ?? {})) {
    if (overrides[code]) { adapters[code] = overrides[code]; continue; }
    // In test mode every non-mock supplier is replaced by the simulator so
    // nothing real can be ordered.
    if (cfg.testMode && s.mode === 'api') { adapters[code] = Object.assign(createMockSupplier(), { name: code, mode: 'api' }); continue; }
    if (s.mode === 'mock') adapters[code] = createMockSupplier();
    else if (s.mode === 'app_managed') adapters[code] = createAppManagedSupplier(code);
    else if (s.mode === 'manual') adapters[code] = createManualSupplier(code);
    else if (s.mode === 'api' && code === 'CJ') {
      adapters[code] = createCjSupplier({ apiBase: s.apiBase, apiKey: process.env.CJ_API_KEY, logisticName: s.logisticName, autoPay: process.env.CJ_AUTO_PAY === 'true' });
    } else throw new Error(`No adapter for supplier ${code} (${s.mode})`);
  }
  return {
    get(code) {
      const a = adapters[code];
      if (!a) throw new Error(`Unknown supplier ${code}`);
      return a;
    },
    all: () => adapters,
  };
}
