# Operating costs

Target: **£50–£100/month** recurring software and hosting. **All prices are unverified** third-party figures found by web search on 12 Oct 2026. Verify each on the provider's site before subscribing. **Nothing has been purchased.**

## Monthly (planning figures)
| Item | Plan | £/month | Verified? | Source / note |
|---|---|---|---|---|
| Shopify | Basic, monthly billing | 25.00 | ❌ | [Charle 2026](https://www.charle.co.uk/articles/shopify-pricing/), [ExpertMarket](https://www.expertmarket.com/uk/website-builders/shopify-pricing). £19/month if billed annually (12-month commitment) |
| VPS | 2 vCPU / 4 GB (e.g. Hetzner CX23-class) | 5.50 | ❌ | Trackers quote €3.99–€5.49 + IPv4 after April 2026 rises ([comparison](https://kimmo.suominen.com/stuff/cpc-2026-08.txt)) |
| n8n | Community Edition, self-hosted | 0.00 | ✅ | Open-source; tested with 2.42.6 |
| AI API (Claude) | Hard cap `AI_MONTHLY_BUDGET_GBP` | ≤ 15.00 | n/a | Calls stop at the cap; templates take over |
| Domain | .co.uk / .com (annual ÷ 12) | 1.50 | ❌ | Registrar pricing varies |
| Email | Free tier or registrar mailbox | 0–5.00 | ❌ | Needs SMTP + IMAP for Workflows 08/11/12 |
| Off-site backups | Backblaze B2 or similar | ~0.50 | ❌ | <10 GB |
| Supplier app | Free tier initially | 0–20.00 | ❌ | Avasam pricing conflicts (≈£15–£150 + VAT); confirm whether the free tier allows order routing |
| **Total (excluding supplier app)** |  | **≈ £47.50–£52.50** | | |
| **Total with a ~£20 supplier plan** |  | **≈ £67.50–£72.50** | | Within budget |
| Contingency (reserve, not spent) |  | 10.00 | | |

## Annual commitments (listed separately)
- Shopify annual billing (if chosen): about £228/year, saving ~£72/year. **Approval needed.**
- Domain registration: ~£10–£20/year.

## Per-sale costs (not in the software budget)
Built into the pricing engine (`ops-service/config/pricing.json`). Replace these with your real rates:
| Cost | Assumption |
|---|---|
| Shopify Payments, UK online cards (Basic) | 2% + £0.25 (higher for international/Amex) |
| Shopify transaction fee with Shopify Payments | £0 (a third-party gateway would add 2% on Basic) |
| Returns allowance | 6% of net revenue |
| Organic acquisition allowance | £1.50 per order |
| UK VAT | £0 while not registered (below £90,000); 1/6 of price if you register |

## Controls in the system
- **AI spend cap:** every Claude call is checked against the remaining monthly budget *before* it is made; actual token cost is recorded. Default model `claude-opus-5-5` ($4/$20 per million tokens). A support draft costs roughly £0.01–£0.02, so £15 covers ~1,000 drafts. Set `AI_MODEL=claude-haiku-5-5` (much cheaper) if you prefer.
- **Budget alert:** the daily report and dashboard flag when projected monthly software cost exceeds **£80** (`BUDGET_ALERT_GBP`).
- **Supplier exposure:** `AUTO_ORDER_MAX_GBP` (£75 per order) and `DAILY_AUTO_ORDER_CAP_GBP` (£300 per day). Above these, orders wait for approval.

## Not included in the software budget
Working capital and supplier payments (keep a **£300–£500 supplier-payment reserve**), income tax and NI, refunds and chargebacks, advertising, an optional accountant session (~£100–£250), the ICO fee (£52/year tier 1) and liability insurance.
