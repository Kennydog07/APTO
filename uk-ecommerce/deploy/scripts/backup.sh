#!/usr/bin/env bash
# Nightly encrypted backup of the ops database and n8n (workflows, credentials, database).
# Install with:  (crontab -l; echo "15 3 * * * cd /opt/shop/deploy && ./scripts/backup.sh >> backups/backup.log 2>&1") | crontab -
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
: "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE missing in .env}"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p backups/ops backups/n8n backups/archive
# Containers run as uid 1000 (node); let them write their backup folders.
chown 1000:1000 backups/ops backups/n8n 2>/dev/null || true

# 1. ops-service: consistent encrypted SQLite snapshot (AES-256-GCM)
docker compose exec -T -e BACKUP_PASSPHRASE="$BACKUP_PASSPHRASE" ops-service node --disable-warning=ExperimentalWarning scripts/backup.js /backups

# 2. n8n: export workflows + credentials (credentials stay encrypted with N8N_ENCRYPTION_KEY)
docker compose exec -T n8n n8n export:workflow --all --separate --output=/backups/workflows-$STAMP/ >/dev/null
docker compose exec -T n8n n8n export:credentials --all --separate --output=/backups/credentials-$STAMP/ >/dev/null
# Online copy of n8n's SQLite database
docker compose exec -T n8n sh -c "cp /home/node/.n8n/database.sqlite /backups/database-$STAMP.sqlite"

# 3. Bundle + encrypt n8n export (openssl AES-256-CBC with PBKDF2)
tar -C backups/n8n -czf - "workflows-$STAMP" "credentials-$STAMP" "database-$STAMP.sqlite" \
  | openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:BACKUP_PASSPHRASE -out "backups/archive/n8n-$STAMP.tar.gz.enc"
rm -rf "backups/n8n/workflows-$STAMP" "backups/n8n/credentials-$STAMP" "backups/n8n/database-$STAMP.sqlite"
mv backups/ops/*.bak backups/archive/ 2>/dev/null || true

# 4. Retention: keep 14 days locally
find backups/archive -type f -mtime +14 -delete

# 5. Optional off-site copy
if [ -n "${RCLONE_REMOTE:-}" ] && command -v rclone >/dev/null; then rclone copy backups/archive "$RCLONE_REMOTE" --max-age 48h; fi
echo "$(date -u) backup OK ($STAMP)"
