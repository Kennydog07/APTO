# Setup for beginners (Windows laptop)

Plain-English, step-by-step. Allow 3–4 hours in total, spread over a few days. You will never need to paste a password into a chat. Secrets go into files on your server or into the n8n credentials screen.

> **Before spending money:** read `LEGAL-AND-PAYMENTS-CHECKLIST.md`. Live selling is blocked until payments, VAT and Qatar-side questions are answered. You can still do Parts 1–4 using free trials and test mode.

## Part 1 — Tools on your laptop (20 min)
1. Install **Node.js 22 LTS** from nodejs.org (Windows installer, defaults).
2. Install **Git for Windows** from git-scm.com (defaults). It includes "Git Bash", which you will use for commands.
3. Install **VS Code** (optional, for viewing files).
4. Open Git Bash and run:
   ```bash
   git clone <your-private-repo-url>
   cd <repo-folder>/uk-ecommerce/ops-service
   npm install
   npm test
   ```
   You should see `# pass 65` and `# fail 0`.

## Part 2 — Try the system locally in test mode (15 min)
1. In `ops-service`, copy `.env.example` to `.env`.
2. Create your dashboard password hash with `npm run hash-password`. Type a long password (it is not shown on screen) and paste the printed line into `.env`.
3. In `.env`, set `OPS_API_TOKEN` to a long random value. In Git Bash, `openssl rand -hex 32` makes one.
4. Run `npm start`, then open http://localhost:8080/dashboard and sign in. Everything is in **TEST MODE**.

## Part 3 — Shopify (45 min) → see `SHOPIFY-SETUP.md`
Create the store on a trial, upload the theme, create pages and menus, and connect the Dev Dashboard app. **Do not** activate a paid plan or a payment provider until you approve it.

## Part 4 — Server (60 min) → see `N8N-SETUP.md`
Rent a small VPS (about £5–6/month), point two sub-domains at it, run the hardening script, then `docker compose up -d`.

## Part 5 — Products → see `NICHE-RESEARCH.md` and `SUPPLIER-COMPARISON.md`
Fill in real supplier data in `PRODUCT-SHORTLIST.csv` and run `npm run score-products`. Send the ready ones through Workflow 02, then approve them in the dashboard.

## Part 6 — Launch → `LAUNCH-CHECKLIST.md`
Work through every line. Switch test mode off only when all mandatory items pass.

## Daily routine after launch → `OWNER-OPERATIONS.md`

## Where to get help
- Shopify: help.shopify.com and Shopify Support chat
- n8n: docs.n8n.io and community.n8n.io
- This project: ask Claude Code in this repository. It can read the code and the test results.
