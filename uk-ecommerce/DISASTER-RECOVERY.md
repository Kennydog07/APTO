# Disaster recovery

**What matters most:** Shopify holds the store, orders and customers (Shopify's responsibility). What you must protect: the **ops database** (approvals, supplier-order state, idempotency keys), the **n8n data** (workflows, encrypted credentials), and the **secrets** (`.env`, `ops.env`, `N8N_ENCRYPTION_KEY`, `BACKUP_PASSPHRASE`) in your password manager.

| Target | Value |
|---|---|
| Recovery point (RPO) | ≤ 24 h (nightly backup at 03:15 UK time) |
| Recovery time (RTO) | ~1 hour on a new VPS |

## Before you need it
- Nightly `scripts/backup.sh` (cron) → `deploy/backups/archive/`, encrypted, kept 14 days locally, optionally copied off-site (`RCLONE_REMOTE`).
- Secrets in a password manager. **Without `N8N_ENCRYPTION_KEY` the n8n credentials cannot be decrypted. Without `BACKUP_PASSPHRASE` no backup can be opened.**
- Monthly restore rehearsal (below).

## Scenario 1: server lost
1. **Pause automation first:** if you can still reach Shopify, set the store to password-protected or pause the supplier app, so orders are not lost while you rebuild. Shopify retries webhooks for a period; anything missed is picked up by Workflow 05's fallback once its order is back in the database. If needed, re-send recent orders using Shopify's webhook test or re-run them manually.
2. New VPS → follow `N8N-SETUP.md` §1–3 with the **same** `.env`/`ops.env` values.
3. Copy the latest `ops-*.bak` and `n8n-*.tar.gz.enc` from off-site storage into `deploy/backups/archive/`.
4. `docker compose up -d --build`, then:
   ```bash
   ./scripts/restore.sh ops backups/archive/ops-<stamp>.bak
   ./scripts/restore.sh n8n backups/archive/n8n-<stamp>.tar.gz.enc
   ```
5. Point DNS at the new IP.
6. **Check before resuming:** dashboard loads; `/healthz` OK; n8n workflows active; **reconcile supplier orders created after the backup time** against the supplier account. Any order that is "submitting/unknown" must be checked by hand. Then un-pause.

## Scenario 2: bad deploy or corrupted ops database
`docker compose stop ops-service`, restore the last good `ops-*.bak` (step 4), restart and reconcile.

## Scenario 3: leaked secret
Rotate immediately: Shopify app client secret (Dev Dashboard), `OPS_API_TOKEN` + the n8n "Ops service API" credential, `N8N_SHARED_SECRET` + the inbound credential, the dashboard password (`npm run hash-password`), supplier/Pinterest tokens. Then `docker compose up -d`. If the n8n encryption key leaked, re-create the credentials with a new key.

## Monthly restore rehearsal (15 min)
```bash
cd /opt/shop/uk-ecommerce/deploy
cp "$(ls -t backups/archive/ops-*.bak | head -1)" backups/ops/rehearsal.bak
docker compose run --rm -e BACKUP_PASSPHRASE="$BACKUP_PASSPHRASE" -e DB_PATH=/tmp/rehearsal.sqlite ops-service \
  node --disable-warning=ExperimentalWarning scripts/restore.js /backups/rehearsal.bak   # must print "Integrity check passed"
rm backups/ops/rehearsal.bak
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE -in "$(ls -t backups/archive/n8n-*.enc | head -1)" | tar -tzf - | head
```
(The automated tests already prove the restore code works; the rehearsal proves *your* backups and passphrase work.)
