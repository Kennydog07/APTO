// Owner dashboard authentication: scrypt password hash, server-side
// sessions (revocable), HttpOnly/SameSite=Strict cookies, CSRF tokens and
// login rate limiting.
import { scryptSync, randomBytes, timingSafeEqual, createHash } from 'node:crypto';

const N = 16384, R = 8, P = 1, KEYLEN = 64;

export function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 12) throw new Error('Password must be at least 12 characters');
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password, stored) {
  try {
    const [alg, n, r, p, salt, hash] = String(stored).split('$');
    if (alg !== 'scrypt') return false;
    const expected = Buffer.from(hash, 'base64');
    const got = scryptSync(String(password), Buffer.from(salt, 'base64'), expected.length, { N: Number(n), r: Number(r), p: Number(p) });
    return timingSafeEqual(expected, got);
  } catch { return false; }
}

export function safeEqual(a, b) {
  const x = createHash('sha256').update(String(a ?? '')).digest();
  const y = createHash('sha256').update(String(b ?? '')).digest();
  return timingSafeEqual(x, y) && String(a ?? '').length > 0;
}

export function createSessionStore(db, hours) {
  const ttl = hours * 3_600_000;
  return {
    create(username) {
      const id = randomBytes(32).toString('base64url');
      const csrf = randomBytes(24).toString('base64url');
      db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
      db.prepare('INSERT INTO sessions (id, username, csrf, expires_at) VALUES (?,?,?,?)').run(id, username, csrf, Date.now() + ttl);
      return { id, csrf };
    },
    get(id) {
      if (!id) return null;
      const s = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
      if (!s || s.expires_at < Date.now()) return null;
      return s;
    },
    destroy(id) { db.prepare('DELETE FROM sessions WHERE id = ?').run(id); },
  };
}

export function createLoginLimiter({ max = 5, windowMs = 15 * 60_000 } = {}) {
  const hits = new Map();
  return {
    blocked(key) {
      const h = hits.get(key);
      return Boolean(h && h.count >= max && h.until > Date.now());
    },
    fail(key) {
      const h = hits.get(key);
      if (!h || h.until < Date.now()) hits.set(key, { count: 1, until: Date.now() + windowMs });
      else h.count++;
    },
    reset(key) { hits.delete(key); },
  };
}

export function parseCookies(header) {
  const out = {};
  for (const part of String(header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function sessionCookie(id, { secure, maxAgeSeconds }) {
  return `ops_session=${id}; Path=/dashboard; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure ? '; Secure' : ''}`;
}
