#!/usr/bin/env bash
# Restore from encrypted backups. Usage:
#   ./scripts/restore.sh ops backups/archive/ops-<stamp>.bak
#   ./scripts/restore.sh n8n backups/archive/n8n-<stamp>.tar.gz.enc
# See DISASTER-RECOVERY.md before running. Requires the SAME N8N_ENCRYPTION_KEY for n8n credentials.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
what=${1:?ops|n8n}; file=${2:?backup file}
case "$what" in
  ops)
    docker compose stop ops-service
    cp "$file" backups/ops/restore.bak
    docker compose run --rm -e BACKUP_PASSPHRASE="$BACKUP_PASSPHRASE" ops-service node --disable-warning=ExperimentalWarning scripts/restore.js /backups/restore.bak --force
    rm backups/ops/restore.bak
    docker compose start ops-service ;;
  n8n)
    tmp=$(mktemp -d)
    openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE -in "$file" | tar -C "$tmp" -xzf -
    docker compose stop n8n
    db=$(ls "$tmp"/database-*.sqlite | head -1)
    docker compose run --rm -v "$db":/restore.sqlite:ro --entrypoint sh n8n -c "cp /restore.sqlite /home/node/.n8n/database.sqlite"
    docker compose start n8n
    rm -rf "$tmp" ;;
  *) echo "first argument must be ops or n8n"; exit 1 ;;
esac
echo "Restore of $what complete. Run the checks in DISASTER-RECOVERY.md."
