# Security checklist

| Control | Implementation | Status |
|---|---|---|
| Shopify webhook HMAC validation | Raw-body HMAC-SHA256, constant-time compare, shop-domain check, webhook-ID required (`ops-service/src/shopify/webhook.js`) | ✅ Tested |
| Webhook replay/duplicates | Webhook-ID table + per-order upsert + UNIQUE supplier-order key | ✅ Tested |
| Least-privilege API scopes | Shopify scopes listed in `SHOPIFY-SETUP.md` §7; supplier keys only for API-mode suppliers | ☐ Owner to apply |
| Secrets management | `.env`/`ops.env` on the server only (chmod 600, git-ignored); n8n credentials encrypted with `N8N_ENCRYPTION_KEY`; nothing in frontend code; repository scanned for secrets before each commit | ✅ / ☐ owner |
| HTTPS | Caddy automatic TLS with HSTS | ☐ On deploy |
| Minimal public surface | Caddy exposes only `/webhooks/shopify`, `/dashboard`, `/healthz`; the n8n-facing `/api` is internal-only | ✅ Configured |
| Authenticated n8n | n8n owner account + MFA; `N8N_SECURE_COOKIE`; env access blocked in nodes | ☐ Owner to enable MFA |
| Dashboard auth | scrypt hash, server-side revocable sessions, HttpOnly/SameSite=Strict/Secure cookies, CSRF tokens, 5-attempt lockout, CSP, X-Frame-Options DENY, no-store | ✅ Tested |
| API auth | 32+ char Bearer token, constant-time compare; API can pause but never resume controls | ✅ Tested |
| Input limits | 1 MB body limit; request/header timeouts | ✅ |
| XSS | All dashboard output escaped; tested with a script-tag product title | ✅ Tested |
| Idempotent order processing | Atomic claim; ambiguous failures never auto-retried | ✅ Tested |
| Rate limits | Shopify 429/THROTTLED back-off; supplier/Pinterest retries spaced; publishing caps | ✅ |
| Structured, redacted logs | JSON logs with PII keys redacted; 90-day retention | ✅ |
| Monitoring & alerting | Workflow 12 + ops exceptions; one email per new critical issue; daily report | ✅ (email untested) |
| Encrypted backups | AES-256-GCM (ops DB), AES-256-CBC+PBKDF2 (n8n archive); restore tested | ✅ Partly tested |
| Data minimisation & retention | Only order fields needed; PII purged 90 days after completion; GDPR redact webhook; support bodies redacted | ✅ Tested |
| Human approval for financial exceptions | Over-limit orders, refunds, large price changes, manual purchases, supplier payments | ✅ Tested |
| AI limits | AI never touches payments, refunds or purchasing; drafts only; hard spend cap; number-hallucination guard | ✅ Tested |
| Server hardening | UFW (22/80/443), SSH keys only, unattended security upgrades, fail2ban | ☐ Run script |
| Pinned versions | n8n 2.42.6, Caddy 2.10.0, Node 22.22.0, npm lockfile | ✅ |
| Netlify exposure | Repository root is the public APTO site; `uk-ecommerce/*` returns 404 via `netlify.toml` | ✅ Added |

**🔴 Action:** the repository `Kennydog07/APTO` is **public on GitHub**. Move `uk-ecommerce/` into its own **private** repository before adding any real data, supplier terms or customer information. Consider deleting the public branch afterwards. The Netlify rule only stops the website serving these files; it does not make GitHub private.
