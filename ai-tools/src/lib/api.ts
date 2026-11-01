import { withBase } from '../../shared/paths';

/** Thin fetch wrapper for our /api endpoints. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: Record<string, unknown>,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  // `path` is app-relative ("/api/..."); the base path is added here.
  const res = await fetch(withBase(path), {
    method: init?.method ?? (init?.body ? 'POST' : 'GET'),
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new ApiError(String(body.error ?? 'Something went wrong'), res.status, body);
  return body as T;
}
