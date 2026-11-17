// Structured data (schema.org JSON-LD) helpers.
import { SITE } from '../data/site';
import type { Product } from '../data/products';
import { canBuy, priceOf, destinationOf, imageFor, currency } from './catalog';
import { CATEGORIES } from '../data/categories';

const abs = (site: URL, path: string) => new URL(path, site).href;

export function breadcrumbLd(site: URL, items: { name: string; href?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: abs(site, c.href) } : {}),
    })),
  };
}

export function organizationLd(site: URL) {
  const sameAs = Object.values(SITE.social).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: site.href,
    logo: abs(site, '/icon-512.png'),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteLd(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: site.href,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: abs(site, '/destinations?q={search_term_string}') },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

/** Product + Offer markup. Only emitted for products that can actually be bought. */
export function productLd(site: URL, p: Product) {
  if (!canBuy(p)) return null;
  const d = destinationOf(p);
  const images = [
    ...(p.coverImage ? [p.coverImage] : imageFor(d, 1600) ? [imageFor(d, 1600)!] : []),
    ...p.screenshots.map((s) => s.src),
  ].map((i) => abs(site, i));
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: p.shortDescription,
    sku: p.id,
    category: `${CATEGORIES[p.category].label} guide`,
    brand: { '@type': 'Brand', name: SITE.name },
    ...(images.length ? { image: images } : {}),
    offers: {
      '@type': 'Offer',
      url: abs(site, `/guides/${p.id}`),
      price: priceOf(p).toFixed(2),
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: SITE.name },
    },
  };
}
