# Marketing bot guide

Everything an automated marketing agent needs to:

- read performance stats;
- publish blog posts;
- link to the right pages.

Replace `https://tools.apto-pro.com` below with the live `SITE_URL`.

> **Rules for the bot**
>
> - The stats API is read-only and contains no personal data. Don't try to reach any other `/api/` endpoint.
> - Never make claims the product can't back up:
>   - no "guaranteed to win your appeal";
>   - no "legal advice";
>   - no invented testimonials or user numbers.
> - Every parking content piece must include: "This is a letter-writing tool, not legal advice."
> - The CV tailor never invents experience. Don't market it as "makes your CV look better than it is".

---

## 1. Stats endpoint

```
GET https://tools.apto-pro.com/api/stats?key=<STATS_API_KEY>
```

- **Auth:** the `key` query parameter must equal the `STATS_API_KEY` environment variable. A wrong or missing key returns `401`.
- **Caching:** none (`no-store`). Calling it **at most once every 15 minutes** is plenty.
- **Time zone:** windows are UTC calendar days. `today` starts at 00:00 UTC; `last_7_days` and `last_30_days` include today.
- **Money:** GBP, in pounds (decimals), not pence.

### Response

```jsonc
{
  "generated_at": "2026-10-31T14:05:00.000Z",
  "currency": "GBP",
  "timezone": "UTC",
  "windows": {
    "today": {/* window, see below */},
    "last_7_days": {/* window */},
    "last_30_days": {/* window */},
  },
  "ai_spend": {
    "today_gbp": 0.84, // estimated AI cost so far today
    "daily_cap_gbp": 10, // DAILY_AI_BUDGET_GBP
    "checkouts_paused": false, // true = the kill switch is on; don't drive paid traffic now
    "daily": [
      { "date": "2026-10-31", "tokens_in": 52000, "tokens_out": 41000, "est_cost_gbp": 0.84 },
    ],
  },
  "tools": [
    {
      "id": "parking-appeal",
      "name": "Parking Ticket Appeal Letter",
      "route": "/parking-appeal",
      "price_gbp": 3.99,
    },
    {
      "id": "listing-writer",
      "name": "eBay & Vinted Listing Writer",
      "route": "/listing-writer",
      "price_gbp": 1.99,
      "uses_per_purchase": 10,
    },
  ],
}
```

Each **window** looks like this:

```jsonc
{
  "since": "2026-10-25T00:00:00.000Z",
  "totals": {
    "jobs_created": 120, // checkouts started (forms submitted)
    "jobs_paid": 41, // payments completed
    "failures": 1, // generations that failed (incl. failed listing uses)
    "refunds": 1, // automatic refunds issued
    "revenue_gbp": 158.59, // gross, before refunds and Stripe fees
    "net_revenue_gbp": 154.6, // minus refunds (Stripe fees not deducted)
    "conversion_rate_pct": 34.2, // jobs_paid ÷ jobs_created × 100
  },
  "per_tool": {
    "parking-appeal": {
      "jobs_created": 60,
      "jobs_paid": 22,
      "jobs_done": 22,
      "failures": 0,
      "refunds": 0,
      "revenue_gbp": 87.78,
      "refunded_gbp": 0,
      "net_revenue_gbp": 87.78,
      "conversion_rate_pct": 36.7,
    },
    "listing-writer": {
      "jobs_created": 10,
      "jobs_paid": 4,
      "jobs_done": 4,
      "failures": 0,
      "refunds": 0,
      "revenue_gbp": 7.96,
      "refunded_gbp": 0,
      "net_revenue_gbp": 7.96,
      "conversion_rate_pct": 40,
      "uses_completed": 23, // credit-pack tools only: listings actually written
    },
    // …one entry per live tool
  },
}
```

### How to use the numbers

| Signal                                                 | Meaning and suggested action                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `ai_spend.checkouts_paused: true`                      | The site is showing "Back shortly". Pause paid ads and scheduled promos until tomorrow (UTC)                  |
| Low `conversion_rate_pct` on a tool                    | People start but don't pay. Improve that landing page's copy or FAQ via a blog post, or test messaging        |
| High `jobs_created` but few visitors from your channel | The page converts well. Send it more traffic                                                                  |
| `failures` or `refunds` rising                         | Possible technical problem. Alert a human; don't promote that tool until it settles                           |
| `uses_completed` ÷ `jobs_paid` for the listing writer  | How much of each pack gets used. A high ratio means good retention, worth a "buy 10 more" reminder in content |

Visitor and traffic numbers aren't in this endpoint. If analytics is on (`PLAUSIBLE_DOMAIN`), use the Plausible Stats API for page views and sources.

---

## 2. Publishing blog posts

Posts are Markdown files in **`ai-tools/content/blog/`**. To publish, **commit a new `.md` file to the default branch**. Netlify rebuilds automatically, usually within 2–3 minutes. The post is then:

- pre-rendered as HTML at `/blog/<slug>` (good for SEO);
- listed on `/blog`, newest first;
- added to `sitemap.xml`.

### File rules

- **File name = URL slug.** Lowercase letters, numbers and hyphens only, for example `how-to-write-a-best-man-speech.md` → `/blog/how-to-write-a-best-man-speech`. Files with other characters are ignored.
- **Front matter** is required:

```markdown
---
title: How to write a best man speech (with a simple structure)
description: A plain-English guide to a best man speech that's funny, kind and the right length. 150 characters or fewer is ideal for search results.
date: 2026-11-04
---

Your opening paragraph…
```

| Field         | Required | Notes                                                              |
| ------------- | -------- | ------------------------------------------------------------------ |
| `title`       | yes      | Page title and H1. Aim for under 60 characters                     |
| `description` | yes      | Meta description and listing summary. Aim for under 155 characters |
| `date`        | yes      | `YYYY-MM-DD`. Controls the sort order and is shown on the post     |
| `draft`       | no       | `draft: true` hides the post (not built and not in the sitemap)    |

### Supported Markdown

The renderer is deliberately small. Stick to:

- `## Heading` and `### Subheading`. Don't use `#`, because the title is already the H1; a `#` line is shown as an H2.
- Paragraphs, separated by a blank line.
- `- bullet` lists and `1. numbered` lists. Keep each list item on one line.
- `**bold**`, `*italic*`, `` `code` `` and `> quote`.
- Links: `[text](/parking-appeal)` (internal) or `[text](https://…)` (external).
- Images: `![alt text](/blog-images/my-image.webp)`. Commit image files to `ai-tools/public/blog-images/`, ideally `.webp` under 150KB, and always write meaningful alt text.
- `---` for a horizontal rule.

Raw HTML is escaped (shown as text), not rendered. Tables and code blocks aren't supported.

### Content guidelines

- Every post should link to at least one tool landing page with descriptive anchor text, for example "our [parking appeal letter writer](/parking-appeal)".
- Write in British English, keep it plain and helpful, and cover one topic per post.
- Parking posts: include the disclaimer, and tell readers to check the deadline on their own ticket. Never cite specific laws, case names or statistics unless a human has verified them.
- Don't use real people's names, real tickets or real CVs as examples.

---

## 3. Landing page URLs

| Page                                | URL                                          | Primary keyword ideas                                                          |
| ----------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| Home                                | `/`                                          | AI tools UK, pay once                                                          |
| Parking appeal                      | `/parking-appeal`                            | parking ticket appeal letter, PCN appeal letter, private parking charge appeal |
| Bedtime story                       | `/bedtime-story`                             | personalised bedtime story, story with my child's name                         |
| Speech writer                       | `/speech-writer`                             | best man speech writer, eulogy writer, retirement speech, leaving speech       |
| Listing writer                      | `/listing-writer`                            | eBay listing description writer, Vinted description generator                  |
| CV tailor                           | `/cv-tailor`                                 | tailor CV to job description, cover letter writer UK                           |
| Blog                                | `/blog` and `/blog/<slug>`                   | (per post)                                                                     |
| Terms / Privacy / Refunds / Contact | `/terms`, `/privacy`, `/refunds`, `/contact` | (don't promote)                                                                |

- **Sitemap:** `/sitemap.xml`, which always reflects the live pages and posts.
- **Social images:** each tool has an Open Graph image at `/og/<tool-id>.png` (1200×630), already set in the page meta tags. `/og/default.png` covers everything else.
- **Never link to** `/t/…` (private order pages, set to noindex) or any `/api/…` URL.

### Tracking links

If Plausible is on, add UTM parameters to links you post, for example `/parking-appeal?utm_source=reddit&utm_medium=social&utm_campaign=pcn-guide`. They don't affect the page and don't set cookies.
