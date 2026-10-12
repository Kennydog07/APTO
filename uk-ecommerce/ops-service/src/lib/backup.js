// Encrypted, consistent SQLite backups (AES-256-GCM, key from scrypt).
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from 'node:crypto';
import { readFileSync, writeFileSync, rmSync, existsSync, renameSync } from 'node:fs';

const MAGIC = Buffer.from('OPSBK1');
const key = (pass, salt) => scryptSync(pass, salt, 32, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });

export function backupDatabase(dbPath, outFile, passphrase) {
  if (!passphrase || passphrase.length < 16) throw new Error('BACKUP_PASSPHRASE must be at least 16 characters');
  const tmp = `${outFile}.tmp-${process.pid}.sqlite`;
  const src = new DatabaseSync(dbPath, { readOnly: true });
  try { src.exec(`VACUUM INTO '${tmp.replace(/'/g, "''")}'`); } finally { src.close(); }
  const plain = readFileSync(tmp);
  rmSync(tmp);
  const salt = randomBytes(16), iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key(passphrase, salt), iv);
  const enc = Buffer.concat([c.update(plain), c.final()]);
  writeFileSync(outFile, Buffer.concat([MAGIC, salt, iv, c.getAuthTag(), enc]), { mode: 0o600 });
  return { bytes: plain.length, file: outFile };
}

export function restoreDatabase(backupFile, targetPath, passphrase, { force = false } = {}) {
  if (existsSync(targetPath) && !force) throw new Error(`${targetPath} exists — stop the service and pass --force to overwrite`);
  const buf = readFileSync(backupFile);
  if (!buf.subarray(0, 6).equals(MAGIC)) throw new Error('Not an ops backup file');
  const salt = buf.subarray(6, 22), iv = buf.subarray(22, 34), tag = buf.subarray(34, 50), enc = buf.subarray(50);
  const d = createDecipheriv('aes-256-gcm', key(passphrase, salt), iv);
  d.setAuthTag(tag);
  let plain;
  try { plain = Buffer.concat([d.update(enc), d.final()]); } catch { throw new Error('Wrong passphrase or corrupted backup'); }
  const tmp = `${targetPath}.restore-${process.pid}`;
  writeFileSync(tmp, plain, { mode: 0o600 });
  const db = new DatabaseSync(tmp);
  const check = db.prepare('PRAGMA integrity_check').get();
  const tables = db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table'").get().n;
  db.close();
  if (Object.values(check)[0] !== 'ok' || tables < 5) { rmSync(tmp); throw new Error('Restored database failed integrity check'); }
  for (const s of ['-wal', '-shm']) if (existsSync(targetPath + s)) rmSync(targetPath + s);
  renameSync(tmp, targetPath);
  return { tables };
}
