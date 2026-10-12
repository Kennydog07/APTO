# Legal, tax and payments checklist — UK sole trader

**Owner profile:** UK-resident sole trader, selling to UK consumers from UK-warehouse stock.
**Status: 🟠 no eligibility blockers found.** What remains is account set-up and paperwork you complete yourself (marked ☐).

Researched 12 October 2026. This is preparation for your own checks, **not legal or tax advice**. An hour with an accountant before launch is still worthwhile. Sources were read through web-search summaries (this environment cannot open pages directly). Third-party sources are marked *(secondary)*. Verify figures on GOV.UK before relying on them.

---

## 1. Summary

| # | Topic | What applies to you | Action |
|---|---|---|---|
| 1 | **Payments** | **Shopify Payments UK** is the natural choice for a UK-resident sole trader with a UK bank account. On Basic: **2% + 25p** per UK online card payment, with **no extra Shopify transaction fee** | ☐ Activate during store set-up (ID and bank verification) |
| 2 | **Self Assessment** | Register as self-employed. If gross trading income in a tax year exceeds the **£1,000 trading allowance**, the deadline is **5 October after that tax year ends**. Starting now (2026/27 tax year) → by **5 October 2027**. Registering early costs nothing | ☐ Register on GOV.UK when you start trading; you'll get a UTR |
| 3 | **VAT** | You are UK-established, so the **£90,000 registration threshold** applies (rolling 12 months, or expected within the next 30 days alone). Below it, registration is **optional** | ☐ Decide with your accountant. The system monitors the threshold for you |
| 4 | **Making Tax Digital for Income Tax** | Mandatory from **6 April 2026** above £50k qualifying income, **April 2027** above £30k, **April 2028** above £20k (gross income, not profit) | Plan bookkeeping software once turnover grows |
| 5 | **ICO data-protection fee** | An online shop holding customer data usually needs to pay. **Tier 1 £52** (£47 by direct debit) since Feb 2025; check for a 2026 change | ☐ Pay or use the ICO self-assessment |
| 6 | **Trader details on the website** | Your name, a **geographic address** and email must be shown (E-Commerce Regulations 2002) | ☐ Decide which address (see §5) |
| 7 | **Consumer law** | 14-day cancellation, Consumer Rights Act remedies, UK GDPR, PECR cookies/marketing | ☐ Complete the drafts in `docs/policies/` |
| 8 | **Product safety** | General Product Safety Regulations 2005; Product Regulation and Metrology Act 2025 | ☐ Supplier safety documents for each product |
| 9 | **Insurance** | Not legally required, but **public and product liability insurance** is strongly recommended for anyone selling physical goods | ☐ Get quotes |

---

## 2. Payments

### Shopify Payments (recommended)
- UK Basic plan: **2% + 25p** per UK online card payment, and no Shopify transaction fee when using Shopify Payments. A third-party gateway instead would add a **2% Shopify fee** on Basic. Sources *(secondary, checked July 2026)*: [Fena — Basic plan fees](https://www.fena.co/blog/shopify-basic-plan-payment-fees-uk-what-youre-actually-paying-per-order), [WorldFirst](https://www.worldfirst.com/uk/blog/global-business-tips/shopify-selling-fees-uk/), [ShopWired](https://www.shopwired.co.uk/shopify/pricing). International and Amex cards cost more.
- Onboarding asks for your personal details, ID and a **UK bank account in your name**. It's best to use a **separate account** for the business. It isn't a legal requirement for sole traders, but it makes bookkeeping far easier, and some personal accounts don't allow business use.
- New stores can have payouts held or delayed while Shopify reviews them. Keep the supplier-payment reserve (see `SUPPLIER-COMPARISON.md`).
- Turn on Shop Pay, Apple Pay and Google Pay (all included in Shopify Payments).

### PayPal (optional extra)
Many UK shoppers like PayPal. You can add it alongside Shopify Payments. ☐ Check PayPal's current UK merchant fee and whether Shopify charges a transaction fee on PayPal orders on your plan. If PayPal becomes a large share of sales, raise `paymentFeePct` in `ops-service/config/pricing.json`.

The pricing engine now uses these UK figures (`vatRegistered: false`, 2% + 25p, no FX or gateway surcharge).

---

## 3. Income tax and National Insurance
- **Register** for Self Assessment as self-employed via GOV.UK, using your National Insurance number and trading start date. HMRC issues a 10-digit **UTR**. Late registration can trigger a "failure to notify" penalty. *Sources (secondary):* [Zoho guide](https://www.zoho.com/uk/books/academy/taxes-and-compliance/register-as-self-employed-uk.html), [Start-up Donut on the trading allowance](https://startupdonut.co.uk/blog/24/12/what-if-christmas-sales-push-you-over-trading-allowance).
- **Trading allowance:** up to £1,000 of gross trading income a year is tax-free. Above that, you're taxed on profit (income minus allowable expenses), or you can deduct the £1,000 instead of expenses.
- **Tax return:** online by **31 January** after the tax year ends; payments on account may apply after your first year.
- **National Insurance:** Class 4 on profits above the threshold. Ask your accountant whether voluntary Class 2 contributions make sense for your State Pension record.
- **Making Tax Digital for Income Tax:** thresholds confirmed on GOV.UK. [Press release](https://www.gov.uk/government/news/sole-traders-and-landlords-earning-more-than-30000-urged-to-act-now), [policy paper](https://www.gov.uk/government/publications/extension-of-making-tax-digital-for-income-tax-self-assessment-to-sole-traders-and-landlords/making-tax-digital-for-income-tax-self-assessment-for-sole-traders-and-landlords). Qualifying income is **gross** turnover from self-employment and property.
- **Records:** keep sales, refunds, supplier invoices, fees and expenses for at least 5 years after the 31 January filing deadline. Shopify, Shopify Payments and supplier exports cover most of it. The ops database is **not** your accounts.

## 4. VAT
- **Threshold:** registration is compulsory if taxable turnover for the last 12 months goes over **£90,000**, or if you expect it to go over £90,000 in the next 30 days alone. You must notify HMRC within 30 days.
- **Built-in monitor:** ops-service tracks rolling 12-month paid-order turnover. It shows it on the dashboard (Finance) and flags it in the daily report at **75%** (warning) and **90%** (critical), or if the last 30 days alone exceed the threshold. Paid-order totals are a proxy; your accountant confirms the real taxable figure.
- **Below the threshold:** don't charge VAT and don't show a VAT number. In Shopify → Settings → Taxes, don't collect VAT. Prices are simply your prices.
- **Voluntary registration?** You could reclaim VAT on supplier invoices and business costs. But you'd have to add VAT to prices or absorb 1/6 of them. For a consumer-facing shop that is usually unattractive early on. Ask about the Flat Rate Scheme and its "limited cost trader" rules if you do register.
- **If you register later:** set `vatRegistered: true` in `ops-service/config/pricing.json` and run the pricing monitor. Products whose margins fall below the rules will be flagged for price review (changes over 10% need your approval).
- **Imports:** this project only lists **UK-warehouse stock**, which avoids import VAT, customs duty and the £135 low-value consignment rules. Keep it that way unless you take advice.
- **Northern Ireland:** different rules. The system ships to Great Britain only (`SHIP_TO_COUNTRIES=GB`).

## 5. Trader identity and address
- As a sole trader you can trade as **"[Your Name] trading as Nook & Order"**. You must not use "Ltd" or "Limited". Business name rules require your own name and an address on business documents and the website.
- The **E-Commerce Regulations 2002** require a **geographic address** where you can be contacted. If you'd rather not publish your home address, a business address service with a real street address is a common solution. Confirm it meets the requirement.
- Also show your email, and your VAT number if you become registered.
- Working from home: check your tenancy or mortgage terms and home insurance for business use. Small home-based online businesses rarely pay business rates, but confirm if you set aside space exclusively for the business.

## 6. Consumer protection, privacy and product safety
Drafts are in [`docs/policies/`](docs/policies/). Replace every `[PLACEHOLDER]`.

| Requirement | Where handled | Status |
|---|---|---|
| Consumer Contracts Regulations 2013: pre-contract info, 14-day cancellation from delivery, refund within 14 days | Policies, product page, cart, `ops-service/src/returns.js` | ☐ Complete drafts |
| Consumer Rights Act 2015: satisfactory quality, 30-day short-term right to reject | Policies; faulty claims always escalate to you | ☐ |
| E-Commerce Regulations 2002: name, geographic address, email | Footer settings, contact page | ☐ |
| UK GDPR / DPA 2018 | Privacy policy; data minimisation, 90-day PII purge, GDPR webhooks | ☐ Complete + ICO fee ([ICO fee rise to £52](https://acuitylaw.com/rise-in-ico-fees-data-protection-fees-february/), *secondary*) |
| PECR: cookies and marketing consent | Shopify cookie banner; newsletter consent checkbox | ☐ Turn banner on |
| Product safety: GPSR 2005; PRaM Act 2025 | Scoring engine exclusions; supplier documents required | ☐ Per product ([Lewis Silkin](https://www.lewissilkin.com/insights/2025/07/22/product-regulation-and-metrology-act-2025-becomes-law-102kuyo), *secondary*) |
| CAP Code / DMCC Act 2024: no fake reviews, false urgency, drip pricing | Theme has none; content rules forbid invented claims | ✅ |

## 7. Questions for an accountant (one session)
1. Should I register for VAT voluntarily, or wait for the threshold? If I register, Flat Rate or standard?
2. Which expenses can I claim (software, samples, home office, phone)? Trading allowance or actual expenses in year one?
3. Payments on account: what should I set aside each month?
4. Which bookkeeping or MTD software suits a Shopify store (it should import Shopify Payments payouts)?
5. Is a sole trader still right for me, or should I consider a limited company as turnover grows?

## 8. Pre-launch checklist
- [ ] Shopify Payments activated (ID verified, UK business bank account connected)
- [ ] Registered for Self Assessment (UTR received) or diary reminder set
- [ ] VAT decision recorded (default: not registered; monitor on)
- [ ] ICO fee paid or exemption confirmed
- [ ] Trader name, geographic address and email in footer and contact page
- [ ] All policies completed and published in Shopify
- [ ] Cookie banner on
- [ ] Safety/compliance documents on file for every listed product
- [ ] Supplier terms checked: returns, image licence, liability
- [ ] Public/product liability insurance (recommended)
