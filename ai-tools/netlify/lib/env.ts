import { BASE_PATH } from '../../shared/paths.ts';

/**
 * Settings are read as `AI_TOOLS_<NAME>` first, then `<NAME>`.
 *
 * When these tools are merged into the main apto-pro.com Netlify site, some names are already
 * used there with different values (e.g. STRIPE_WEBHOOK_SECRET for APTO Pro's own webhook).
 * Set the AI_TOOLS_-prefixed version for those and both keep working. Standalone, the plain
 * names are fine.
 */
export function readEnv(name: string): string | undefined {
  return process.env[`AI_TOOLS_${name}`] || process.env[name] || undefined;
}

/** Read a required server-side setting, failing loudly if it is missing. */
export function env(name: string): string {
  const value = readEnv(name);
  if (!value)
    throw new Error(`Missing required environment variable AI_TOOLS_${name} (or ${name})`);
  return value;
}

export function envOptional(name: string, fallback = ''): string {
  return readEnv(name) || fallback;
}

/** Site origin without trailing slash, e.g. https://apto-pro.com (Netlify's URL as fallback). */
export function siteOrigin(): string {
  return (readEnv('SITE_URL') || process.env.URL || 'http://localhost:8888').replace(/\/+$/, '');
}

/** Public URL of the tools, e.g. https://apto-pro.com/ai. Append app-relative paths to it. */
export function appUrl(): string {
  return `${siteOrigin()}${BASE_PATH}`;
}

export function anthropicModel(): string {
  return envOptional('ANTHROPIC_MODEL', 'claude-sonnet-5-5');
}

/** True when using Stripe test keys. Test-only hooks (forced failures) require this. */
export function isStripeTestMode(): boolean {
  return envOptional('STRIPE_SECRET_KEY').startsWith('sk_test_');
}
