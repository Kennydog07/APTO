# Launch checklist

**Current status: 🔴 NOT READY: live checkout BLOCKED.** The technical system is built and tested in test mode. Launch needs the owner's accounts, approvals and professional advice. Tick every 🔴 item before turning test mode off.

## A. Legal, tax, payments (owner + advisers)
- [ ] 🔴 Payment provider approved **with your real residence** (likely PayPal Business, Qatar) and connected to Shopify
- [ ] 🔴 Written accountant advice on VAT (NETP?) and income tax; VAT registered before first sale if advised
- [ ] 🔴 Qatar advice: e-commerce licence (Decision 25/2026) and residence-permit permission
- [ ] 🔴 Policies completed, reviewed and published; trader name, geographic address and email shown
- [ ] Cookie banner on; ICO fee checked
- [ ] Self Assessment registration (if advised)

## B. Brand and domain (approval required)
- [ ] Brand chosen after UK IPO / Companies House / social-handle checks (`docs/brand/BRAND-CONCEPTS.md`)
- [ ] Domain purchased **with your approval** and connected in Shopify (Settings → Domains)

## C. Catalogue (owner approval required)
- [ ] 10–15 products with **verified** supplier cost, stock, UK warehouse, delivery estimate, image licence and safety documents in `PRODUCT-SHORTLIST.csv`
- [ ] `npm run score-products` shows them `ready_for_approval`; drafts created through Workflow 02
- [ ] Each product approved in the dashboard; SKUs match the supplier app; metafields filled in
- [ ] Prices checked in the pricing dashboard against your **real** fee rates (`ops-service/config/pricing.json` updated)

## D. Integrations (technical, Day 6)
- [ ] `npm run shopify-smoke` PASS on the server (read-only)
- [ ] Shopify webhooks registered; a Bogus Gateway test order appears in the dashboard (criterion 4)
- [ ] Supplier: Avasam in `app_managed` mode **or** CJ in `api` mode after a sandbox/low-value order **approved by you**
- [ ] SMTP/IMAP credentials set; Workflow 08 tested with an email from your own address (test mode → replies come to you)
- [ ] Workflow 11 daily report received; Workflow 12 alert received (trigger by pausing SMTP briefly)
- [ ] Backup cron installed; one restore rehearsed (`DISASTER-RECOVERY.md`)
- [ ] Security checklist complete (`SECURITY-CHECKLIST.md`)

## E. Go-live (Day 7, each step needs your explicit approval)
1. [ ] Authorised live transaction test: buy one product yourself with a real payment; confirm supplier order, tracking and customer emails; then refund it in Shopify
2. [ ] `TEST_MODE=false` in `deploy/ops.env`; `testMode: false` in `n8n-workflows/config.json` → rebuild/re-import; `docker compose up -d`
3. [ ] Keep **Automatic supplier orders paused** for the first 3–5 orders and approve each manually; then un-pause
4. [ ] Remove the Shopify store password (**publishing the store: approval required**)
5. [ ] Start approved organic marketing (Workflow 10 after Pinterest API access)
6. [ ] Watch the daily report closely for the first two weeks

If any 🔴 item is outstanding, the store stays password-protected and the system stays in test mode. That is the correct, safe outcome.
