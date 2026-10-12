# Shopify setup

All steps are in Shopify admin. Nothing here charges you until you choose a paid plan. **Get approval before choosing a plan, connecting payments or removing the store password.**

## 1. Create the store
1. Start a Shopify trial. Store details: business location **United Kingdom**, your own name and address. Currency: **GBP**. Time zone: Europe/London.
2. Plan: **Basic** is enough (around £25/month monthly, or about £19/month billed annually — verify current pricing; annual billing is a 12-month commitment).
3. Keep the **store password ON** (Online Store → Preferences) until launch.

## 2. Upload the theme
1. On your laptop, zip the *contents* of `uk-ecommerce/shopify-theme/` so that `layout/`, `sections/` and the other folders sit at the top level of the zip.
2. Online Store → Themes → Add theme → Upload zip. Then Customise → check the homepage → Publish when ready.
   - Developer alternative: `npm i -g @shopify/cli` then `shopify theme push --path shopify-theme --unpublished`.
3. In the theme editor: Header → choose the menu; Footer → set your **trader legal name**, geographic address and VAT number (once registered), help menu and cookie-policy page.

## 3. Pages and menus
Create pages (Online Store → Pages) and pick the template shown:
| Page | Template | Content from |
|---|---|---|
| About us | `page.about` | Your genuine story |
| Contact | `page.contact` | Short intro text |
| FAQs (handle `faqs`) | `page.faq` | Intro text (questions are in the template) |
| Cookie policy | `page` | `docs/policies/cookie-policy.md` |
| Complaints | `page` (handle `complaints`) | `docs/policies/complaints-procedure.md` |

Policies (Settings → Policies): paste the completed drafts for refund, privacy, terms of service, shipping and contact information.

Menus (Online Store → Navigation): **main-menu**: Shop all, Kitchen, Wardrobe, Bathroom, About, Help. **footer**: collection links. Optional help menu: FAQs, Contact, Delivery, Returns, Complaints.

## 4. Product metafields (Settings → Custom data → Products)
Create these definitions so the theme can show verified information:
| Namespace.key | Type | Used for |
|---|---|---|
| `custom.benefits` | List of single-line text | Bullet benefits (supplier-verified only) |
| `custom.specifications` | Multi-line text | Dimensions, materials, load ratings |
| `custom.delivery_estimate` | Single-line text | Supplier's delivery estimate, e.g. "2–4 working days" |
| `custom.fitting` | Single-line text | e.g. "Freestanding — no drilling" |

## 5. Shipping, tax and checkout
- Settings → Shipping: one zone, **United Kingdom** (exclude Northern Ireland postcodes or confirm with your adviser), with rates that cover supplier shipping.
- Settings → Taxes: **do not collect VAT** while you're not VAT-registered (below £90,000). If you register later, turn on UK VAT with prices including tax and set `vatRegistered: true` in ops-service.
- Settings → Checkout: require phone only if suppliers need it; turn on email marketing opt-in at checkout (unticked by default).
- Settings → Customer privacy: **turn on the cookie banner** for the UK.
- Settings → Notifications: edit the wording as described in `marketing/email/EMAIL-SEQUENCES.md`.

## 6. Payments (approval required before activating)
Settings → Payments → **Activate Shopify Payments**: business type *Sole proprietorship*, your personal details and ID, and a UK bank account in your name (preferably a separate business account). Enable Shop Pay, Apple Pay and Google Pay. Optionally add PayPal. Fees are in `LEGAL-AND-PAYMENTS-CHECKLIST.md` §2.

## 7. Connect ops-service (Dev Dashboard app)
Since 1 January 2026, new "legacy custom apps" cannot be created in the admin. Use the Shopify **Dev Dashboard**:
1. dev.shopify.com → Apps → Create app (same organisation as your store) → configure **Admin API scopes** (least privilege):
   `read_orders`, `read_products`, `write_products`, `read_inventory`, `write_inventory`, `read_locations`, `read_merchant_managed_fulfillment_orders`, `write_merchant_managed_fulfillment_orders`, `read_fulfillments`, `write_fulfillments`.
   (Add the third-party fulfillment-order scopes only if a supplier app requires them.)
2. Install the app on your store. Copy the **Client ID** and **Client secret** into `deploy/ops.env` on the server (`SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_WEBHOOK_SECRET` = the client secret). Never paste them into chat. ops-service exchanges them for short-lived tokens (client-credentials grant), as described in Shopify community guidance; confirm in Shopify's docs.
3. Webhooks (in the app configuration, API version `2026-07`): subscribe these topics to `https://ops.<your-domain>/webhooks/shopify`: `orders/paid`, `orders/cancelled`, `orders/fulfilled`, `fulfillments/create`, `refunds/create`, `customers/redact`, `customers/data_request`, `shop/redact`.
4. On the server: `docker compose exec ops-service npm run shopify-smoke` → must print **PASS** (read-only). It also prints your location ID for `SHOPIFY_LOCATION_ID`.

## 8. Supplier app
Install the chosen supplier app (Avasam recommended, see `SUPPLIER-COMPARISON.md`). Import only products you have verified. Set each product's **SKU** to the `candidate_id`/SKU used in ops-service, so orders map to suppliers.

## 9. Test checkout (no real money)
Use Shopify's **Bogus Gateway** test mode (Settings → Payments → test mode / "(for testing) Bogus Gateway" on a development or trial store) to place test orders. Confirm the `orders/paid` webhook appears in ops-service logs and the order appears in the dashboard.
