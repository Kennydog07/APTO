# Merging the AI tools into apto-tools (apto-pro.com)

This guide is for whoever does the merge, whether that's a person or Grokbot. When it's done, the five tools are live inside the **existing** apto-pro.com Netlify site (project `aptotools`) at:

| Page           | URL                                      |
| -------------- | ---------------------------------------- |
| Tools home     | `https://apto-pro.com/ai/`               |
| Parking appeal | `https://apto-pro.com/ai/parking-appeal` |
| Bedtime story  | `https://apto-pro.com/ai/bedtime-story`  |
| Speech writer  | `https://apto-pro.com/ai/speech-writer`  |
| Listing writer | `https://apto-pro.com/ai/listing-writer` |
| CV tailor      | `https://apto-pro.com/ai/cv-tailor`      |
| Blog           | `https://apto-pro.com/ai/blog`           |
| API (internal) | `https://apto-pro.com/ai/api/...`        |

Everything belongs to `/ai/`, so nothing clashes with the main site's pages, its `/api/*` functions, its `/privacy` and `/terms` redirects, or `tools.html` and `apps.html`.

---

## Step 1: Merge the code (one command)

The `ai-tools/` folder must be in the repo root. Then, **from the repo root**, run:

```bash
node ai-tools/scripts/apply-merge-kit.mjs
npm install          # updates package-lock.json for the one new dependency (pdf-parse)
```

Then commit everything it changed. You can run it more than once safely, and it never edits or removes anything belonging to the main site. Here's what it does:

| File                 | Change                                                                                                                                                                                                                                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `functions/ai-*.mts` | Adds 13 small wrapper files, one per tool function. Each loads a pre-built bundle from `ai-tools/functions-dist/`. The names all start with `ai-`, so they can't clash with `stripe-webhook.js` and the other existing functions                                                                                                                                     |
| `netlify.toml`       | Adds a build `command` under `[build]`. It builds the pages into `./ai/` and bundles the functions. Appends a clearly marked `# >>> APTO AI tools (/ai) >>>` block containing: `NODE_VERSION = "22"`; settings for the `ai-cv-extract` function; a rewrite for `/ai/t/*` order pages; security headers for `/ai/*`; and a rule hiding the `/ai-tools/` source folder |
| `robots.txt`         | Adds `Disallow: /ai/t/` and `/ai/api/`, plus `Sitemap: https://apto-pro.com/ai/sitemap.xml`                                                                                                                                                                                                                                                                          |
| `package.json`       | Adds `pdf-parse`, which the CV reader needs installed because it uses a native add-on. Existing versions are untouched                                                                                                                                                                                                                                               |
| `.gitignore`         | Ignores `/ai/` (the build output)                                                                                                                                                                                                                                                                                                                                    |

If the script stops with a message (for example, `[build]` already has a command), follow the message. It's designed to stop rather than guess.

Optional: add links to the main site's navigation and hub page, for example "AI Tools" → `/ai/`, and add the tool pages to the main `sitemap.xml`. The robots.txt line already points search engines at `/ai/sitemap.xml`.

## Step 2: Database (Supabase)

The tools need four tables (`jobs`, `credits`, `daily_spend`, `rate_limits`) and a private storage bucket (`outputs`). These names don't clash with APTO Pro's tables (`leads`, `subscriptions`, `user_settings`), so you have two options:

- **A new Supabase project (recommended).** It keeps customer data and limits separate from APTO Pro.
- **APTO Pro's existing project.** This also works.

Either way, open **SQL Editor** and run `ai-tools/supabase/migrations/0001_init.sql`, then `0002_credit_packs.sql`.

## Step 3: Environment variables (in the `aptotools` Netlify project)

The tools read **`AI_TOOLS_<NAME>` first, then `<NAME>`**. Some names are already used by APTO Pro with different values, so for those you **must** use the `AI_TOOLS_` version. Set these under **Project configuration → Environment variables**, scoped to **Builds and Functions**:

| Variable                                                                                                               | Notes                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AI_TOOLS_STRIPE_WEBHOOK_SECRET`                                                                                       | **Required, with the prefix.** The tools have their own webhook endpoint, so they have their own signing secret (Step 4).                                           |
| `AI_TOOLS_SUPABASE_URL`                                                                                                | Required. The prefix is needed if you use a different Supabase project from APTO Pro, which already uses `SUPABASE_URL`.                                            |
| `AI_TOOLS_SUPABASE_SERVICE_ROLE_KEY`                                                                                   | Required. This is the service-role key of that project.                                                                                                             |
| `STRIPE_SECRET_KEY`                                                                                                    | Already set for APTO Pro. Shared, if the tools take payments through the same Stripe account. To use a different account, set `AI_TOOLS_STRIPE_SECRET_KEY` instead. |
| `ANTHROPIC_API_KEY`                                                                                                    | Already set (used by APTO Pro and Solve). Shared, or set `AI_TOOLS_ANTHROPIC_API_KEY` for separate billing.                                                         |
| `AI_TOOLS_SITE_URL`                                                                                                    | `https://apto-pro.com` (no `/ai`, no trailing slash)                                                                                                                |
| `AI_TOOLS_RESEND_API_KEY`, `AI_TOOLS_FROM_EMAIL`                                                                       | For download emails. See README step 3 for domain setup.                                                                                                            |
| `AI_TOOLS_STATS_API_KEY`                                                                                               | A long random string, for the marketing bot                                                                                                                         |
| `AI_TOOLS_DAILY_AI_BUDGET_GBP`                                                                                         | For example `10`                                                                                                                                                    |
| `AI_TOOLS_ANTHROPIC_MODEL`, `AI_TOOLS_ANTHROPIC_PREVIEW_MODEL`, `AI_TOOLS_LISTING_SYNC_TIMEOUT_MS`, `PLAUSIBLE_DOMAIN` | Optional (defaults: `claude-sonnet-5-5`, `claude-haiku-5-5`, `20000`; analytics off)                                                                                |

Until the Supabase variables are set, every tool form shows "Back shortly" and nobody can be charged. This is deliberate (it fails closed). So the merge can safely go live before the keys are ready.

## Step 4: Stripe webhook for the tools

In Stripe, open **Developers → Webhooks** (also called **Workbench → Event destinations**) and add a **new** endpoint. Keep APTO Pro's existing one.

- **URL:** `https://apto-pro.com/ai/api/stripe-webhook`
- **Events:** `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`
- **Signing secret:** goes into `AI_TOOLS_STRIPE_WEBHOOK_SECRET`. Then redeploy.

## Step 5: Deploy and check

Push to the branch the `aptotools` project deploys from. The build takes about a minute longer than before, because it now builds the tools too. Then check:

- [ ] `https://apto-pro.com/ai/` and the five tool pages load.
- [ ] `https://apto-pro.com/` and the other existing pages look unchanged.
- [ ] `https://apto-pro.com/ai/api/site-status` returns `{"accepting":true}`. `false` means the Supabase variables aren't set yet.
- [ ] In Netlify **Logs → Functions**, the 13 `ai-*` functions sit next to the existing ones, and `ai-sweeper` and `ai-retention-cleanup` show as scheduled.
- [ ] Do one test purchase (README → "Go-live checklist").

---

## How it fits together (for maintainers)

- **Pages:**
  1. The build runs `vite build` with `AI_TOOLS_OUT_DIR=../ai`, writing pre-rendered HTML to `<repo>/ai/`.
  2. The main site publishes the repo root, so `/ai/...` is served as plain files.
  3. All links, assets and canonical URLs get the `/ai` prefix from `shared/paths.ts`.
- **Functions:**
  1. `npm run build:functions` bundles each `ai-tools/netlify/functions/ai-*.ts` into one file in `ai-tools/functions-dist/`, with its npm packages included. The exception is `pdf-parse`, which uses a native add-on and is installed from the root `package.json`.
  2. The `functions/ai-*.mts` wrappers re-export those bundles and declare each route (`/ai/api/...`) or schedule.
  3. If you add or change a function, run `npm run merge-kit` in `ai-tools/` and copy the regenerated wrappers again (or re-run the apply script). A unit test fails if they're out of date.
- **Why not one shared `node_modules`?** Netlify only bundles packages it finds in the repo root's `node_modules`. Pre-bundling keeps the tools' packages (Stripe v23, zod 4 and the rest) completely separate from the main site's, such as its Stripe v14.
- **Tested:**
  - A full `netlify build` of the merged repo (offline). All 13 tool functions and the 8 existing functions were detected with the right routes, schedules and background mode.
  - Netlify's packaged zip of every tool function, run on its own: all load, and PDF and Word CVs are both read.
  - The pages, in a browser, served from the repo root: every link stays under `/ai/`, and the main home page is unchanged.
