// Exception queue. Repeated identical failures are folded into one row
// (by fingerprint) so the owner gets one alert, not hundreds.
import { createHash } from 'node:crypto';
import { now } from '../db.js';

export function fingerprintOf(source, ref, message) {
  return createHash('sha256').update(`${source}|${ref ?? ''}|${message}`).digest('hex').slice(0, 32);
}

export function raiseException(db, { source, ref = null, severity = 'warning', message, details = null }) {
  const fp = fingerprintOf(source, ref, message);
  const ts = now();
  db.prepare(`INSERT INTO exceptions (fingerprint, source, ref, severity, message, details, first_seen, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(fingerprint) DO UPDATE SET occurrences = occurrences + 1, last_seen = excluded.last_seen,
      details = excluded.details, status = 'open'`)
    .run(fp, source, ref, severity, message, details ? JSON.stringify(details).slice(0, 8000) : null, ts, ts);
  return db.prepare('SELECT * FROM exceptions WHERE fingerprint = ?').get(fp);
}

export function openExceptions(db) {
  return db.prepare("SELECT * FROM exceptions WHERE status = 'open' ORDER BY CASE severity WHEN 'critical' THEN 0 WHEN 'error' THEN 1 ELSE 2 END, last_seen DESC").all();
}

export function resolveException(db, id) {
  return db.prepare("UPDATE exceptions SET status = 'resolved' WHERE id = ?").run(id).changes === 1;
}

// Exceptions that should interrupt the owner now (critical/error, not yet notified).
export function takeUnnotified(db) {
  const rows = db.prepare("SELECT * FROM exceptions WHERE status = 'open' AND notified = 0 AND severity IN ('critical','error')").all();
  const mark = db.prepare('UPDATE exceptions SET notified = 1 WHERE id = ?');
  for (const r of rows) mark.run(r.id);
  return rows;
}
