# Marketing plan (organic first)

**Principles:** genuinely useful content; accurate product information only; no fake reviews, false urgency or misleading discounts (CAP Code, DMCC Act 2024); marketing email only with consent (PECR); nothing published without owner approval.

## Channels in priority order
| # | Channel | Automation | Status |
|---|---|---|---|
| 1 | **Pinterest** | Workflow 09 drafts pins weekly per product → you approve → Workflow 10 publishes (≤5/day, de-duplicated) | Drafting ✅; publishing waits for API access (manual upload until then) |
| 2 | **SEO** | Theme technical SEO; collection/meta copy; weekly buying-guide drafts (Mondays) | ✅ `marketing/seo/SEO-CONTENT.md` |
| 3 | **Short-form video** | Weekly script + storyboard per featured product | ✅ scripts; filming is manual (real footage only) |
| 4 | **Instagram / Facebook** | Weekly caption drafts; ready to upload | Manual posting (Meta API needs business verification) |
| 5 | **Email** | Shopify Email welcome/post-purchase; weekly newsletter section drafts | ✅ `marketing/email/EMAIL-SEQUENCES.md` |

## 30-day calendar
`marketing/30-DAY-CALENDAR.csv`: daily theme per channel, review days for the owner, and compliance notes.

## Weekly content rhythm (automatic, all into the approval queue)
- Daily 05:30: for 2 rotating products, one Pinterest pin, one Instagram caption and one short-video script (de-duplicated per product per ISO week).
- Mondays: a buying-guide draft and a newsletter section.
- Optional AI polish (Claude, within the monthly cap) for captions and pins. It may only rephrase; any new number makes the system discard the AI text.

## Measuring
- UTM tags on every generated link (`utm_source`, `utm_medium=organic`, `utm_campaign=<ISO week>`); check Shopify Analytics → Sessions by referrer.
- Optional: post weekly figures to `/api/metrics` so the weekly optimisation report includes conversion.
- Week 4 review: keep doing what drives saves/clicks; drop the rest.

## Paid advertising
Not included. Workflow 13 may *recommend* it, but no spending is authorised automatically.
