// XML sitemap, generated from the catalogue. Only visible (published / coming-soon) pages are listed.
import type { APIRoute } from 'astro';
import { visibleDestinations, visibleProducts } from '../lib/catalog';

export const GET: APIRoute = ({ site }) => {
  const today = new Date().toISOString().slice(0, 10);
  const lastmod = (s: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? s : /^\d{4}-\d{2}$/.test(s) ? `${s}-01` : today);
  const urls: { loc: string; lastmod: string; priority: string }[] = [
    { loc: '/', lastmod: today, priority: '1.0' },
    { loc: '/destinations', lastmod: today, priority: '0.9' },
    { loc: '/guides', lastmod: today, priority: '0.9' },
    ...visibleDestinations().map((d) => ({ loc: `/destinations/${d.slug}`, lastmod: today, priority: '0.8' })),
    ...visibleProducts().map((p) => ({ loc: `/guides/${p.id}`, lastmod: lastmod(p.lastUpdated), priority: '0.8' })),
    ...['/contact', '/refunds', '/disclaimer', '/terms', '/privacy', '/credits'].map((loc) => ({ loc, lastmod: today, priority: '0.3' })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${new URL(u.loc, site).href}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
