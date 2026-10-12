// Emergency pause switches. Every automated action that spends money,
// changes prices, publishes or orders checks these first.
import { now } from '../db.js';

export const CONTROL_KEYS = {
  pause_product_publication: 'New product publication',
  pause_supplier_orders: 'Automatic supplier orders',
  pause_marketing: 'Marketing publication',
  pause_price_changes: 'Automatic price changes',
};

export function getControls(db) {
  const rows = db.prepare('SELECT key, value, updated_at, updated_by FROM controls').all();
  const out = {};
  for (const k of Object.keys(CONTROL_KEYS)) out[k] = { paused: false, label: CONTROL_KEYS[k], updated_at: null, updated_by: null };
  for (const r of rows) if (out[r.key]) Object.assign(out[r.key], { paused: r.value === 'true', updated_at: r.updated_at, updated_by: r.updated_by });
  return out;
}

export function isPaused(db, key) {
  if (!CONTROL_KEYS[key]) throw new Error(`Unknown control ${key}`);
  const r = db.prepare('SELECT value FROM controls WHERE key = ?').get(key);
  return r?.value === 'true';
}

export function setControl(db, key, paused, by) {
  if (!CONTROL_KEYS[key]) throw new Error(`Unknown control ${key}`);
  db.prepare(`INSERT INTO controls (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`)
    .run(key, paused ? 'true' : 'false', now(), by);
  return getControls(db)[key];
}
