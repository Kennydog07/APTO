/**
 * Build step 3 of 3: render every static route to real HTML (for SEO), and write
 * sitemap.xml, robots.txt, 404.html and the empty app shell used by client-only pages.
 *
 * Env: SITE_URL (falls back to Netlify's URL), PLAUSIBLE_DOMAIN (optional analytics).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const siteUrl = (process.env.SITE_URL || process.env.URL || 'http://localhost:8888').replace(
  /\/+$/,
  '',
);

const { render, prerenderRoutes, sitemapEntries } = await import(
  pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href
);

let template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

// Inline the (small) stylesheet so the first paint doesn't wait for an extra request.
template = template.replace(
  /<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/,
  (tag, href) => {
    const css = fs.readFileSync(path.join(dist, href), 'utf8');
    return css.length < 60_000 ? `<style>${css}</style>` : tag;
  },
);
const plausible = process.env.PLAUSIBLE_DOMAIN
  ? `<script defer data-domain="${process.env.PLAUSIBLE_DOMAIN}" src="https://plausible.io/js/script.js"></script>`
  : '';

function page(head, html) {
  return template
    .replace('<!--app-head-->', `${head}\n    ${plausible}`)
    .replace('<!--app-html-->', html);
}

function write(file, content) {
  const full = path.join(dist, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

for (const route of prerenderRoutes()) {
  const { html, head } = render(route, siteUrl);
  write(route === '/' ? 'index.html' : `${route.slice(1)}/index.html`, page(head, html));
  console.log('prerendered', route);
}

const nf = render('/__404__', siteUrl);
write('404.html', page(nf.head, nf.html));
// Empty shell for /t/* pages: rendered entirely in the browser, never indexed.
write(
  'app-shell.html',
  page('<title>Your order</title>\n    <meta name="robots" content="noindex, nofollow">', ''),
);

const urls = sitemapEntries()
  .map(
    (e) =>
      `  <url><loc>${siteUrl}${e.path === '/' ? '/' : e.path}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}<priority>${e.priority}</priority></url>`,
  )
  .join('\n');
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
write(
  'robots.txt',
  `User-agent: *\nAllow: /\nDisallow: /t/\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`done: sitemap + robots for ${siteUrl}`);
