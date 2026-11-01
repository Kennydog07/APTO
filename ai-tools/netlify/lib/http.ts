import { createHash } from 'node:crypto';
import type { Context } from '@netlify/functions';
import { readEnv } from './env.ts';

/** JSON response helper. API responses are never cached. */
export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
  });
}

export function errorJson(status: number, message: string, extra: Record<string, unknown> = {}) {
  return json({ error: message, ...extra }, status);
}

/** Client IP, SHA-256 hashed so raw IPs never reach the database. */
export function hashedIp(req: Request, context?: Pick<Context, 'ip'>): string {
  const ip =
    context?.ip ||
    req.headers.get('x-nf-client-connection-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  // The pepper stops anyone with DB access reversing hashes by brute-forcing the IPv4 space.
  const pepper = (readEnv('SUPABASE_SERVICE_ROLE_KEY') || '').slice(-16);
  return createHash('sha256').update(`${pepper}:${ip}`).digest('hex').slice(0, 32);
}

/** Parse a JSON body, returning null (instead of throwing) on bad input. Caps body size. */
export async function readJson(req: Request, maxBytes = 200_000): Promise<unknown> {
  const text = await req.text();
  if (text.length > maxBytes) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
