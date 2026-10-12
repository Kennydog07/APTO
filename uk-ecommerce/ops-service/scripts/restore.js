// Usage: BACKUP_PASSPHRASE=... npm run restore -- <backup-file> [--force]
// Stop the service first (docker compose stop ops-service).
import { loadConfig } from '../src/config.js';
import { restoreDatabase } from '../src/lib/backup.js';

const [file] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!file) { console.error('Usage: npm run restore -- <backup-file> [--force]'); process.exit(1); }
const cfg = loadConfig();
const r = restoreDatabase(file, cfg.dbPath, process.env.BACKUP_PASSPHRASE, { force: process.argv.includes('--force') });
console.log(`Restored ${r.tables} tables into ${cfg.dbPath}. Integrity check passed.`);
