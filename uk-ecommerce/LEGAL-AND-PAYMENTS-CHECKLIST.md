# Legal, tax and payments checklist

**Status: launch BLOCKED until the items marked 🔴 are resolved.**
Researched 12 October 2026. This is research to prepare you for a qualified adviser, **not legal or tax advice**. Rules change. Confirm everything with a UK accountant who handles non-resident clients, and with a Qatar-qualified lawyer.

> **How this was researched:** this build environment could not open web pages directly; it could only run web searches and read their summaries. Every claim below names its source. Sources marked *(secondary)* are forums, vendor blogs or law-firm alerts, not the official rule-maker. Treat them as leads to verify, not facts.

---

## 1. Summary for the owner (plain English)

| # | Question | What we found | Status |
|---|---|---|---|
| 1 | Can you take card payments with **Shopify Payments UK** while living in Qatar? | Probably **not**. Shopify support is reported as saying a sole proprietor must personally live in the country of the account. A UK correspondence address is not enough. *(secondary)* | 🔴 Blocked: verify with Shopify |
| 2 | Is **Stripe** an option? | Stripe does not appear to onboard Qatar-based businesses. Sources conflict *(secondary)*. | 🔴 Assume no |
| 3 | Is **PayPal** an option? | PayPal's developer documentation lists Qatar as a "send, receive and withdraw" country. A Qatar PayPal Business account may be able to accept GBP payments on Shopify. Expect currency-conversion and cross-border fees. | 🟠 Most promising: verify |
| 4 | Do you need **UK VAT registration from your first sale**? | Very likely **yes**. If you are not "established" in the UK, you are a non-established taxable person (NETP). NETPs have **no VAT threshold** and must register from the first taxable UK supply. A UK correspondence address does not make you established. | 🔴 Adviser decision |
| 5 | Do you need a **Qatar e-commerce licence**? | Possibly. Ministerial Decision No. 25 of 2026 (in force 16 March 2026) says no person may carry on a commercial activity online without an MOCI e-commerce licence and commercial registration *(secondary: law-firm alerts)*. Whether it covers a Qatar resident selling only to UK customers through a UK shop is **unclear**. | 🔴 Qatar lawyer |
| 6 | Does your **Qatar residence permit** allow you to run a business? | Not researched in depth. Many employment-sponsored permits restrict outside business activity. | 🔴 Check with your employer/sponsor and lawyer |
| 7 | **UK income tax** (Self Assessment)? | Non-residents pay UK tax on profits from a trade carried on *in* the UK. Whether an online shop run from Qatar is trading *in* or *with* the UK is a technical question. The UK–Qatar double-taxation agreement is in force. | 🟠 Accountant |
| 8 | **Consumer law** (cancellation, refunds, privacy, cookies) | Policy drafts are in `docs/policies/`. They must be completed and checked. | 🟠 Complete drafts |

**Bottom line:** the technical system can be finished and tested. **Do not take real orders** until a payment provider has approved you *honestly* (with your real country of residence), your VAT position is settled, and you have Qatar-side clearance.

---

## 2. Payment processing

### 2.1 Shopify Payments (UK)
- Forum reports quote Shopify support: *"If you are a Sole Proprietor, the business owner must personally live in the country."* They also report UK accounts being declined or disabled when the owner lives abroad. Sources: [Shopify Community – company vs owner location](https://community.shopify.com/t/shopify-payments-companys-location-or-owner-location-to-be-allowed/80014), [UK Ltd owner in Morocco](https://community.shopify.com/t/can-a-uk-ltd-from-morocco-use-shopify-payments/281609), [third-party providers for non-residents](https://community.shopify.com/t/3rd-party-payment-providers-that-work-on-shopify-for-non-residents-uk/334795) *(secondary)*.
- Shopify's official help pages could not be fetched from this environment. **Action:** read Shopify Help Centre → *Shopify Payments requirements* for the United Kingdom and ask Shopify Support in writing: *"I am a British citizen resident in Qatar, trading as a UK sole trader with a UK correspondence address. Am I eligible for Shopify Payments UK?"* Keep the reply.
- **Do not** enter a UK address as your residential address to get approved. That is misrepresentation, and accounts closed for it can have payouts held.

### 2.2 Stripe
- Third-party 2025–2026 guides say Stripe does not directly support Qatar-registered businesses: [incorpuk](https://incorpuk.com/blog/how-to-open-stripe-account-in-qatar/), [zenind](https://www.zenind.com/help/post/how-to-open-a-stripe-account-in-qatar-a-practical-guide-for-global-businesses) *(secondary)*. Check Stripe's official country list before ruling it out.

### 2.3 PayPal Business (most promising route)
- PayPal's developer reference lists **Qatar: Send, receive, and withdraw**: [PayPal country & feature support](https://developer.paypal.com/docs/payouts/standard/reference/country-feature/).
- Local withdrawal details (QNB/Doha Bank, USD settlement) come from old or vendor pages *(secondary)*: [QNB PayPal page (marked expired 2021)](https://qnb.com/sites/qnb/qnbqatar/en/enpaypal.html), [PayRequest guide](https://payrequest.io/guides/accept-paypal-in-qatar).
- Shopify supports PayPal as a payment method. On plans where Shopify Payments is not used, Shopify charges an **extra third-party transaction fee** (the pricing engine assumes 2% for Basic; verify the current rate).
- **Actions:**
  1. Open a PayPal **Business** account in your real country (Qatar), as a sole proprietor.
  2. Confirm you can (a) receive GBP, (b) hold GBP or the conversion cost, (c) withdraw to a bank account in your name.
  3. Connect PayPal in Shopify → Settings → Payments, then run a real low-value test purchase **with your approval**.
- **Cost impact:** the pricing engine assumes 4.4% + 30p PayPal fees, 3% currency conversion and the 2% Shopify fee (`ops-service/config/pricing.json`). These are deliberately pessimistic. Replace them with your real rates.

### 2.4 Other routes to discuss with an adviser (not recommended without advice)
- Moving to the UK (residence) would change most answers above.
- A UK limited company does **not** solve the Shopify Payments issue on its own: reports say the owner's residence still matters *(secondary)*. It also adds Companies House filings, accounts and corporation tax.
- Merchant-of-record platforms (which sell to the customer in their own name) can remove VAT and payments complexity, but cost more per sale. Worth costing with your accountant.

**System status:** checkout is marked **BLOCKED** in `LAUNCH-CHECKLIST.md`. Everything else runs in test mode.

---

## 3. HMRC and UK tax

### 3.1 VAT: the most important item
- **Non-established taxable persons (NETPs) have no VAT registration threshold.** The £90,000 threshold applies only to UK-established businesses. NETPs must notify HMRC within 30 days of expecting to make taxable supplies. Sources: [HMRC VATREG37250](https://gov.uk/hmrc-internal-manuals/vat-registration-manual/vatreg37250), [Crunch on NETPs](https://www.crunch.co.uk/article-crunch-hub/non-established-taxable-persons-netps-and-vat-in-the-uk) *(secondary)*.
- **Are you established in the UK?** "Establishment" means a business establishment or fixed establishment, not citizenship or a correspondence address. A sole trader living and managing the business from Qatar is **likely a NETP**. Your accountant must confirm this.
- **Goods already in a UK warehouse when sold** (UK-stock dropshipping): HMRC says an overseas seller selling goods of **any value** located in the UK at the point of sale must register, charge and account for UK VAT. Source: [GOV.UK – VAT and overseas goods sold directly to customers in the UK](https://www.gov.uk/guidance/vat-and-overseas-goods-sold-directly-to-customers-in-the-uk).
- **Goods shipped from outside the UK, consignment ≤ £135:** the seller charges UK VAT at the point of sale, not import VAT. The £135 test is per consignment, excluding transport and insurance. Same source, plus the [policy paper](https://www.gov.uk/government/publications/changes-to-vat-treatment-of-overseas-goods-sold-to-customers-from-1-january-2021/changes-to-vat-treatment-of-overseas-goods-sold-to-customers-from-1-january-2021).
- **Consignments over £135 imported to consumers:** import VAT and customs duty apply at the border, and someone must be importer of record. **This project deliberately lists only UK-warehouse stock** to avoid this. Do not change that without advice.
- **Northern Ireland** has different rules. The system is configured to ship to Great Britain only (`SHIP_TO_COUNTRIES=GB`). Review this before adding NI.
- **Effect on the system:** pricing assumes **VAT-registered** (`vatRegistered: true`), so 1/6 of every VAT-inclusive price goes to HMRC. If your adviser says otherwise, change that one setting.

### 3.2 Income tax (Self Assessment)
- HMRC's International Manual says Self Assessment applies to non-residents chargeable on a trade carried on in the UK: [INTM261020](https://gov.uk/hmrc-internal-manuals/international-manual/intm261020).
- Practitioner commentary says a non-resident's trading income is taxable only to the extent the trade is carried on in the UK (ITTOIA 2005 s6). Non-residents usually file using the SA109 residence pages and may need paper or commercial software: [AccountingWEB](https://www.accountingweb.co.uk/any-answers/non-resident-and-self-employed), [HMRC community answer](https://community.hmrc.gov.uk/public/696caeb1-2e4a-ed11-bba2-6045bd0e73e7/forum-posts?page=37) *(secondary)*.
- **UK–Qatar double-taxation agreement:** signed 2009, in force 15 October 2010, amended by a 2011 protocol and modified by the MLI: [GOV.UK – Qatar tax treaties](https://www.gov.uk/government/publications/qatar-tax-treaties), [HMRC DT15900](https://gov.uk/hmrc-internal-manuals/double-taxation-relief/dt15900). Its permanent-establishment article may matter.
- Registering for Self Assessment as a non-resident sole trader is done with HMRC (form/online service for self-employment). Ask your accountant which route applies, and when.

### 3.3 Records
Keep records of every sale, refund, supplier invoice and fee. Shopify, PayPal and supplier exports do most of this. The ops database is **not** an accounting system. Ask whether Making Tax Digital for Income Tax applies to you.

---

## 4. Qatar

- **E-commerce licence (Ministerial Decision No. 25 of 2026):** issued 4 March 2026, in force 16 March 2026. Online commercial activity requires an MOCI e-commerce licence, commercial registration and a named platform/website (one licence per platform). The issuance fee is reported as QR500. Sources: [Al Tamimi](https://www.tamimi.com/news/qatar-introduces-new-licensing-requirements-for-e-commerce-activities/), [Crowell](https://crowell.com/en/insights/client-alerts/qatar-introduces-licensing-framework-for-e-commerce-activities-without-a-physical-premises), [Marhaba](https://marhaba.qa/qatar-introduces-new-licensing-requirements-for-e-commerce-activities/) *(secondary)*.
- **Open question for a Qatar lawyer:** does the decision apply to a Qatar resident who runs, from Qatar, a website selling only to UK consumers, with no Qatari customers or stock?
- **Residence permit / sponsor:** confirm your permit allows you to run a business, including a foreign one. Breaches can affect your residency.
- **Qatar tax:** ask whether personal business income from a foreign sole-trade business creates Qatar tax or registration obligations (the Dhareeba portal is used for registrations).

---

## 5. UK consumer protection, privacy and product safety

Drafts are in [`docs/policies/`](docs/policies/). Fill in every `[PLACEHOLDER]`, then have them checked.

| Requirement | Where handled | Status |
|---|---|---|
| Consumer Contracts Regulations 2013: pre-contract information, 14-day cancellation from delivery, refund within 14 days of return or proof of return | `returns-and-refund-policy.md`, `terms-and-conditions.md`, product page, cart, `ops-service/src/returns.js` | Draft |
| Consumer Rights Act 2015: satisfactory quality, 30-day right to reject faulty goods | Policies; faulty claims always escalate to you | Draft |
| Electronic Commerce Regulations 2002: trader name, geographic address, email, VAT number | Footer settings, contact page, `contact-information.md` | 🔴 Needs your legal name and a **geographic** address you are entitled to use (ask your adviser whether a correspondence address is acceptable) |
| UK GDPR / Data Protection Act 2018 | `privacy-policy.md`, data minimisation and retention in ops-service (90-day PII purge, `customers/redact` webhook) | Draft. **Check whether you must pay the ICO data protection fee** |
| PECR: marketing email consent, cookies | Newsletter consent checkbox; Shopify's built-in cookie banner; `cookie-policy.md` | Turn on Shopify's cookie banner (Settings → Customer privacy) |
| Product safety: General Product Safety Regulations 2005; Product Regulation and Metrology Act 2025 (powers, details still to come) | Product exclusions in the scoring engine; supplier compliance evidence required before listing | Ongoing. Request safety and REACH documents for each product |
| Complaints | `complaints-procedure.md` | Draft |
| Advertising (CAP Code): no false urgency, fake reviews or misleading discounts | Theme has no fake reviews or countdowns; content prompts forbid invented claims | Done |
| DMCC Act 2024 (fake reviews, drip pricing) | No reviews shown until genuine; all prices include VAT; delivery shown at checkout | Review with adviser |

Product-safety sources: [Lewis Silkin](https://www.lewissilkin.com/insights/2025/07/22/product-regulation-and-metrology-act-2025-becomes-law-102kuyo), [Intertek](https://www.intertek.com/products-retail/insight-bulletins/2025/1488-uk-product-regulation-metrology-act-2025/) *(secondary)*.

---

## 6. Questions to take to your advisers

**UK accountant (non-resident specialist):**
1. Am I "established" in the UK for VAT, or a NETP? Must I register before my first sale? Which VAT scheme suits a dropshipper?
2. Is my online shop a trade carried on *in* the UK for income tax, given I manage it from Qatar? What does the UK–Qatar treaty change?
3. How and when do I register for Self Assessment as a non-resident sole trader? Does Making Tax Digital apply?
4. Can I reclaim VAT charged by UK suppliers? How should PayPal currency conversion be recorded?
5. Is a sole trader, UK Ltd, or merchant-of-record platform best for me?
6. Is my UK correspondence address acceptable as the published trader address?

**Qatar lawyer:**
1. Does Ministerial Decision 25/2026 require me to hold an e-commerce licence and commercial registration for a UK-facing shop?
2. Does my residence permit/sponsorship allow this activity?
3. Any Qatar tax or reporting on the income?

**Shopify / PayPal (in writing):**
1. Shopify: am I eligible for Shopify Payments UK as described? If not, which gateways are available for my store?
2. PayPal: can my Qatar Business account receive GBP from UK buyers via Shopify? What are the fees, currency settings and withdrawal options?

---

## 7. Pre-launch compliance checklist

- [ ] 🔴 Written answer from Shopify on Shopify Payments eligibility
- [ ] 🔴 PayPal Business account approved in your real country of residence and connected to Shopify
- [ ] 🔴 Accountant's written advice on VAT (NETP status) and income tax
- [ ] 🔴 UK VAT registration completed **before the first sale**, if advised
- [ ] 🔴 Qatar lawyer's advice on e-commerce licence and residence permit
- [ ] Self Assessment registration (if advised)
- [ ] ICO data protection fee checked or paid
- [ ] All policies completed, reviewed and published in Shopify (Settings → Policies)
- [ ] Trader name, address, email and VAT number in footer and contact page
- [ ] Shopify cookie banner switched on and tested
- [ ] Safety/compliance documents on file for every listed product
- [ ] Supplier terms checked: returns process, image licence, liability
