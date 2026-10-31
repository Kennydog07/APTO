# APTO Quick Tools: pay-per-use AI mini apps

Five small AI tools in one site. Each one works the same way: the visitor fills in a form, pays once with Stripe Checkout, the AI writes the result, and the visitor downloads it. There are no accounts and no logins. The site is built to run unattended: failed orders refund themselves, stuck jobs are swept up, and personal data deletes itself after 30 days.

| Tool           | Route             | Price        | Output                                                                                                   |
| -------------- | ----------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| Parking Appeal | `/parking-appeal` | £3.99        | Appeal letter (PDF + Word), evidence list, next steps                                                    |
| Bedtime Story  | `/bedtime-story`  | £2.99        | A5 PDF: cover, large-type pages, vector borders, "The End"                                               |
| Speech Writer  | `/speech-writer`  | £4.99        | Large-print PDF + Word, printable cue cards, `[pause]` markers                                           |
| Listing Writer | `/listing-writer` | £1.99 for 10 | eBay/Vinted title, description, category, specifics, condition and 5 keywords, each with a copy button   |
| CV Tailor      | `/cv-tailor`      | £4.99        | Tailored ATS-friendly CV and a one-page cover letter (PDF + Word each), changes list. Free match preview |

This folder is separate from the apto-pro.com static site in the repo root. It deploys as its **own Netlify site** with base directory `ai-tools`, so the two can't clash (both have a `/api/stripe-webhook`, `/privacy` and so on). Give it its own subdomain, such as `tools.apto-pro.com`.

**Contents:**

1. [Deploy to production, step by step](#deploy-to-production-step-by-step)
2. [Run and test locally](#run-and-test-locally)
3. [How it works](#how-it-works)
4. [Day-to-day maintenance](#day-to-day-maintenance)
5. [Dependencies](#dependencies)

For the stats API, blog posts and landing page URLs, see [`MARKETING_BOT.md`](./MARKETING_BOT.md).

---

## Deploy to production, step by step

Allow about an hour. Do the steps in this order, because later steps need values from earlier ones.

### Step 1: Supabase (database and file storage)

1. Sign in at [supabase.com](https://supabase.com) and create a **new project**. Choose the **London (eu-west-2)** region; keeping data in the UK makes UK GDPR simpler. Save the database password somewhere safe.
2. When the project is ready, open **SQL Editor → New query**. Paste in the whole of `supabase/migrations/0001_init.sql` and click **Run**. Then do the same for `supabase/migrations/0002_credit_packs.sql`. Always run migrations **in number order**, and run each one only once.
3. Check it worked:
   - **Table Editor** shows `jobs`, `credits`, `daily_spend` and `rate_limits`, each marked "RLS enabled".
   - **Storage** shows a **private** bucket called `outputs`.
4. Open **Project Settings → API** (on newer dashboards: **API Keys**) and copy two values:
   - the **Project URL**, which becomes `SUPABASE_URL`;
   - the **`service_role` secret key**, which becomes `SUPABASE_SERVICE_ROLE_KEY`. This key bypasses all security rules. Only ever put it in Netlify's environment variables, never in frontend code or `VITE_` variables.

You don't need the `anon` or public key. The browser never talks to Supabase directly.

### Step 2: Anthropic (AI)

1. In the [Claude Console](https://platform.claude.com), create an API key. This becomes `ANTHROPIC_API_KEY`.
2. Under **Billing / Limits**, set a **monthly spend limit**. This is a second safety net on top of the app's own daily budget (`DAILY_AI_BUDGET_GBP`).
3. Model choice:
   - `ANTHROPIC_MODEL` defaults to `claude-sonnet-5-5` and is used for all paid generations.
   - `ANTHROPIC_PREVIEW_MODEL` defaults to `claude-haiku-5-5` and is used only for the free CV match preview.

### Step 3: Resend (emails with download links)

1. Sign up at [resend.com](https://resend.com), then go to **Domains → Add domain**. Use a subdomain you control, such as `mail.apto-pro.com`, so the main domain's email reputation is kept separate.
2. Resend shows DNS records (SPF, DKIM and an MX record for bounces). Add them exactly as shown at your DNS provider, then click **Verify**. DNS can take from a few minutes to a few hours to update.
3. Optional but recommended: add a DMARC record (`_dmarc` TXT, for example `v=DMARC1; p=none;`) to improve deliverability.
4. Go to **API Keys → Create API key** with **Sending access** only. This becomes `RESEND_API_KEY`.
5. Set `FROM_EMAIL` to an address on the verified domain, for example `APTO Quick Tools <hello@mail.apto-pro.com>`.
6. Replies go to `contactEmail` in `src/config/brand.ts`. Make sure someone reads that inbox.

If Resend isn't set up, the site still works. Emails are skipped (with a warning in the logs) and customers use the results page.

### Step 4: Stripe (payments)

**You don't need to create products in Stripe.** Prices live in `shared/tools.ts`, and every Checkout Session sends its own price (`price_data`). To change a price, edit that file and redeploy.

1. In the [Stripe Dashboard](https://dashboard.stripe.com), finish **account activation** (business details and bank account) so you can take live payments.
2. **Settings → Business → Public details:** set your business name, support email and statement descriptor (for example `APTO TOOLS`). Customers see these on Checkout and on bank statements.
3. **Settings → Payments → Checkout and Payment Links → Branding:** add your logo and brand colour (`#1d4ed8`).
4. **Settings → Customer emails:** turn on **successful payments** and **refunds**, so Stripe sends receipts and refund confirmations.
5. **Developers → API keys:** copy the **Secret key** (`sk_live_…`). This becomes `STRIPE_SECRET_KEY`. Use `sk_test_…` until you're ready to take real money.
6. The webhook is set up in Step 6, once you know the site's URL.

### Step 5: Netlify (hosting and functions)

1. In [Netlify](https://app.netlify.com), choose **Add new project → Import an existing project → GitHub**, then pick this repository.
2. Under build settings, set **Base directory** to `ai-tools`. Leave the build command and publish directory blank; they come from `ai-tools/netlify.toml` (`npm run build` → `dist`, functions in `netlify/functions`).
3. Before the first deploy, go to **Project configuration → Environment variables** and add the variables below. Make sure each one's scope includes **Builds** and **Functions**.

   | Variable                                    | Value                                                                                                                                             |
   | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `ANTHROPIC_API_KEY`                         | From Step 2                                                                                                                                       |
   | `ANTHROPIC_MODEL`                           | `claude-sonnet-5-5` (optional)                                                                                                                    |
   | `ANTHROPIC_PREVIEW_MODEL`                   | `claude-haiku-5-5` (optional)                                                                                                                     |
   | `STRIPE_SECRET_KEY`                         | From Step 4                                                                                                                                       |
   | `STRIPE_WEBHOOK_SECRET`                     | From Step 6 (add it after the first deploy)                                                                                                       |
   | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | From Step 1                                                                                                                                       |
   | `RESEND_API_KEY`, `FROM_EMAIL`              | From Step 3                                                                                                                                       |
   | `SITE_URL`                                  | Your public URL with no trailing slash, such as `https://tools.apto-pro.com`. Used for Stripe return URLs, emails, canonical URLs and the sitemap |
   | `STATS_API_KEY`                             | A long random string, for example from `openssl rand -hex 32`. Give it to the marketing bot                                                       |
   | `DAILY_AI_BUDGET_GBP`                       | Daily AI spend cap, such as `10`                                                                                                                  |
   | `PLAUSIBLE_DOMAIN`                          | Optional. Your domain in Plausible, which turns on cookie-free analytics                                                                          |
   | `LISTING_SYNC_TIMEOUT_MS`                   | Optional. Default `20000`                                                                                                                         |

4. Click **Deploy**. When it finishes, open the site and check that the home page and all five tool pages load.
5. **Custom domain:** go to **Domain management → Add a domain**, enter `tools.apto-pro.com`, and add the CNAME record Netlify shows. HTTPS is set up automatically. Then update `SITE_URL` to match and **redeploy**. Environment variables only take effect on a new deploy.

### Step 6: Stripe webhook

1. In Stripe, open **Developers → Webhooks** (also called **Workbench → Event destinations**), then **Add endpoint** or **Add destination**.
2. Set the endpoint URL to `https://<your-domain>/api/stripe-webhook`.
3. Select these events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.expired`
4. Save, then reveal the **Signing secret** (`whsec_…`). Put it in Netlify as `STRIPE_WEBHOOK_SECRET` and **redeploy**.
5. Test mode and live mode have **separate** webhooks and secrets. Set this up in each mode you use.

### Step 7: Go-live checklist

- [ ] Do one real purchase with a live card for the cheapest tool (bedtime story, £2.99). Check you get the PDF and the email, then refund yourself from the Stripe Dashboard.
- [ ] In Netlify, open **Logs → Functions** and check `sweeper` and `retention-cleanup` are listed. Scheduled functions only run on the **published production deploy**. Use **Run now** to try them once.
- [ ] Run `curl "https://<your-domain>/api/stats?key=<STATS_API_KEY>"` and check it returns JSON.
- [ ] Check `https://<your-domain>/sitemap.xml` and `/robots.txt`, then submit the sitemap in Google Search Console.
- [ ] Read the legal pages (`/terms`, `/privacy`, `/refunds`, `/contact`) and confirm the business name and contact details in `src/config/brand.ts`. I wrote them as a careful starting point; they haven't been reviewed by a lawyer.
- [ ] Run Lighthouse (Chrome DevTools → Lighthouse, mobile) on each landing page. The targets are 90+ for performance, SEO and accessibility. A local production build with compression scored 99–100 for performance and 100 for accessibility and SEO.
- [ ] Set your Anthropic monthly limit (Step 2) and a Stripe balance alert.

---

## Run and test locally

### Set up

```bash
cd ai-tools
npm install
cp .env.example .env     # fill in TEST keys: sk_test_…, and SITE_URL=http://localhost:8888
```

Use a separate Supabase project for development if you can, with both migrations run.

### Automated checks (no keys needed)

```bash
npm test            # 107 unit tests: prompts, parsers, prices, kill switch, PDF/DOCX, credits, CV checks
npm run typecheck
npm run lint
npm run build       # client build + pre-render + sitemap/robots into dist/
```

### End-to-end test against Stripe test mode

```bash
# Terminal 1. The Netlify CLI runs functions, background functions and redirects locally
npx netlify dev

# Terminal 2 (one run per tool)
npm run e2e                              # parking appeal
npm run e2e -- --tool=bedtime-story
npm run e2e -- --tool=speech-writer
npm run e2e -- --tool=listing-writer     # buys a pack, checks the token, writes 1 listing
npm run e2e -- --tool=cv-tailor          # also tests CV upload (DOCX) and the free preview
```

The script uses your `.env` and **refuses to run with a live Stripe key**. For each tool it:

1. Creates a job and checks it gets a real Checkout URL.
2. Pays with a real test PaymentIntent (`pm_card_visa`) and sends a correctly **signed** `checkout.session.completed` webhook. It also checks that a badly signed one is rejected.
3. Waits for `done` and downloads every file, checking the PDF and DOCX file headers.
4. Tests the free regeneration (or, for the listing writer, credits and duplicate-request handling).
5. **Failure path:** forces a failure (this only works in test mode), then checks the job is `failed` and fully refunded in Stripe.
6. Checks that `/api/stats` rejects a wrong key and shows today's paid jobs.

To also see the emails, set `E2E_EMAIL=you@example.com`. A run costs a few pence of AI usage.

### Manual test in a browser (real Checkout page)

```bash
stripe listen --forward-to localhost:8888/api/stripe-webhook
# copy the whsec_… it prints into STRIPE_WEBHOOK_SECRET in .env, then restart netlify dev
npx netlify dev
```

Open a tool page, fill in the form, and pay with `4242 4242 4242 4242` (any future expiry date and any CVC). You can also run `npm run e2e -- --manual`, which prints a Checkout URL and then checks the result for you.

### Test the guards

| What           | How                                                                                                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kill switch    | Set `DAILY_AI_BUDGET_GBP=0` and restart. Forms show "Back shortly", `create-job` returns 503, and the CV preview is off                                                                                                 |
| Rate limits    | `create-job`: 10 per IP per hour. CV preview: 3 per IP per day. CV upload: 20 per hour. Listings: 30 per hour                                                                                                           |
| Scheduled jobs | `npx netlify functions:invoke sweeper` and `npx netlify functions:invoke retention-cleanup`                                                                                                                             |
| Sample outputs | `npm run seed` calls Claude once per tool (a few pence) and rewrites `src/samples/<tool>.json`. Use `npm run seed -- cv-tailor` for one tool. The listing writer's sample is hand-written, because it needs real photos |

---

## How it works

### Purchase and generation flow

```
form ──POST /api/create-job──► jobs row (awaiting_payment) + Stripe Checkout Session
                                   │
                    customer pays on Stripe
                                   ▼
            POST /api/stripe-webhook (signature verified) ──► status=paid
                                   │  (HMAC-signed call)
                                   ▼
        generate-background: claim job → Claude → zod-validate → PDF/DOCX
              → Supabase Storage (private "outputs" bucket) → status=done → email link
              ✗ after 3 attempts → status=failed → automatic full refund → apology email
                                   │
   /t/<tool>/done?job=<id> polls /api/job-status every 3s → inline result + 7-day signed downloads
```

**The listing writer is a credit pack.** Buying a pack goes through the same flow, but "generation" creates a 32-character token in `credits` and emails a magic link (`/listing-writer?token=…`). Each listing then runs through `POST /api/listing-generate`:

1. It spends a credit atomically.
2. It writes the listing synchronously, within up to 20 seconds.
3. If that runs out of time, it hands over to the background function and the page polls.
4. If the listing fails, the credit is given back.

### Code map

| Path                      | Purpose                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `shared/tools.ts`         | **Prices**, routes, `max_tokens`, credit-pack sizes and SEO copy for every tool (the single source of truth)      |
| `shared/budget.ts`        | AI cost estimate and the kill-switch logic                                                                        |
| `shared/schemas/`         | zod schemas for form inputs (used by both the browser and the server)                                             |
| `prompts/<tool>.ts`       | `buildSystemPrompt`, `buildUserPrompt`, `max_tokens`, `parseOutput` (zod-validated, with honesty checks)          |
| `netlify/lib/pipeline.ts` | Shared generation, retry, refund and email logic                                                                  |
| `netlify/lib/generators/` | Per-tool code that turns AI JSON into files. Every tool is registered in `index.ts`                               |
| `netlify/lib/docs/`       | PDF (pdf-lib) and Word (docx) builders                                                                            |
| `netlify/functions/`      | API endpoints, the background job and scheduled jobs                                                              |
| `src/`                    | React SPA. Each tool lives in `src/tools/<tool>/`. `src/config/brand.ts` holds the name, logo and contact details |
| `content/blog/*.md`       | Blog posts, pre-rendered at build time                                                                            |
| `scripts/`                | Pre-render, seed, e2e test and OG image generator                                                                 |
| `supabase/migrations/`    | Database schema; run these in order                                                                               |

### Endpoints

| Endpoint                              | Notes                                                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /api/create-job`                | 10 per IP per hour. Returns 503 `{paused:true}` when the daily budget is used up                                                                                         |
| `POST /api/stripe-webhook`            | Handles `checkout.session.completed`, `async_payment_succeeded` and `expired`                                                                                            |
| `GET /api/job-status?job=`            | Polled by the done page. Never returns inputs or email                                                                                                                   |
| `POST /api/regenerate`                | Uses the job's one free regeneration (not for credit packs)                                                                                                              |
| `POST /api/listing-generate`          | Spends 1 credit and writes a listing from 1–3 photos. Synchronous up to `LISTING_SYNC_TIMEOUT_MS` (default 20s), then background. A failed listing gives its credit back |
| `GET /api/credits?token=`             | Credits left on a magic link                                                                                                                                             |
| `POST /api/cv-extract`                | Reads text from a PDF/DOCX CV (max 2MB). No AI, nothing stored                                                                                                           |
| `POST /api/cv-preview`                | Free 3-bullet match summary: the **only** pre-payment AI call. 300 tokens, 3 per IP per day, off when over budget                                                        |
| `GET /api/site-status`                | `{accepting}`. Forms show "Back shortly" when this is false                                                                                                              |
| `GET /api/stats?key=`                 | Anonymised stats for the marketing bot (see `MARKETING_BOT.md`)                                                                                                          |
| `sweeper` (every 10 min)              | Re-triggers paid jobs that never started, fails and refunds stuck jobs, retries refunds that errored                                                                     |
| `retention-cleanup` (03:17 UTC daily) | Wipes inputs, results, emails and files after 30 days, and expires abandoned checkouts                                                                                   |

### Reliability and cost guards

- **Idempotent.** Generation atomically claims a job (`paid → generating`), so duplicate webhooks or triggers do nothing. Refunds and Checkout Sessions use Stripe idempotency keys, and credit-pack fulfilment is unique per job.
- **Kill switch.** Before any new checkout or free preview, the app reads `daily_spend`. If the database can't be read, it **fails closed** (checkouts pause). Orders that are already paid always finish. Listing credits keep working up to twice the daily cap.
- **Hard caps.** Each tool has a fixed `max_tokens`. On `claude-sonnet-5-5`, thinking is switched off (`between_tools`) so the whole budget goes to the answer. Anthropic's server-side refusal fallback (`fallbacks: "default"`) is switched on.
- **Validated output.** The model returns JSON, which is checked with zod and parsed again once if it fails. Each tool also runs its own checks:
  - the story must mention the child's name;
  - the speech must be roughly the requested length;
  - the listing must contain no prices;
  - the CV must contain **no employer, institution or year that isn't in the original**.
- **Privacy by default.**
  - IPs are hashed before they reach the database.
  - Listing photos are deleted as soon as the listing is written.
  - CV files are read in memory and never stored.
  - Everything personal is wiped after 30 days.

---

## Day-to-day maintenance

| Task                              | How                                                                                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Change a price                    | Edit `pricePence` in `shared/tools.ts`, commit and push. Netlify redeploys                                                                                 |
| Change the brand                  | Edit `src/config/brand.ts` and replace `public/logo.jpg`. Regenerate OG images with `NODE_PATH=$(npm root -g) node scripts/make-og.mjs` (needs Playwright) |
| Raise or lower the AI budget      | Change `DAILY_AI_BUDGET_GBP` in Netlify, then redeploy                                                                                                     |
| Switch AI model                   | Set `ANTHROPIC_MODEL` and redeploy. Check the price table in `shared/budget.ts` covers it (unknown models are costed pessimistically)                      |
| Turn a tool off                   | Set `live: false` in `shared/tools.ts`. It disappears from navigation, the sitemap and checkout                                                            |
| See what's happening              | Netlify **Logs → Functions**; Supabase **Table Editor → jobs**; `/api/stats`                                                                               |
| A customer can't find their files | Find their job in Supabase `jobs` by `email`, then send them `https://<domain>/t/<tool>/done?job=<id>` (it works for 30 days)                              |
| Manual refund                     | Refund in Stripe, using the `job_id` in the payment metadata                                                                                               |
| Database change                   | Add `supabase/migrations/0003_….sql` and run it in the SQL Editor. Never edit migrations that have already been run                                        |

---

## Dependencies

The runtime dependencies are the ones the spec lists, plus the official clients they need: `@anthropic-ai/sdk`, `stripe`, `@supabase/supabase-js`, `resend`, `docx`, `pdf-lib`, `mammoth`, `pdf-parse`, `zod`, `react` and `react-dom`. Dev dependencies cover Vite, Tailwind, TypeScript, Vitest, ESLint and Prettier, plus `@netlify/functions` for types.

These were deliberately **not** added:

- **A router.** `src/lib/router.tsx` is about 60 lines and does the job.
- **A Markdown library.** `src/lib/markdown.ts` covers headings, lists, links, bold and italic, quotes and images.
- **An SSG plugin.** Pre-rendering is `scripts/prerender.mjs`, using Vite's SSR build.
- **`@pdf-lib/fontkit`.** The PDFs use pdf-lib's built-in fonts. Adding fontkit would allow custom fonts, such as a rounded font for the bedtime story, and full Unicode in names. Letters without a built-in glyph are mapped to the closest equivalent (for example Ł → L).

`cv-extract` keeps `mammoth` and `pdf-parse` as external modules in `netlify.toml`, because pdf-parse loads a PDF.js worker at runtime.
