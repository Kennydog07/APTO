/* Catalogue logic: who is visible, who can be bought, prices, and build-time checks.
   You should not need to edit this file to add cities or products. */
import fs from 'node:fs';
import path from 'node:path';
import { DESTINATIONS, type Destination, type Status } from '../data/destinations';
import { PRODUCTS, type Product } from '../data/products';
import { CATEGORIES, CATEGORY_IDS, type CategoryId } from '../data/categories';
import { PRICES, CURRENCY } from '../data/pricing';

/** Drafts are previewable on your own computer (npm run dev) only. */
const SHOW_DRAFTS = import.meta.env.DEV;
const VISIBLE: Status[] = SHOW_DRAFTS ? ['published', 'coming-soon', 'draft'] : ['published', 'coming-soon'];

/** A real Gumroad product link: https://<name>.gumroad.com/l/<id> or https://gumroad.com/l/<id> */
const GUMROAD_RE = /^https:\/\/([a-z0-9-]+\.)?gumroad\.com\/l\/[A-Za-z0-9_-]+\/?(\?[^\s#]*)?$/;

export function isValidGumroadUrl(url: string | undefined): boolean {
  return !!url && GUMROAD_RE.test(url.trim());
}

/** The only rule for showing an active Download Now button. */
export function canBuy(p: Product): boolean {
  return p.status === 'published' && isValidGumroadUrl(p.gumroadURL);
}

/** What the customer sees: 'buy', or 'coming-soon' for anything not yet buyable. */
export function saleState(p: Product): 'buy' | 'coming-soon' | 'draft' {
  if (p.status === 'draft') return 'draft';
  return canBuy(p) ? 'buy' : 'coming-soon';
}

export function priceOf(p: Product): number {
  return typeof p.priceUSD === 'number' ? p.priceUSD : PRICES[CATEGORIES[p.category].tier];
}

export function formatPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}
export const currency = CURRENCY;

export function categoryLabel(c: CategoryId): string {
  return CATEGORIES[c].label;
}

export function destinationOf(p: Product): Destination {
  const d = DESTINATIONS.find((x) => x.slug === p.destination);
  if (!d) throw new Error(`Product "${p.id}" points at unknown destination "${p.destination}".`);
  return d;
}

export function visibleProducts(): Product[] {
  return PRODUCTS.filter((p) => VISIBLE.includes(p.status) && VISIBLE.includes(destinationOf(p).status));
}

export function productsFor(slug: string): Product[] {
  return visibleProducts().filter((p) => p.destination === slug);
}

/** A city appears only if it is visible and has at least one visible product. */
export function visibleDestinations(): Destination[] {
  return DESTINATIONS.filter((d) => VISIBLE.includes(d.status) && productsFor(d.slug).length > 0);
}

export function startingPrice(slug: string): number | null {
  const prices = productsFor(slug).map(priceOf);
  return prices.length ? Math.min(...prices) : null;
}

/** A city counts as coming soon if it says so, or if none of its guides can be bought yet. */
export function destinationIsComingSoon(d: Destination): boolean {
  return d.status === 'coming-soon' || !productsFor(d.slug).some(canBuy);
}

export function nearbyDestinations(d: Destination, max = 4): Destination[] {
  const all = visibleDestinations().filter((x) => x.slug !== d.slug);
  const same = all.filter((x) => x.region === d.region);
  const others = all.filter((x) => x.region !== d.region && x.featured);
  return [...same, ...others].slice(0, max);
}

export function relatedProducts(p: Product, max = 3): Product[] {
  const d = destinationOf(p);
  const all = visibleProducts().filter((x) => x.id !== p.id);
  const sameCity = all.filter((x) => x.destination === p.destination);
  const sameRegion = all.filter((x) => x.destination !== p.destination && destinationOf(x).region === d.region);
  const rest = all.filter((x) => !sameCity.includes(x) && !sameRegion.includes(x) && x.category === p.category);
  return [...sameCity, ...sameRegion, ...rest].slice(0, max);
}

export function imageFor(d: Destination, width: 800 | 1600 = 800): string | null {
  return d.image ? `/images/destinations/${d.slug}-${width}.webp` : null;
}

export function formatChecked(s: string): string {
  if (!s) return '';
  const [y, m, day] = s.split('-').map(Number);
  const month = new Date(Date.UTC(y, (m || 1) - 1, day || 1)).toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
  return day ? `${day} ${month} ${y}` : `${month} ${y}`;
}

export const REGIONS = [...new Set(DESTINATIONS.map((d) => d.region))];

/* ---------------------------------------------------------------------
   Build-time checks. Errors stop the build so a mistake can never reach
   customers; warnings are printed in the build log.
   --------------------------------------------------------------------- */
let checked = false;
export function validateCatalog(): void {
  if (checked) return;
  checked = true;
  const errors: string[] = [];
  const warnings: string[] = [];
  const statuses: Status[] = ['published', 'coming-soon', 'draft', 'hidden'];
  const pub = path.resolve('public');

  const slugs = new Set<string>();
  for (const d of DESTINATIONS) {
    if (!/^[a-z0-9-]+$/.test(d.slug)) errors.push(`City "${d.city}": slug "${d.slug}" may only use a-z, 0-9 and -.`);
    if (slugs.has(d.slug)) errors.push(`Two cities use the slug "${d.slug}".`);
    slugs.add(d.slug);
    if (!statuses.includes(d.status)) errors.push(`City "${d.city}": unknown status "${d.status}".`);
    if (d.image) {
      for (const w of [800, 1600]) {
        if (!fs.existsSync(path.join(pub, `images/destinations/${d.slug}-${w}.webp`)))
          errors.push(`City "${d.city}": missing photo public/images/destinations/${d.slug}-${w}.webp`);
      }
    }
  }

  const ids = new Set<string>();
  for (const p of PRODUCTS) {
    if (!/^[a-z0-9-]+$/.test(p.id)) errors.push(`Product "${p.id}": id may only use a-z, 0-9 and -.`);
    if (ids.has(p.id)) errors.push(`Two products use the id "${p.id}".`);
    ids.add(p.id);
    if (!slugs.has(p.destination)) errors.push(`Product "${p.id}": destination "${p.destination}" is not in destinations.ts.`);
    if (!CATEGORY_IDS.includes(p.category)) errors.push(`Product "${p.id}": unknown category "${p.category}".`);
    if (!statuses.includes(p.status)) errors.push(`Product "${p.id}": unknown status "${p.status}".`);
    if (p.priceUSD !== undefined && !(typeof p.priceUSD === 'number' && p.priceUSD > 0))
      errors.push(`Product "${p.id}": priceUSD must be a number above 0.`);
    const url = (p.gumroadURL || '').trim();
    if (url && !isValidGumroadUrl(url))
      errors.push(
        `Product "${p.id}": gumroadURL "${url}" is not a Gumroad product link. It must look like https://yourname.gumroad.com/l/product-id`,
      );
    if (url && /gumroad\.com\/?$/.test(url)) errors.push(`Product "${p.id}": gumroadURL is a storefront, not a product link.`);
    if (p.status === 'published' && !url)
      warnings.push(`Product "${p.id}" is 'published' but has no gumroadURL, so it shows as Coming soon.`);
    if (p.lastUpdated && !/^\d{4}-\d{2}(-\d{2})?$/.test(p.lastUpdated))
      errors.push(`Product "${p.id}": lastUpdated must be YYYY-MM or YYYY-MM-DD.`);
    for (const s of p.screenshots) {
      if (!fs.existsSync(path.join(pub, s.src))) errors.push(`Product "${p.id}": screenshot not found: public${s.src}`);
    }
    if (p.coverImage && !fs.existsSync(path.join(pub, p.coverImage)))
      errors.push(`Product "${p.id}": coverImage not found: public${p.coverImage}`);
  }

  const urls = PRODUCTS.map((p) => p.gumroadURL.trim()).filter(Boolean);
  const dup = urls.filter((u, i) => urls.indexOf(u) !== i);
  if (dup.length) errors.push(`The same Gumroad link is used by more than one product: ${[...new Set(dup)].join(', ')}`);

  for (const w of warnings) console.warn(`\n  [catalogue] ${w}`);
  if (errors.length) {
    throw new Error(`\n\nProduct catalogue problems (fix these in src/data/):\n  - ${errors.join('\n  - ')}\n`);
  }
}
