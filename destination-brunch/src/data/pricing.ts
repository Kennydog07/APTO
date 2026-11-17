/* =====================================================================
   PRICES  (US dollars)
   ---------------------------------------------------------------------
   Change a price here and it updates on every card, page, filter,
   structured-data block and "from $x" label across the whole website.

   IMPORTANT: before you publish, make sure the price on each Gumroad
   product page is exactly the same as the price shown here.

   A single product can still have its own price: add `priceUSD: 3.99`
   to that product in products.ts. Leave it out to use these prices.
   ===================================================================== */

export const CURRENCY = 'USD';

export const PRICES = {
  /** Brunch guides, e.g. "Destination : Brunch — Dubai" */
  brunch: 4.99,
  /** Happy Hours & Daily Deals guides, e.g. "Daily Deals Riyadh" */
  deals: 2.49,
} as const;

export type PriceTier = keyof typeof PRICES;
