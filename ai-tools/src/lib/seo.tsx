/**
 * <Seo> sets the page title/meta. During pre-rendering it writes tags into a
 * collector that scripts/prerender.mjs injects into <head>. In the browser it
 * updates document.title and the description on client-side navigation.
 */
import { createContext, useContext, useEffect } from 'react';
import { BRAND } from '../config/brand';

export interface HeadData {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: object[];
}

/** Pre-render only: receives the page's head data (the last <Seo> rendered wins). */
export const HeadCollector = createContext<((head: HeadData) => void) | null>(null);

export function Seo(props: HeadData) {
  const collector = useContext(HeadCollector);
  collector?.(props);

  useEffect(() => {
    document.title = props.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', props.description);
  }, [props.title, props.description]);

  return null;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Serialise head data to HTML (used by the pre-renderer). */
export function renderHead(h: HeadData, siteUrl: string): string {
  const url = `${siteUrl}${h.path === '/' ? '/' : h.path}`;
  const image = `${siteUrl}${h.ogImage ?? '/og/default.png'}`;
  const tags = [
    `<title>${esc(h.title)}</title>`,
    `<meta name="description" content="${esc(h.description)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(BRAND.name)}">`,
    `<meta property="og:title" content="${esc(h.title)}">`,
    `<meta property="og:description" content="${esc(h.description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:locale" content="en_GB">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    h.noindex ? `<meta name="robots" content="noindex, nofollow">` : '',
    ...(h.jsonLd ?? []).map(
      (j) =>
        `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`,
    ),
  ];
  return tags.filter(Boolean).join('\n    ');
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
