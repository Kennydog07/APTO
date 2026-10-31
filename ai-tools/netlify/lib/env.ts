/** Read a required server-side env var, failing loudly if it is missing. */
export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

export function envOptional(name: string, fallback = ''): string {
  return process.env[name] || fallback;
}

/** Public site URL without trailing slash. Netlify sets URL automatically as a fallback. */
export function siteUrl(): string {
  return (process.env.SITE_URL || process.env.URL || 'http://localhost:8888').replace(/\/+$/, '');
}

export function anthropicModel(): string {
  return envOptional('ANTHROPIC_MODEL', 'claude-sonnet-5-5');
}

/** True when using Stripe test keys. Test-only hooks (forced failures) require this. */
export function isStripeTestMode(): boolean {
  return envOptional('STRIPE_SECRET_KEY').startsWith('sk_test_');
}
