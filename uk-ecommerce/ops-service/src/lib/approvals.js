// Human approval queue. Anything with financial or reputational risk
// waits here until the owner decides.
import { now } from '../db.js';

export function requestApproval(db, { type, ref, summary, payload = null }) {
  const existing = db.prepare("SELECT * FROM approvals WHERE type = ? AND ref = ? AND status = 'pending'").get(type, String(ref));
  if (existing) return existing;
  db.prepare('INSERT INTO approvals (type, ref, summary, payload, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(type, String(ref), summary, payload ? JSON.stringify(payload) : null, 'pending', now());
  return db.prepare("SELECT * FROM approvals WHERE type = ? AND ref = ? AND status = 'pending'").get(type, String(ref));
}

export function listApprovals(db, status = 'pending') {
  return db.prepare('SELECT * FROM approvals WHERE status = ? ORDER BY created_at').all(status);
}

export function decideApproval(db, id, decision, by) {
  if (!['approved', 'rejected'].includes(decision)) throw new Error('decision must be approved or rejected');
  const row = db.prepare('SELECT * FROM approvals WHERE id = ?').get(id);
  if (!row) return null;
  if (row.status !== 'pending') return row;
  // Remove an older decided row with the same key so the UNIQUE constraint holds.
  db.prepare('DELETE FROM approvals WHERE type = ? AND ref = ? AND status = ? AND id != ?').run(row.type, row.ref, decision, id);
  db.prepare('UPDATE approvals SET status = ?, decided_at = ?, decided_by = ? WHERE id = ?').run(decision, now(), by, id);
  return db.prepare('SELECT * FROM approvals WHERE id = ?').get(id);
}
