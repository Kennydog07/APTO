// Renders the theme's real Liquid files with sample data using liquidjs plus
// stubs for Shopify-only tags/filters. This is an APPROXIMATION of Shopify's
// renderer for layout/visual testing — final verification must happen on a
// Shopify development store (see SHOPIFY-SETUP.md).
import { Liquid, Tag, Hash } from 'liquidjs';
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const THEME = path.resolve(here, '../../shopify-theme');
const OUT = path.join(here, 'out');
mkdirSync(path.join(OUT, 'img'), { recursive: true });
cpSync(path.join(THEME, 'assets'), path.join(OUT, 'assets'), { recursive: true });

const locales = JSON.parse(readFileSync(path.join(THEME, 'locales/en.default.json'), 'utf8'));
const settingsData = JSON.parse(readFileSync(path.join(THEME, 'config/settings_data.json'), 'utf8')).presets.Default;
const font = (w) => ({ family: 'Assistant', fallback_families: 'system-ui, -apple-system, "Segoe UI", sans-serif', weight: w });
const settings = { ...settingsData, type_heading_font: font(700), type_body_font: font(400), favicon: null };

// ---------- sample images (clearly labelled samples, not product claims) ----------
const palette = ['#2F5D50', '#C8664A', '#8FA89B', '#D9C9A8', '#5B6560', '#B9B2A3'];
function sampleImage(name, label, i) {
  const c = palette[i % palette.length], c2 = palette[(i + 2) % palette.length];
  writeFileSync(path.join(OUT, 'img', `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
<rect width="1200" height="1200" fill="#ECE6DA"/><rect x="180" y="300" width="840" height="620" rx="40" fill="${c}"/><rect x="260" y="380" width="300" height="460" rx="24" fill="${c2}"/>
<rect x="640" y="380" width="300" height="210" rx="24" fill="#F7F4EE" opacity=".85"/><rect x="640" y="630" width="300" height="210" rx="24" fill="#F7F4EE" opacity=".6"/>
<text x="600" y="1040" font-family="sans-serif" font-size="44" text-anchor="middle" fill="#5B6560">SAMPLE IMAGE · ${label}</text></svg>`);
  return { src: `/img/${name}.svg`, alt: label, width: 1200, height: 1200, aspect_ratio: 1, media_type: 'image' };
}

const titles = ['Two-tier sliding under-sink organiser', 'Expandable bamboo drawer dividers (set of 4)', 'Stackable metal cupboard shelf riser', 'Over-door hooks (set of 2)',
  'Collapsible fabric storage boxes (set of 3)', 'Cascading wardrobe space-saver hangers', 'Under-bed storage bag with clear window', 'Non-slip turntable organiser'];
const pence = [2499, 1699, 1499, 999, 2299, 1299, 1899, 1199];
const products = titles.map((t, i) => {
  const handle = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
  const img = sampleImage(handle, t.split(' (')[0], i);
  const variants = [{ id: 1000 + i * 10, title: 'Default Title', options: ['Default Title'], price: pence[i], compare_at_price: null, available: i !== 6, sku: `NO-${100 + i}`,
    inventory_management: 'shopify', inventory_quantity: i === 6 ? 0 : 20, url: `/products/${handle}?variant=${1000 + i * 10}`, featured_media: null, barcode: '' }];
  return {
    id: 500 + i, title: t, handle, url: `/products/${handle}`, vendor: 'Nook & Order', price: pence[i], price_min: pence[i], price_varies: false, available: i !== 6,
    featured_media: img, media: [img], images: [img], description: '', has_only_default_variant: true, variants, options_with_values: [],
    selected_or_first_available_variant: variants[0], metafields: { custom: {} },
  };
});

// Detailed product with two variants for the product page.
const p0 = products[0];
const grey = sampleImage('under-sink-grey', 'Under-sink organiser — grey', 4);
const angle = sampleImage('under-sink-angle', 'Under-sink organiser — in cupboard', 2);
p0.media = [p0.featured_media, grey, angle];
p0.has_only_default_variant = false;
p0.description = '<p>Two sliding baskets on a freestanding frame make the most of the awkward space under a sink. The frame sits around pipes, so there is nothing to screw into your cupboard.</p>';
p0.variants = [
  { id: 1001, title: 'White', options: ['White'], price: 2499, compare_at_price: null, available: true, sku: 'NO-UNDERSINK-WHT', inventory_management: 'shopify', inventory_quantity: 24, url: `/products/${p0.handle}?variant=1001`, featured_media: null, barcode: '' },
  { id: 1002, title: 'Grey', options: ['Grey'], price: 2499, compare_at_price: null, available: true, sku: 'NO-UNDERSINK-GRY', inventory_management: 'shopify', inventory_quantity: 2, url: `/products/${p0.handle}?variant=1002`, featured_media: grey, barcode: '' },
];
p0.selected_or_first_available_variant = p0.variants[0];
p0.options_with_values = [{ name: 'Colour', selected_value: 'White', values: ['White', 'Grey'] }];
p0.metafields.custom = {
  benefits: { value: ['Fits around sink pipes — no drilling', 'Baskets slide out fully for easy reach', 'Wipe-clean powder-coated steel'] },
  specifications: 'Overall: W 40 × D 26 × H 36 cm (SAMPLE — replace with supplier data)\nMaterial: powder-coated steel, PP plastic\nMax load per basket: see supplier documentation',
  delivery_estimate: '2–4 working days (supplier estimate — SAMPLE)',
  fitting: 'Freestanding — no tools or drilling needed',
};

const allCollection = { id: 1, title: 'All storage', handle: 'all', url: '/collections/all', products, products_count: products.length, all_products_count: products.length,
  description: '<p>Renter-friendly storage for small UK homes.</p>', sort_options: [{ value: 'manual', name: 'Featured' }, { value: 'price-ascending', name: 'Price, low to high' }, { value: 'price-descending', name: 'Price, high to low' }],
  sort_by: '', default_sort_by: 'manual', featured_image: products[1].featured_media };
const collections = [
  { ...allCollection, title: 'Kitchen cupboards', url: '/collections/kitchen', featured_image: products[2].featured_media },
  { ...allCollection, title: 'Wardrobes & bedrooms', url: '/collections/wardrobe', featured_image: products[5].featured_media },
  { ...allCollection, title: 'Bathrooms & hallways', url: '/collections/bathroom', featured_image: products[3].featured_media },
];
const link = (title, url) => ({ title, url, current: false });
const linklists = {
  'main-menu': { links: [link('Shop all', '/collections/all'), link('Kitchen', '/collections/kitchen'), link('Wardrobe', '/collections/wardrobe'), link('Bathroom', '/collections/bathroom'), link('About', '/pages/about'), link('Help', '/pages/faqs')] },
  footer: { links: [link('Shop all', '/collections/all'), link('Kitchen', '/collections/kitchen'), link('Wardrobe', '/collections/wardrobe')] },
};

const shop = { name: 'Nook & Order', email: 'hello@example.co.uk', description: 'Renter-friendly storage for small UK homes.', url: 'https://example.co.uk', customer_accounts_enabled: false,
  policies: [{ title: 'Refund policy', url: '/policies/refund-policy' }, { title: 'Privacy policy', url: '/policies/privacy-policy' }, { title: 'Terms of service', url: '/policies/terms-of-service' }, { title: 'Shipping policy', url: '/policies/shipping-policy' }, { title: 'Contact information', url: '/policies/contact-information' }] };
const routes = { root_url: '/', search_url: '/search', cart_url: '/cart', account_url: '/account', collections_url: '/collections', all_products_collection_url: '/collections/all', product_recommendations_url: '/recommendations/products' };
const cartItems = [
  { key: 'k1', url: p0.url, image: p0.featured_media, product: p0, variant: p0.variants[0], quantity: 1, final_price: 2499, final_line_price: 2499, url_to_remove: '/cart/change?line=1&quantity=0' },
  { key: 'k2', url: products[3].url, image: products[3].featured_media, product: products[3], variant: products[3].variants[0], quantity: 2, final_price: 999, final_line_price: 1998, url_to_remove: '/cart/change?line=2&quantity=0' },
];

// ---------- engine ----------
const engine = new Liquid({ root: [path.join(THEME, 'snippets'), path.join(THEME, 'sections')], extname: '.liquid', strictFilters: true, jsTruthy: false });

const lookup = (key) => key.split('.').reduce((o, k) => (o == null ? o : o[k]), locales);
engine.registerFilter('t', (key, ...args) => {
  const opts = {};
  for (const a of args) if (Array.isArray(a)) opts[a[0]] = a[1];
  let v = lookup(key);
  if (v && typeof v === 'object') v = opts.count === 1 ? v.one : v.other;
  if (typeof v !== 'string') return `MISSING_T(${key})`;
  return v.replace(/{{\s*(\w+)\s*}}/g, (_, k) => opts[k] ?? '');
});
const money = (p) => `£${(Number(p) / 100).toFixed(2)}`;
engine.registerFilter('money', money);
engine.registerFilter('money_with_currency', (p) => `${money(p)} GBP`);
engine.registerFilter('money_without_currency', (p) => (Number(p) / 100).toFixed(2));
engine.registerFilter('asset_url', (n) => `/assets/${n}`);
engine.registerFilter('image_url', (img) => (typeof img === 'string' ? img : img?.src ?? ''));
engine.registerFilter('image_tag', function (url, ...args) {
  const opts = {};
  for (const a of args) if (Array.isArray(a)) opts[a[0]] = a[1];
  const attrs = Object.entries(opts).filter(([k]) => !['widths', 'sizes'].includes(k)).map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`).join(' ');
  return `<img src="${url}" width="1200" height="1200" ${attrs} ${opts.alt === undefined ? 'alt=""' : ''}>`;
});
engine.registerFilter('placeholder_svg_tag', (name, cls) => `<svg class="${cls ?? ''}" viewBox="0 0 525 525" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="525" height="525"/></svg>`);
engine.registerFilter('font_face', () => '');
engine.registerFilter('font_modify', (f) => f);
engine.registerFilter('metafield_tag', (v) => `<p>${String(v).replace(/\n/g, '<br>')}</p>`);
engine.registerFilter('time_tag', (d) => `<time>${d}</time>`);
engine.registerFilter('default_errors', () => 'Please check the form.');
engine.registerFilter('format_code', (c) => c);
engine.registerFilter('handleize', (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-'));

engine.registerTag('schema', { parse(_t, remain) { this.tpls = []; const stream = this.liquid.parser.parseStream(remain); stream.on('tag:endschema', () => stream.stop()).on('template', () => {}).on('end', () => { throw new Error('schema not closed'); }); stream.start(); }, render() { return ''; } });
for (const name of ['style', 'javascript']) {
  engine.registerTag(name, { parse(_t, remain) { this.tpls = []; const stream = this.liquid.parser.parseStream(remain); stream.on(`tag:end${name}`, () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error(`${name} not closed`); }); stream.start(); },
    *render(ctx, emitter) { const html = yield this.liquid.renderer.renderTemplates(this.tpls, ctx); emitter.write(name === 'style' ? `<style>${html}</style>` : `<script>${html}</script>`); } });
}
engine.registerTag('form', {
  parse(token, remain) {
    this.args = token.args;
    this.tpls = [];
    const stream = this.liquid.parser.parseStream(remain);
    stream.on('tag:endform', () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error('form not closed'); });
    stream.start();
  },
  *render(ctx, emitter) {
    const type = (this.args.match(/'([^']+)'/) ?? [])[1];
    const id = (this.args.match(/id:\s*'([^']+)'/) ?? [])[1];
    const cls = (this.args.match(/class:\s*'([^']+)'/) ?? [])[1];
    const action = { product: '/cart/add', customer: '/contact#newsletter', contact: '/contact', storefront_password: '/password' }[type] ?? '/';
    ctx.push({ form: { errors: null, 'posted_successfully?': false } });
    const html = yield this.liquid.renderer.renderTemplates(this.tpls, ctx);
    ctx.pop();
    emitter.write(`<form method="post" action="${action}"${id ? ` id="${id}"` : ''}${cls ? ` class="${cls}"` : ''}${/data-product-form/.test(this.args) ? ' data-product-form' : ''}><input type="hidden" name="form_type" value="${type}">${html}</form>`);
  },
});
engine.registerTag('paginate', {
  parse(token, remain) {
    this.expr = token.args.split(' by ')[0].trim();
    this.tpls = [];
    const stream = this.liquid.parser.parseStream(remain);
    stream.on('tag:endpaginate', () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error('paginate not closed'); });
    stream.start();
  },
  *render(ctx, emitter) {
    ctx.push({ paginate: { pages: 1, current_page: 1, parts: [], previous: null, next: null } });
    emitter.write(yield this.liquid.renderer.renderTemplates(this.tpls, ctx));
    ctx.pop();
  },
});

function schemaOf(type) {
  const src = readFileSync(path.join(THEME, 'sections', `${type}.liquid`), 'utf8');
  const m = src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  return m ? JSON.parse(m[1]) : {};
}
function resolveSetting(def, value) {
  if (def.type === 'collection') return value === 'all' || value ? allCollection : null;
  if (def.type === 'link_list') return linklists[value] ?? null;
  return value;
}
async function renderSection(id, conf, globals) {
  const schema = schemaOf(conf.type);
  const settings = {};
  for (const d of schema.settings ?? []) if (d.id) settings[d.id] = resolveSetting(d, conf.settings?.[d.id] ?? d.default);
  const blocks = (conf.block_order ?? Object.keys(conf.blocks ?? {})).map((bid) => {
    const b = conf.blocks[bid];
    const bdef = (schema.blocks ?? []).find((x) => x.type === b.type) ?? { settings: [] };
    const bs = {};
    for (const d of bdef.settings ?? []) bs[d.id] = resolveSetting(d, b.settings?.[d.id] ?? d.default);
    return { id: bid, type: b.type, settings: bs, shopify_attributes: '' };
  });
  const html = await engine.renderFile(conf.type, { ...globals, section: { id, settings, blocks } }, { globals });
  return `<div id="shopify-section-${id}" class="shopify-section">${html}</div>`;
}

engine.registerTag('sections', {
  parse(token) { this.group = token.args.replace(/['"\s]/g, ''); },
  *render(ctx, emitter) {
    const g = JSON.parse(readFileSync(path.join(THEME, 'sections', `${this.group}.json`), 'utf8'));
    const globals = ctx.getAll();
    for (const id of g.order) emitter.write(yield renderSection(id, g.sections[id], globals));
  },
});

async function renderPage(template, out, extra) {
  const globals = {
    shop, settings, routes, linklists, collections, request: { locale: { iso_code: 'en-GB' }, origin: 'https://example.co.uk', page_type: template.split('.')[0] },
    cart: { item_count: extra.cartItems ? 3 : 0, items: extra.cartItems ?? [], total_price: extra.cartItems ? 4497 : 0, currency: { iso_code: 'GBP' } },
    canonical_url: 'https://example.co.uk/', page_title: extra.title, page_description: shop.description, content_for_header: '', template: { name: template.split('.')[0] },
    current_tags: null, current_page: 1, recommendations: { performed: true, products_count: 4, products: products.slice(1, 5) }, ...extra,
  };
  const t = JSON.parse(readFileSync(path.join(THEME, 'templates', `${template}.json`), 'utf8'));
  let body = '';
  for (const id of t.order) body += await renderSection(id, t.sections[id], globals);
  const layout = readFileSync(path.join(THEME, 'layout', 'theme.liquid'), 'utf8');
  const html = await engine.parseAndRender(layout, { ...globals, content_for_layout: body }, { globals });
  writeFileSync(path.join(OUT, out), html);
  return html;
}

const pages = [
  ['index', 'index.html', { title: 'Nook & Order — small spaces, sorted' }],
  ['product', 'product.html', { title: p0.title, product: p0, collection: allCollection }],
  ['collection', 'collection.html', { title: 'All storage', collection: allCollection }],
  ['cart', 'cart.html', { title: 'Your basket', cartItems }],
  ['page.contact', 'contact.html', { title: 'Contact us', page: { title: 'Contact us', content: '<p>Questions about an order or a product? Send us a message and include your order number if you have one.</p>' } }],
  ['page.faq', 'faq.html', { title: 'FAQs', page: { title: 'Help & FAQs', content: '<p>Answers to the questions we are asked most.</p>' } }],
  ['page.about', 'about.html', { title: 'About', page: { title: 'About us', content: '<p>[OWNER: write your genuine story here — why you started, what you check before listing a product.]</p>' } }],
  ['404', '404.html', { title: 'Not found' }],
];
let missing = 0;
for (const [tpl, out, extra] of pages) {
  const html = await renderPage(tpl, out, extra);
  const m = html.match(/MISSING_T\([^)]+\)/g) ?? [];
  missing += m.length;
  console.log(`rendered ${out.padEnd(16)} ${String(html.length).padStart(7)} bytes${m.length ? `  MISSING TRANSLATIONS: ${[...new Set(m)].join(', ')}` : ''}`);
}
console.log(readdirSync(OUT).length ? 'output in tests/theme-preview/out' : '');
if (missing) process.exit(1);
