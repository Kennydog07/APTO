# Owner operations

Design target: **15–30 minutes a day in month one**, less once stable. This is a target, not a guarantee.

## Daily (≈15 min, from your phone)
1. Read the **07:30 daily report email**. It ends with "NEEDS YOUR ATTENTION" or "Nothing needs your attention today".
2. Open the dashboard (`https://ops.<domain>/dashboard`) → **Approvals**:
   - *Order fulfilment*: orders held for value, risk or pause. Approve or reject. If you reject, refund the customer in Shopify.
   - *Manual purchase / supplier payment*: place or pay the supplier order, then approve.
   - *Price change, product publication, return case, refund*.
3. **Marketing** tab: approve or reject today's drafts (2–5 minutes).
4. **Alerts** tab: resolve anything critical. Critical alerts are also emailed once.

## Weekly (≈30 min, Monday)
- Read the **weekly optimisation email** (sales by product, return rate, supplier issues, recommendations).
- Decide replacements for products with no sales in 14 days, using Workflow 01's research email.
- Check the PayPal/Shopify payout reconciliation and keep records for your accountant.

## Monthly
- Check costs against `OPERATING-COSTS.md` (the dashboard Finance card shows the projection).
- Test-restore a backup (`DISASTER-RECOVERY.md`, 15 minutes).
- Review policies and supplier documents for changes.

## Things only you do (by design)
- Approve new products and any large price change.
- Handle disputes, chargebacks, complaints, safety issues and discretionary refunds.
- Issue refunds (in Shopify admin).
- Approve any spending, subscription or marketing campaign.
- Keep tax, VAT and legal compliance up to date.

## Emergency controls (dashboard → Overview)
| Switch | Effect |
|---|---|
| Automatic supplier orders | New orders go to your approval queue instead of suppliers |
| New product publication | Approved products stay as drafts; restocked products are not re-published |
| Marketing publication | Nothing is published, even if approved |
| Automatic price changes | All price changes need approval |

Automations can **pause** these switches (fail-safe) but only you can **resume** them, from the dashboard.

## If something goes wrong
| Situation | What to do |
|---|---|
| "Outcome unknown" supplier alert | Log in to the supplier account and check whether the order exists. If yes, approve it in the dashboard as placed; if no, place it manually. **Never** just retry |
| Order cancelled after supplier submission | Cancel with the supplier and check the refund |
| Customer says parcel not delivered | Check tracking; contact the supplier; this is your responsibility, not the customer's |
| Safety complaint | Pause the product (Products → set to draft in Shopify), contact the supplier, keep records. Consider reporting to Trading Standards via the government Product Safety Database if there is a serious risk |
| Dashboard unreachable | `ssh` in, run `docker compose ps` and `docker compose logs --tail=100 ops-service` |
