# Supplier comparison

Researched 12 October 2026 from web-search summaries (direct page access was not available). **Prices are unverified. Check every vendor's live pricing page before subscribing. No subscriptions have been started.**

| | **Avasam** | **CJdropshipping** | **DSers** | **Syncee** | **Spocket** |
|---|---|---|---|---|---|
| What it is | UK-focused dropshipping marketplace | Supplier/agent with own warehouses incl. UK | Order tool for AliExpress/Temu suppliers | Supplier marketplace | Supplier marketplace |
| UK warehouse stock | **Yes**: UK/US-based verified suppliers ([dodropshipping review](https://dodropshipping.com/avasam-review/)) | **Yes, some**: UK warehouses listed; most catalogue ships from China ([ecommerce-platforms](https://ecommerce-platforms.com/?p=108914)) | Mostly **no** (China-based AliExpress sellers) | Some UK suppliers ([Syncee](https://syncee.com/page/syncee-vs-spocket)) | Mainly US/EU ([dodropshipping](https://dodropshipping.com/best-spocket-dropshipping-alternatives/)) |
| Shopify integration | App: push products, orders flow to supplier, payment taken automatically ([Shopify App Store](https://apps.shopify.com/avasam)) | App plus open API (orders, stock, tracking) | App | App | App |
| Automatic order placement | **Yes, inside the app** (app-managed) | **Yes, via API** (our CJ adapter, unverified) | Yes, but suppliers are mostly overseas | Yes (vendor claim) | Yes |
| Price (unverified) | Conflicting: ~£20–£150/month + VAT, or $35.99–$119.99 ([dodropshipping pricing](https://dodropshipping.com/go/avasam-pricing)) | No monthly fee reported | Free tier; Advanced $19.90/month ([ecommerce-platforms](https://ecommerce-platforms.com/articles/dsers-pricing)) | Free tier (no import); paid from ~$39.99/month ([PulseSignal](https://getpulsesignal.com/pricing/syncee)) | Not researched (EU/US focus) |
| Fit for this project | **Primary candidate** | **Secondary** (UK-warehouse SKUs only) | **Not recommended** (China shipping breaks the "UK stock" promise and the £135 import rules) | Possible alternative | Not recommended |

## Recommendation
1. **Primary: Avasam (mode `app_managed`).** It matches the brief best: UK suppliers, Shopify app, automatic order forwarding and price syncing. In this mode the Avasam app places supplier orders itself. Our ops-service **never** submits those orders, which removes any risk of double-ordering. It validates, monitors and alerts, and tracks fulfilment through Shopify webhooks.
   - To verify: current plan price, whether the free/lowest tier allows automatic order routing, each supplier's returns address and process, image licence terms, and how supplier payment works (prepaid wallet or card).
2. **Secondary: CJdropshipping (mode `api`), UK-warehouse SKUs only.** No monthly fee is reported. Our adapter (`ops-service/src/suppliers/cj.js`) is **unverified against the live API**. It creates orders **unpaid** by default, so nothing ships until you approve payment. It must pass a sandbox or low-value test (with your approval) before you rely on it.
3. **Manual mode** works for any supplier: the system puts a purchase task in your approval queue with exact instructions.

## Supplier checklist (per supplier, before listing any product)
- [ ] UK warehouse address confirmed (not "ships from UK" marketing)
- [ ] Tracked courier and realistic delivery estimate, in writing
- [ ] Returns address and process for UK customers
- [ ] Product images licensed for your use
- [ ] Safety documents: material specs, load ratings, REACH/phthalate statements for PVC
- [ ] Stock and price sync method (app, API or feed)
- [ ] Payment terms and refund process for faulty or lost goods
- [ ] Company details (UK company number) checked on Companies House

## Recommended supplier-payment reserve
Keep **£300–£500** separate from the software budget to pay suppliers before customer payouts arrive. PayPal and gateway payouts may be held for new accounts. `DAILY_AUTO_ORDER_CAP_GBP` (default £300) limits exposure on any one day.
