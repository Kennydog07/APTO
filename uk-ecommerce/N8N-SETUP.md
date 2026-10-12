# n8n and server setup

Self-hosted **n8n Community Edition 2.42.6** (free) plus ops-service on one VPS with Docker Compose. Tested locally: all 14 workflows import and the order flow passes end to end (see `TEST-RESULTS.md`).

## 1. Server (≈£5–6/month — approval needed before ordering)
- Recommended: a 2 vCPU / 4 GB RAM cloud VPS in the UK or EU (e.g. Hetzner CX23-class; third-party trackers quote about €4–5.50/month plus IPv4, after April 2026 price rises — verify on the provider's site). Ubuntu 24.04 LTS. Add your SSH key when creating it.
- DNS: create two `A` records pointing at the server IP: `n8n.<your-domain>` and `ops.<your-domain>`.

## 2. Harden and install Docker
```bash
ssh root@<server-ip>
git clone <your-private-repo-url> /opt/shop && cd /opt/shop/uk-ecommerce/deploy
bash scripts/server-hardening.sh     # firewall (22/80/443 only), SSH keys only, auto security updates, Docker
```

## 3. Configure secrets (on the server only)
```bash
cp .env.example .env          # N8N_DOMAIN, OPS_DOMAIN, ACME_EMAIL, N8N_ENCRYPTION_KEY, BACKUP_PASSPHRASE
cp ops.env.example ops.env    # TEST_MODE=true, OPS_API_TOKEN, DASHBOARD_PASSWORD_HASH, Shopify app credentials…
chmod 600 .env ops.env
openssl rand -hex 32          # use for N8N_ENCRYPTION_KEY, OPS_API_TOKEN, N8N_SHARED_SECRET (each different)
```
Save `N8N_ENCRYPTION_KEY` and `BACKUP_PASSPHRASE` in your password manager. **Without them, backups cannot be restored.**
Create the dashboard password hash on your laptop (`npm run hash-password`) and paste it into `ops.env` (it is a hash, not the password).

## 4. Start
```bash
docker compose up -d --build
docker compose ps                     # all "running"/"healthy"
curl https://ops.<domain>/healthz     # {"ok":true,"testMode":true,...}
```
Open `https://n8n.<domain>`, create the **owner account** (long password) and turn on **two-factor authentication** (Settings → Personal).

## 5. Import workflows
1. On your laptop, edit `n8n-workflows/config.json` (owner email, store email, store name; keep `testMode: true`). Run `node tools/build-n8n-workflows.mjs`, then commit and pull on the server.
2. In n8n: **Credentials → Create**:
   | Name (exactly) | Type | Value |
   |---|---|---|
   | Ops service API (Bearer) | Header Auth | Name `Authorization`, Value `Bearer <OPS_API_TOKEN>` |
   | Inbound webhook secret (X-Ops-Token) | Header Auth | Name `X-Ops-Token`, Value `<N8N_SHARED_SECRET>` |
   | Store SMTP | SMTP | Your mailbox provider's SMTP settings |
   | Support mailbox IMAP | IMAP | Same mailbox's IMAP settings |
   | Pinterest API (Bearer) | Header Auth | `Authorization: Bearer <token>`. Later, once API access is granted |
3. Import: Workflows → Import from file → each JSON in `n8n-workflows/` (or `docker compose cp ../n8n-workflows n8n:/tmp/wf && docker compose exec n8n n8n import:workflow --separate --input=/tmp/wf`).
4. Open each workflow and re-select the credentials on nodes showing a warning (imports reference placeholder IDs).
5. Activate (publish), in this order: **12 Error management** first, then 05, 06, 07, 03, 04, 11, 13, 09, 08, 14, 02, 01, and **10 last** (after Pinterest access).
6. Test each scheduled workflow with its **Manual test run** trigger.

## 6. Workflow reference
| # | Trigger | What it does | External effect |
|---|---|---|---|
| 01 | Mon 06:00 | Scores a candidate CSV feed; emails recommendations | Email to owner |
| 02 | Webhook `ops-new-candidate` | Validates candidate; creates **draft** Shopify product; approval request | Draft product only |
| 03 | Every 6 h | Supplier stock → Shopify inventory; pauses out-of-stock; flags persistent mismatches | Product status/inventory |
| 04 | 07:00, 19:00 | Recalculates margins; small auto-adjustments within limits; approvals for the rest; pauses negative margins | Prices (guarded) |
| 05 | Webhook from ops-service + 15-min fallback | Validates paid orders; routes eligible ones to 06 | None directly |
| 06 | Called by 05 | Idempotent supplier submission; escalates failures | Supplier order |
| 07 | Every 2 h + push webhook | Supplier tracking → Shopify fulfilment (customer email) | Customer notification |
| 08 | New email (IMAP) | Classifies; verified auto-reply or acknowledgement + escalation | Email (owner-only in test mode) |
| 09 | Daily 05:30 | Generates pins, captions, video scripts, guides, email drafts into the approval queue | None |
| 10 | Hourly 09–20 | Publishes **approved, due** pins (max 5/day); skipped in test mode or when paused | Pinterest |
| 11 | Daily 07:30 | Data-retention purge + daily report email | Email to owner |
| 12 | Any workflow error + every 30 min | Records errors; emails new critical/error alerts once | Email to owner |
| 13 | Mon 08:00 | Weekly optimisation recommendations (never authorises spending) | Email to owner |
| 14 | Webhook `ops-return-request` | Creates return case; replies; owner decides; refunds never automatic | Email |

Every HTTP node retries (3 tries, 5 s apart) and every workflow except 12 sends failures to Workflow 12. Workflows also log to ops-service (`/api/logs`).

## 7. Backups (nightly)
```bash
(crontab -l 2>/dev/null; echo "15 3 * * * cd /opt/shop/uk-ecommerce/deploy && ./scripts/backup.sh >> backups/backup.log 2>&1") | crontab -
```
Set `RCLONE_REMOTE` for an off-site copy (e.g. Backblaze B2, a few pence a month). Restore steps: `DISASTER-RECOVERY.md`.

## 8. Updates
- OS security updates install automatically (unattended-upgrades).
- n8n/Caddy/Node: change the pinned tag in `docker-compose.yml` or `ops-service/Dockerfile` **after a backup**, run `docker compose pull && docker compose up -d --build`, then run the manual test triggers.
- Re-run `npm test` in `ops-service` before deploying code changes.

## 9. Test mode → live
Only via `LAUNCH-CHECKLIST.md`: set `TEST_MODE=false` in `ops.env`, set `testMode: false` in `n8n-workflows/config.json`, rebuild, re-import 08/10/11/13/14/01/02, then `docker compose up -d`.
