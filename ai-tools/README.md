# APTO Quick Tools: pay-per-use AI mini apps

This folder holds five small AI tools. Each one works the same way: the visitor fills in a form, pays once with Stripe Checkout, the AI writes the result, and the visitor downloads it. There are no accounts.

> **Status: Phases 1 and 2 are done.** Live tools: Parking Appeal (£3.99), Bedtime Story (£2.99) and Speech Writer (£4.99). Tools 4 and 5 are set up in `shared/tools.ts` with `live: false`, so they are hidden until they are built.
>
> | Tool           | Route             | Output                                                         |
> | -------------- | ----------------- | -------------------------------------------------------------- |
> | Parking Appeal | `/parking-appeal` | Letter as PDF + DOCX, evidence list, next steps                |
> | Bedtime Story  | `/bedtime-story`  | A5 PDF: cover, large-type pages, vector borders, "The End"     |
> | Speech Writer  | `/speech-writer`  | Large-print PDF + DOCX, printable cue cards, `[pause]` markers |

This project is separate from the existing apto-pro.com static site in the repo root. It deploys as its **own Netlify site** with base directory `ai-tools`, so it can't clash with that site's `/api/stripe-webhook`, `/privacy` and similar paths. You can point a subdomain at it later (for example `tools.apto-pro.com`).

## How it works

```
form ──POST /api/create-job──► jobs row (awaiting_payment) + Stripe Checkout Session
                                   │
                    customer pays on Stripe
                                   ▼
            POST /api/stripe-webhook (signature verified) ──► status=paid
                                   │  (HMAC-signed call)
                                   ▼
        generate-background: claim job → Claude → zod-validate → PDF + DOCX
              → Supabase Storage (private "outputs" bucket) → status=done → email link
              ✗ after 3 attempts → status=failed → automatic full refund → apology email
                                   │
   /t/<tool>/done?job=<id> polls /api/job-status every 3s → inline result + 7-day signed downloads
```

| Path                      | Purpose                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `shared/tools.ts`         | Prices, routes, `max_tokens` and SEO copy for every tool (the single source of truth) |
| `shared/budget.ts`        | Cost estimate and kill-switch logic                                                   |
| `shared/schemas/`         | zod schemas for form inputs (used by both the browser and the server)                 |
| `prompts/<tool>.ts`       | `buildSystemPrompt`, `buildUserPrompt`, `max_tokens`, `parseOutput`                   |
| `netlify/lib/pipeline.ts` | Shared generation, retry, refund and email logic                                      |
| `netlify/lib/generators/` | Per-tool code that turns AI JSON into files. Register new tools in `index.ts`         |
| `netlify/functions/`      | API endpoints, the background job and scheduled jobs                                  |
| `src/`                    | React SPA. `src/config/brand.ts` holds the site name, logo and contact details        |
| `content/blog/*.md`       | Blog posts, pre-rendered at build time                                                |
| `supabase/migrations/`    | Database schema                                                                       |

### Endpoints

| Endpoint                    | Notes                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `POST /api/create-job`      | Rate limit: 10 per IP per hour. Returns 503 `{paused:true}` once the daily budget is used up         |
| `POST /api/stripe-webhook`  | Handles `checkout.session.completed` and `checkout.session.expired`                                  |
| `GET /api/job-status?job=`  | Polled by the done page. Never returns inputs or email                                               |
| `POST /api/regenerate`      | Uses the job's one free regeneration                                                                 |
| `GET /api/site-status`      | Returns `{accepting}`. Forms show "Back shortly" when this is false                                  |
| `GET /api/stats?key=`       | Anonymised stats for the marketing bot                                                               |
| `sweeper` (every 10 min)    | Re-triggers paid jobs that never started, fails and refunds stuck jobs, retries refunds that errored |
| `retention-cleanup` (daily) | Wipes inputs, results, emails and files after 30 days, and expires abandoned checkouts               |

### Reliability and cost guards

- **Idempotency.** Generation atomically claims a job (`paid → generating`), so duplicate webhooks or triggers do nothing. Refunds use Stripe idempotency keys.
- **Kill switch.** The kill switch reads `daily_spend`. If the database can't be read, it **fails closed**: checkouts pause. Jobs that are already paid always finish.
- **AI call settings.** `max_tokens` is a hard cap per tool. On `claude-sonnet-5-5`, thinking is switched off (`between_tools`) so the whole budget goes to the answer. Anthropic's server-side refusal fallback (`fallbacks: "default"`) is switched on.
- **Regeneration failures.** If a free regeneration fails, the original result is kept and nothing is refunded, because the customer already has a good result.

## Phase 1: set up and test

### 1. Supabase (about 5 minutes)

1. Create a project at supabase.com. A London (eu-west-2) region suits UK GDPR.
2. Open **SQL editor**, paste in `supabase/migrations/0001_init.sql` and run it. This creates the tables, the RLS lock-down, the helper functions and the private `outputs` bucket.
3. Go to **Project settings → API** and copy the Project URL and the `service_role` key.

### 2. Environment

```bash
cd ai-tools
npm install
cp .env.example .env     # then fill in the values
```

Use **Stripe test keys** (`sk_test_…`). Set `SITE_URL=http://localhost:8888`. Resend is optional while testing: if it isn't configured, emails are skipped and a warning is logged.

### 3. Automated checks (no keys needed)

```bash
npm test            # 70 unit tests: prompt builders, parsers, prices, kill switch, PDF/DOCX, markdown
npm run typecheck
npm run lint
npm run build       # client build + pre-render + sitemap/robots into dist/
```

### 4. End-to-end test against Stripe test mode

```bash
# Terminal 1. The Netlify CLI runs functions, background functions and redirects locally
npx netlify dev

# Terminal 2
npm run e2e                              # parking appeal
npm run e2e -- --tool=bedtime-story
npm run e2e -- --tool=speech-writer
```

The script uses your `.env` and **refuses to run with a live Stripe key**. It does the following:

1. Creates a job and checks it gets a real Checkout URL.
2. Pays with a real test PaymentIntent (`pm_card_visa`) and sends a correctly **signed** `checkout.session.completed` webhook. It also checks that a bad signature is rejected.
3. Waits for `done`, checks the inline letter, then downloads the PDF and DOCX and checks the file headers.
4. Uses the free regeneration and checks that a second regeneration is refused.
5. **Failure path:** creates a job flagged to fail (this only works in test mode), pays, and waits about 30 seconds for the retries. It then checks the job is `failed` and refunded, with exactly one £3.99 refund in Stripe.
6. Checks that `/api/stats` rejects a wrong key and shows today's paid jobs.

To also see the emails, set `E2E_EMAIL=you@example.com`.

### 5. Manual test in a browser (real Checkout page)

```bash
stripe listen --forward-to localhost:8888/api/stripe-webhook
# copy the whsec_… it prints into STRIPE_WEBHOOK_SECRET in .env, then restart netlify dev
npx netlify dev
```

1. Open http://localhost:8888/parking-appeal and fill in the form.
2. Pay with card `4242 4242 4242 4242`, any future expiry date and any CVC.
3. You land on `/t/parking-appeal/done?job=…`. Within about a minute the letter appears, with PDF and Word download buttons.
4. Click **Not quite right? Regenerate once free**, enter a note, and watch it update.

You can also run `npm run e2e -- --manual`, which prints a Checkout URL and then checks the result for you.

### 6. Test the guards

| What          | How                                                                                                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kill switch   | Set `DAILY_AI_BUDGET_GBP=0` and restart. The form shows "Back shortly" and `create-job` returns 503                                                                                                               |
| Rate limit    | Submit the form 11 times within an hour. The 11th gets 429                                                                                                                                                        |
| Stats         | `curl "http://localhost:8888/api/stats?key=$STATS_API_KEY" \| jq`                                                                                                                                                 |
| Sample output | `npm run seed` calls Claude once per live tool (a few pence in total) and rewrites `src/samples/<tool>.json` from real output. The files go to `sample-output/`. Use `npm run seed -- speech-writer` for one tool |

### 7. Deploy (short version; the full guide comes in Phase 5)

1. In Netlify, choose **Add new site → Import from Git** and pick this repo. Set **Base directory** to `ai-tools`. Build settings are read from `ai-tools/netlify.toml`.
2. Add every variable from `.env.example` under **Site settings → Environment variables**.
3. In Stripe, add a webhook endpoint at `https://<your-site>/api/stripe-webhook` with the events `checkout.session.completed` and `checkout.session.expired`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Scheduled functions (`sweeper`, `retention-cleanup`) only run on the published production deploy.

## Dependencies

The runtime dependencies are the ones the spec lists, plus the official clients they need: `@anthropic-ai/sdk`, `stripe`, `@supabase/supabase-js`, `resend`, `docx`, `pdf-lib`, `zod`, `react` and `react-dom`. Dev dependencies cover Vite, Tailwind, TypeScript, Vitest, ESLint and Prettier, plus `@netlify/functions` for types.

These were deliberately **not** added:

- **A router.** `src/lib/router.tsx` is about 60 lines and does the job.
- **A Markdown library.** `src/lib/markdown.ts` handles headings, lists, links, bold and italic, quotes and images.
- **An SSG plugin.** Pre-rendering is a small script, `scripts/prerender.mjs`, using Vite's SSR build.

`mammoth` and `pdf-parse` will be added in Phase 4.
