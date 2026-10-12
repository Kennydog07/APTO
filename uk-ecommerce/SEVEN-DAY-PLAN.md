# Seven-day plan — status

Legend: ✅ done in this build · 🟡 done in test mode, needs owner accounts · 🔴 blocked on owner/adviser decision

| Day | Planned | Status | Notes |
|---|---|---|---|
| **1 — Research & architecture** | Niches, scoring, suppliers, provisional niche, architecture, blockers, project structure | ✅ | `NICHE-RESEARCH.md`, `SUPPLIER-COMPARISON.md`, `ARCHITECTURE.md`, `LEGAL-AND-PAYMENTS-CHECKLIST.md` |
| **2 — Store development** | Brand concepts, theme, core pages, navigation, policy drafts, mobile layout | ✅ / 🟡 | Theme built and tested locally (Theme Check 0, 104/104 browser checks); needs uploading to your store |
| **3 — Products & suppliers** | Supplier integration, catalogue, pricing, delivery info, inventory mapping | 🟡 | Integration layer and pricing engine done; 14 candidates shortlisted; **real supplier data must be entered** |
| **4 — Automation** | n8n, order/inventory/tracking workflows, monitoring, failure tests | ✅ / 🟡 | 14 workflows; e2e PASS in n8n 2.42.6; deploy to VPS pending |
| **5 — Marketing** | Calendar, Pinterest workflow, SEO, email sequences, publishing queue | ✅ / 🟡 | `MARKETING-PLAN.md`; publishing waits for Pinterest API access |
| **6 — Testing** | Sandbox checkout, routing, stock, failures, duplicates, tracking, refunds, backups, security, compliance | 🟡 | All test-mode checks done (`TEST-RESULTS.md`); live sandbox checks need the store |
| **7 — Controlled launch** | Payments, legal/tax, approvals, live tests, publish, monitor, marketing | 🔴 | Blocked: payments, VAT, Qatar licence. See `LAUNCH-CHECKLIST.md` |

## Owner's next 7 days (suggested)
1. **Day 1:** book an accountant (non-resident UK VAT/tax) and a Qatar lawyer. Message Shopify and PayPal support with the questions in the legal checklist §6.
2. **Day 2:** create the Shopify trial store; upload the theme; create pages and menus (`SHOPIFY-SETUP.md`).
3. **Day 3:** open a supplier account (Avasam). Fill in real data for 10–15 shortlisted products. Run the scorer.
4. **Day 4:** with approval, rent the VPS. Deploy (`N8N-SETUP.md`). Connect the Shopify app. Run `shopify-smoke`.
5. **Day 5:** Bogus Gateway test orders; Workflow 08 email test; approve marketing drafts.
6. **Day 6:** restore rehearsal; security checklist; review all policies.
7. **Day 7:** launch **only** if every 🔴 item in `LAUNCH-CHECKLIST.md` is resolved; otherwise keep the store password on.
