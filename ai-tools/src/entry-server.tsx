/** Used only at build time by scripts/prerender.mjs. */
import { renderToString } from 'react-dom/server';
import { App, STATIC_ROUTES } from './App';
import { RouterProvider } from './lib/router';
import { HeadCollector, renderHead, type HeadData } from './lib/seo';
import { POSTS } from './lib/blog';
import { LIVE_TOOLS } from '../shared/tools';

export function render(url: string, siteUrl: string) {
  let collected: HeadData | undefined;
  const collector = (h: HeadData) => {
    collected = h;
  };
  const html = renderToString(
    <HeadCollector.Provider value={collector}>
      <RouterProvider url={url}>
        <App />
      </RouterProvider>
    </HeadCollector.Provider>,
  );
  const head = collected ? renderHead(collected, siteUrl) : '';
  return { html, head };
}

export function prerenderRoutes(): string[] {
  return [...Object.keys(STATIC_ROUTES), ...POSTS.map((p) => `/blog/${p.slug}`)];
}

/** Sitemap priority hints: tools first. */
export function sitemapEntries(): { path: string; priority: number; lastmod?: string }[] {
  const toolRoutes = new Set(LIVE_TOOLS.map((t) => t.route));
  return [
    ...Object.keys(STATIC_ROUTES).map((path) => ({
      path,
      priority: path === '/' ? 1 : toolRoutes.has(path) ? 0.9 : 0.4,
    })),
    ...POSTS.map((p) => ({ path: `/blog/${p.slug}`, priority: 0.6, lastmod: p.date })),
  ];
}
