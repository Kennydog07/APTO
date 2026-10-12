# Niche research

**Recommendation (provisional): small-space home organisation for UK homes, with renter-friendly (no-drill) fixes. Kitchen-cupboard organisation is included, excluding food-contact products.**

Every score below is **PROVISIONAL**. The available data was market-research marketing pages and web-search summaries, not measured demand for specific products. This build could not run keyword-volume tools, Pinterest Trends or marketplace sales data. Re-score with real data in week 2 (see *How to firm this up*).

## Method
Each niche was scored 0–10 on the six weighted criteria from the brief by the product scoring engine (`ops-service/src/scoring.js`, `scoreNiche`). Weighted total out of 100:

| Criterion | Weight |
|---|---|
| Supplier reliability and UK delivery | 25% |
| Potential contribution margin | 25% |
| Demand and differentiation | 20% |
| Product safety and returns risk (higher = safer) | 15% |
| Organic marketing potential | 10% |
| Repeat sales and bundling | 5% |

## Results

| Rank | Niche | Supplier | Margin | Demand | Safety | Marketing | Repeat | **Score** |
|---|---|---|---|---|---|---|---|---|
| 1 | **Home organisation & storage** (small-space, renter-friendly) | 7 | 6 | 7 | 9 | 9 | 6 | **72.0** |
| 2 | Kitchen organisation (non-food-contact) | 7 | 6 | 7 | 7 | 9 | 6 | 69.0 |
| 3 | Pet accessories | 6 | 6 | 8 | 5 | 8 | 7 | 65.0 |
| 4 | Desk & office accessories | 6 | 6 | 6 | 8 | 6 | 4 | 62.0 |
| 5 | Travel accessories | 6 | 6 | 6 | 8 | 6 | 3 | 61.5 |

Niches 1 and 2 overlap heavily, so the store combines them: **home organisation, including kitchen cupboards, but no products that touch food**.

## Evidence and reasoning

**Home organisation**
- Demand drivers: a 2026 UK market report describes the sector as mature and value-driven. It points to small living spaces, renters wanting *non-permanent, no-drill* solutions, and social-media-driven organising, with a modest 3–5% growth rate ([SourceReady UK Storage & Organisation 2026](https://www.sourceready.com/report/detail/uk-storage-organization-market-report-2026), *AI-generated report; treat with caution*). A separate vendor forecast projects growth to 2031 ([Bonafide Research](https://www.bonafideresearch.com/product/2609001811/united-kingdom-home-storage-and-organization-market), *methodology unverified*).
- Supplier side: UK-warehouse marketplaces (e.g. Avasam) carry home and kitchen goods with Shopify integration. See `SUPPLIER-COMPARISON.md`.
- Safety: mostly passive, non-electrical products (plastic, steel, fabric, bamboo). The main risks are load-bearing claims, sharp edges and PVC chemical compliance. All are manageable with supplier documents.
- Marketing: "before and after" organisation content is native to Pinterest and short video, which suits an organic-first launch.
- Weakness: **low differentiation and price competition** from Amazon, IKEA, Dunelm and B&M. Differentiation has to come from curation, honest measurements and fit guidance, and small-space bundles. It cannot come from price.

**Pet accessories** score high on demand (dogs are the UK's most popular pet, per a Mintel figure quoted in search results; the original page was not verified). They lose on safety (chewing and ingestion risk, harness failures) and on returns from sizing. Market-size estimates conflict badly: one source says about $280m, another $1.17bn ([Market Data Forecast](https://www.marketdataforecast.com/market-reports/united-kingdom-pet-accessories-market), [Deep Market Insights](https://deepmarketinsights.com/vista/insights/pet-accessories-market/united-kingdom)). That conflict is itself a warning sign.

**Desk & office** and **travel** are viable but more competitive and less visual (desk), or seasonal with weaker repeat purchase (travel).

**Excluded at launch** (brief, section 5): food and food-contact, supplements, cosmetics, medicines, electrical items, baby and child products, toys, glass and ceramics, replicas. The scoring engine rejects these automatically.

## Key economic finding
For a UK sole trader using Shopify Payments (2% + 25p), not VAT-registered, with a £1.50 organic acquisition allowance, a 6% returns allowance and the 40% gross-margin target:

| Retail price | Max supplier cost + shipping (not VAT-registered) | If VAT-registered |
|---|---|---|
| £12.99 | £7.50 | £5.46 |
| £14.99 | £8.99 | £6.99 |
| £19.99 | £11.99 | £9.99 |
| £24.99 | £14.99 | £12.49 |

The 40% gross-margin rule sets the limit, and £3–£4 of fixed costs per order (card fee, acquisition, returns) eat a bigger share of cheap items. **Prefer products and bundles at £15 or more.** Remember that your margin shrinks by 1/6 if you register for VAT. These figures come from `npm run pricing-report`. See `product-data/pricing-dashboard.html`.

## Initial catalogue
See `PRODUCT-SHORTLIST.csv` (14 candidates). Supplier name, SKU, cost, stock, delivery estimate and image rights are **deliberately blank or "TO VERIFY"**. They must come from real supplier listings. The scoring engine marks all 14 as `needs_verification`. None can be published until verified and approved by you.

## How to firm this up (week 2)
1. Use free tools on your own computer: Pinterest Trends (UK), Google Trends (UK), and Shopify search data once live.
2. For each shortlisted product, record a real UK supplier listing: cost, shipping, UK stock, delivery estimate, image licence and compliance documents.
3. Update the CSV and run `npm run score-products` (in `ops-service/`). Products that reach `ready_for_approval` can go through Workflow 02.
