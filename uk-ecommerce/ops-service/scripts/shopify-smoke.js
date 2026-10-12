// READ-ONLY check that credentials, API version and scopes work.
// Usage (with .env loaded): npm run shopify-smoke
import { loadConfig } from '../src/config.js';
import { createShopifyClient } from '../src/shopify/client.js';

const cfg = loadConfig();
if (!cfg.shopify.shopDomain) { console.error('Set SHOPIFY_SHOP_DOMAIN and credentials first.'); process.exit(1); }
const shopify = createShopifyClient(cfg.shopify);
try {
  const d = await shopify.graphql(`{ shop { name currencyCode myshopifyDomain } locations(first: 5) { nodes { id name } } products(first: 3) { nodes { id title status } } }`);
  console.log(`Connected to ${d.shop.name} (${d.shop.myshopifyDomain}), currency ${d.shop.currencyCode}, API ${cfg.shopify.apiVersion}`);
  console.log('Locations (put the numeric id of your fulfilment location in SHOPIFY_LOCATION_ID):');
  for (const l of d.locations.nodes) console.log(`  ${l.id.split('/').pop()}  ${l.name}`);
  console.log(`Products visible: ${d.products.nodes.length}`);
  if (d.shop.currencyCode !== 'GBP') console.warn('WARNING: store currency is not GBP');
  console.log('PASS — read-only smoke test succeeded. No data was changed.');
} catch (e) {
  console.error('FAIL —', e.message, JSON.stringify(e.details ?? ''));
  process.exit(1);
}
