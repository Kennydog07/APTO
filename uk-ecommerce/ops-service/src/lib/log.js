// Structured JSON logging to stdout and the logs table. Customer PII is
// redacted before anything is written.
import { now } from '../db.js';

const PII_KEYS = new Set(['email', 'phone', 'address1', 'address2', 'first_name', 'last_name', 'name_on_card', 'ship_address', 'customer']);

export function redact(value, depth = 0) {
  if (depth > 6 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = PII_KEYS.has(k.toLowerCase()) ? '[redacted]' : redact(v, depth + 1);
  }
  return out;
}

export function createLogger(db, { quiet = false } = {}) {
  const stmt = db.prepare('INSERT INTO logs (ts, level, source, message, data) VALUES (?, ?, ?, ?, ?)');
  const write = (level, source, message, data) => {
    const safe = data === undefined ? undefined : redact(data);
    const ts = now();
    if (!quiet) process.stdout.write(JSON.stringify({ ts, level, source, message, data: safe }) + '\n');
    try {
      stmt.run(ts, level, source, String(message).slice(0, 2000), safe === undefined ? null : JSON.stringify(safe).slice(0, 8000));
    } catch { /* logging must never break the request */ }
  };
  return {
    info: (s, m, d) => write('info', s, m, d),
    warn: (s, m, d) => write('warn', s, m, d),
    error: (s, m, d) => write('error', s, m, d),
  };
}
