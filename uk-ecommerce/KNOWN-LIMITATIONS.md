# Known limitations

Honest list of what is **not** done, **not** verified, or **cannot** be automated.

## Blocked by external accounts or decisions
- **Live payments:** no compatible provider verified (Shopify Payments likely unavailable to a Qatar-resident sole trader; Stripe not available in Qatar; PayPal is promising but unconfirmed).
- **Legal/tax:** VAT (NETP), UK income tax and the Qatar e-commerce licence need professional advice. The system cannot resolve these.
- **Shopify store, domain, supplier accounts, email, Pinterest API:** not created. Nothing was purchased.

## Not verified against live services
- **Shopify Admin GraphQL calls** (order status, product status, price, inventory, fulfilment, draft product) were written for API version 2026-07 and tested only against a mock. Run `npm run shopify-smoke` and a Bogus Gateway order before relying on them. `inventorySetQuantities` input fields in particular change between API versions.
- **CJdropshipping adapter:** endpoint paths and fields come from general knowledge of CJ's API v2 and could not be checked against current docs. It creates orders **unpaid** by default for safety.
- **Avasam:** pricing and whether the free tier routes orders are unconfirmed.
- **Fees:** all PayPal, FX and Shopify percentages are pessimistic placeholders.

## Research quality
- Niche scores and product demand scores are **judgement-based and provisional**. No keyword-volume, marketplace sales or Pinterest Trends data could be accessed from this environment.
- Most research came from web-search summaries. Several key sources (forums, law-firm alerts, vendor blogs) are secondary.
- Supplier SKUs, costs, stock and delivery times are intentionally blank. **None were invented.**

## Design limitations
- **Multi-supplier orders:** if one order spans two suppliers, the first tracking number to arrive fulfils all open fulfilment orders in Shopify. Keep each order to one supplier at launch, or check these orders manually.
- **Marketing:** automatic publishing is implemented for Pinterest only. Instagram/Facebook and short video are produced as ready-to-upload drafts. Meta's API requires a business account and app review.
- **Video generation:** scripts and storyboards only; no paid video tool integrated.
- **Traffic/conversion metrics:** the dashboard shows them once data is posted to `/api/metrics` (e.g. a manual weekly export from Shopify Analytics). There is no automatic analytics connector, to avoid extra apps and cookies.
- **Theme preview:** visual tests used a Liquid approximation (liquidjs + stubs), not Shopify's renderer. Check the real store in the theme editor.
- **SQLite:** right for this scale (hundreds of orders a day). Move to PostgreSQL if you outgrow a single server.
- **n8n Community Edition:** single owner account; no SSO or audit log.
- **Customer support** reads one IMAP mailbox. The contact form arrives by email (Shopify sends contact-form submissions to the store email), so point the store email at that mailbox.
- **Returns:** the supplier's returns address must be added by the owner per case; the system never issues refunds.

## Requires owner involvement permanently
Approving products, large price changes, held orders and refunds; disputes, chargebacks and complaints; tax and legal compliance; supplier relationship issues.
