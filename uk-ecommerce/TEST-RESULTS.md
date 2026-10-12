# Test results

Run on **12 October 2026** in the build environment: Linux, Node 22.22.0, n8n 2.42.6 on Node 24.21.0, Chromium via Playwright 1.63.0. No Docker daemon was available. There are no Shopify, supplier, payment, email or Pinterest credentials.

> **Mock ≠ production.** "Test-mode result" means the behaviour was verified against simulated Shopify and suppliers. **Nothing here proves a live integration works.** The "Live result" column stays BLOCKED or NOT TESTED until the owner supplies accounts and the launch checks are run.

## Acceptance criteria (brief, section 18)

| # | Requirement | Test-mode / local result | Live result | Evidence |
|---|---|---|---|---|
| 1 | Storefront loads on desktop and mobile | **PASS** (local Liquid preview) | BLOCKED (no Shopify store) | 104/104 browser checks at 390 px and 1366 px: no horizontal scroll, one H1, alt text, labelled fields, ≥40 px tap targets, no JS errors. Shopify Theme Check: 0 offences |
| 2 | Product data displays accurately | **PASS** (sample data) | BLOCKED | Price, VAT note, variants, real-inventory stock status, supplier delivery metafield, specs, valid Product JSON-LD |
| 3 | Cart works | **PASS** (AJAX endpoints simulated) | BLOCKED | Add-to-basket shows confirmation and updates count; cart page renders |
| 4 | Shopify test checkout works | NOT TESTED | **BLOCKED** | Needs a store with Bogus Gateway (SHOPIFY-SETUP.md §9) |
| 5 | Paid-order webhook verification | **PASS** | BLOCKED | Valid HMAC accepted; tampered body, wrong secret, wrong shop and missing ID rejected (unit + HTTP + n8n e2e: forged → 401) |
| 6 | Duplicate webhooks don't duplicate orders | **PASS** | BLOCKED | Same webhook ID ignored; same order with new ID → still one order and one supplier order (unit + e2e) |
| 7 | Supplier integration in test mode | **PASS** (simulator) | **NOT TESTED** (CJ adapter unverified); BLOCKED (Avasam account) | Idempotent submit, concurrent submits → 1 order, definite failure → retry limit, timeout → "unknown", never auto-retried |
| 8 | Stock changes update listings | **PASS** (mock Shopify) | BLOCKED | Out-of-stock → paused (DRAFT); restock → restored; not re-published while publication paused |
| 9 | Pricing rules prevent unacceptable margins | **PASS** | n/a (pure logic) | Hand-checked contribution maths; negative/poor margin flagged; >10% change needs approval; below break-even rejected even for owner |
| 10 | Tracking updates correctly | **PASS** (mock) | BLOCKED | Supplier tracking → one Shopify fulfilment; nothing invented when tracking absent; invalid numbers rejected |
| 11 | Customer notifications in test mode | **PARTIAL**: reply content PASS; sending NOT TESTED | BLOCKED | Verified-email WISMO reply PASS; non-owner gets no order data; escalations get neutral ack. SMTP sending not run (no mailbox) |
| 12 | Marketing content enters approval queue | **PASS** | n/a | Unit tests + n8n Workflow 09 run queued 5 items as `pending_approval` |
| 13 | Publishing respects approval status | **PASS** | NOT TESTED (no Pinterest API access) | Unapproved/rejected never due; pause blocks; can't publish twice; Workflow 10 ran in test mode without publishing |
| 14 | Daily reports generate correctly | **PASS** (generation) | NOT TESTED (email delivery) | All required sections present; attention list includes alerts, approvals, budget, pauses |
| 15 | Errors are logged and escalated | **PASS** | NOT TESTED (alert email) | Real n8n: Workflows 11 and 13 failed at the unconfigured SMTP node → Workflow 12 recorded both in ops-service exceptions |
| 16 | Dashboard access is protected | **PASS** | NOT TESTED on server | Login required, scrypt hash, 5-attempt lockout, HttpOnly + SameSite=Strict cookie, CSRF, server-side logout, XSS escaping, CSP/X-Frame-Options; API needs Bearer token |
| 17 | Backups can be restored | **PASS** (ops DB + n8n archive crypto) | NOT TESTED (Docker scripts) | Encrypted SQLite backup→restore with integrity check; wrong passphrase rejected; overwrite needs --force. n8n tar+openssl archive of a real 2.4 MB n8n DB round-tripped byte-identical |
| 18 | Emergency pause controls work | **PASS** | NOT TESTED on server | Pausing blocks auto orders, publication, marketing and price changes; API can pause but not resume |

**Summary:** 16 PASS and 2 PARTIAL/NOT TESTED in test mode. In production, everything that needs an external account is BLOCKED. **The system is not launch-ready** until the 🔴 items in `LAUNCH-CHECKLIST.md` pass.

## How to re-run
```bash
cd ops-service && npm install && npm test                 # 65 unit/integration tests
cd ../tests/theme-preview && npm install && npm test      # Liquid render + 104 browser checks (needs Chromium)
# Shopify Theme Check:  npx @shopify/cli theme check --path ../../shopify-theme
# End-to-end with real n8n (needs n8n + Node 24 installed locally):
N8N_NODE=/path/to/node24 N8N_BIN=/path/to/n8n/bin/n8n tests/e2e/n8n-e2e.sh
```

## End-to-end run (real n8n 2.42.6), last result
See `tests/e2e/last-run.log`:
- 14/14 workflows imported; Workflows 05, 06 and 12 activated.
- Signed paid-order webhook → ops-service → Workflow 05 → Workflow 06 → **1 supplier order (attempts = 1), order state `submitted`**.
- Duplicate delivery and same-order-new-ID → no extra orders. Forged webhook → 401. Unauthenticated call to n8n webhook → 403.
- Manual runs: Workflows 03, 04, 07, 09 and 10 → **SUCCESS**. Workflows 11 and 13 → stopped at the email node (no SMTP credential, expected); errors captured by Workflow 12.

## Bugs found and fixed by testing
1. **Theme:** the variant selector looked for product JSON in the wrong DOM scope, so colour/size switching would not have updated price or stock. Fixed in `assets/theme.js`.
2. **Support:** the AI "no new numbers" guard compared substrings, so an invented "2 days" passed because "2" appears in a tracking number. Fixed to whole-token comparison.
3. **Catalogue:** `undefined` fields crashed the SQLite insert when creating a draft from a sparse candidate row. Fixed.
4. **Weekly report:** queried a non-existent column. Fixed.
5. **Theme:** Liquid filter used inside an `if` condition (Theme Check error). Fixed.
6. **n8n Config node:** passed only the first item, which would drop orders in the fallback batch. Fixed.
7. **Test harness:** stray n8n processes survived between runs (n8n renames its process). Harness now uses process groups and checks for port conflicts.

## Unit and integration tests (ops-service, 65/65)
- ✅ classification: escalation keywords beat routine categories
- ✅ WISMO from the order email gets real status and supplier tracking
- ✅ WISMO from a different email reveals nothing about the order
- ✅ escalations get only a neutral acknowledgement; duplicates ignored
- ✅ product question answered only from verified specs
- ✅ AI rewrite that invents numbers is rejected (hallucination guard)
- ✅ AI polish is used only when it keeps the facts
- ✅ returns: statutory windows assessed correctly
- ✅ return case requires verified email; refunds only ever go to approval
- ✅ password hashing round-trip and weak password rejected
- ✅ dashboard and API are protected
- ✅ login: wrong password refused, rate-limited after 5 failures
- ✅ signed-in owner sees all sections; cookie is HttpOnly + SameSite=Strict
- ✅ emergency pause works from dashboard; CSRF enforced; API can pause but not resume
- ✅ dashboard escapes untrusted data (no stored XSS via product titles)
- ✅ encrypted backup restores intact; wrong passphrase fails; restore refuses to overwrite without --force
- ✅ generated content lands in the approval queue and is not duplicated
- ✅ publishing respects approval status, pause switch and daily limits
- ✅ rejected content is never due
- ✅ daily report contains every required section and flags attention items
- ✅ weekly report recommends but never authorises spending
- ✅ cost projection alerts above £80
- ✅ AI budget cap: calls stop when the monthly cap would be exceeded; usage is recorded; refusals handled
- ✅ stock drops to zero -> product paused in Shopify; stock returns -> restored
- ✅ restock does not republish while product publication is paused
- ✅ pricing monitor: small cost rise auto-adjusts within limit; big rise needs approval; approval applies
- ✅ pricing monitor never changes price while price changes are paused
- ✅ negative margin pauses the product
- ✅ candidate approval: draft created, publication waits for owner, respects publication pause
- ✅ tracking from supplier is synced to Shopify once and the order marked shipped
- ✅ manually entered tracking is validated; duplicates ignored
- ✅ happy path: paid order validates and is submitted exactly once
- ✅ concurrent submissions place only one supplier order
- ✅ payment not confirmed by Shopify -> held, nothing ordered
- ✅ high fraud risk -> held; medium risk -> approval queue
- ✅ unmapped SKU, unapproved product, insufficient stock and non-UK address are held
- ✅ pause switch and value limit route orders to approval; owner approval submits
- ✅ order above automatic value limit needs approval
- ✅ definite supplier rejection -> failed + exception; retried up to the limit only
- ✅ ambiguous supplier failure (timeout) -> unknown, critical alert, never auto-retried
- ✅ cancellation before submission stops the order; after submission raises a critical alert
- ✅ app-managed supplier: our system never submits (prevents double ordering)
- ✅ manual supplier creates a purchase task for the owner
- ✅ GDPR customers/redact purges stored personal data
- ✅ GDPR data request raises an owner alert
- ✅ contribution maths matches a hand calculation (VAT-registered)
- ✅ not VAT-registered: no VAT deducted from revenue
- ✅ negative margin and excessive shipping are flagged and rejected
- ✅ uncompetitive price flagged against competitor reference
- ✅ recommended price meets every rule and ends in .99
- ✅ break-even price gives ~zero contribution
- ✅ retail rounding
- ✅ price-change guard: small change applies, large needs approval, below break-even rejected, paused needs approval
- ✅ supplier cost increase triggers alert and an approval-gated price change; extreme cost pauses
- ✅ weights sum to 100%
- ✅ fully verified viable product is ready for owner approval
- ✅ unverified data cannot reach approval and is labelled provisional
- ✅ excluded categories and high safety risk are rejected
- ✅ poor economics are rejected
- ✅ niche score is weighted and provisional unless all evidence verified
- ✅ CSV parser handles quotes, commas and newlines
- ✅ HMAC: valid signature verifies, tampered body and wrong secret fail
- ✅ Webhook check rejects wrong shop and missing webhook id
- ✅ HTTP: verified paid-order webhook is stored once; duplicate delivery is ignored; forged one rejected
- ✅ HTTP: same order re-sent with a NEW webhook id does not duplicate the order
