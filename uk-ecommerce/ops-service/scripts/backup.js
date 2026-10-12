// Usage: BACKUP_PASSPHRASE=... npm run backup -- [output-dir]
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { loadConfig } from '../src/config.js';
import { backupDatabase } from '../src/lib/backup.js';

const cfg = loadConfig();
const dir = process.argv[2] ?? path.join(path.dirname(cfg.dbPath), 'backups');
mkdirSync(dir, { recursive: true });
const file = path.join(dir, `ops-${new Date().toISOString().replace(/[:.]/g, '-')}.bak`);
const r = backupDatabase(cfg.dbPath, file, process.env.BACKUP_PASSPHRASE);
console.log(`Backup written: ${r.file} (${r.bytes} bytes before encryption)`);
