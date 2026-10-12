# SEO content pack

Focus on genuinely useful pages. No mass-produced keyword pages.

## Collections (paste into Shopify → Products → Collections)
**All storage** — *Meta title:* Small-Space Storage & Organisation | Nook & Order (≤60 chars) · *Meta description:* Renter-friendly storage for small UK homes: cupboard, wardrobe, bathroom and hallway fixes, shipped from UK stock with tracked delivery.
> Description: Practical storage for small UK homes. Every product lists the supplier's measurements and materials, ships from UK stock, and comes with 14-day cancellation rights.

**Kitchen cupboards** — *Meta title:* Kitchen Cupboard Organisers | Nook & Order · *Meta description:* Shelf risers, turntables and drawer dividers that make small kitchen cupboards work — measured, renter-friendly and shipped from the UK.

**Wardrobes & bedrooms** — *Meta title:* Wardrobe & Under-Bed Storage | Nook & Order · *Meta description:* Space-saving hangers, under-bed bags and over-door storage for smaller bedrooms. UK stock, tracked delivery.

**Bathrooms & hallways** — *Meta title:* Bathroom & Hallway Storage | Nook & Order · *Meta description:* No-drill caddies, drawer trays, hooks and shoe storage for compact bathrooms and hallways.

## Product page pattern
- Title: `{What it is} — {key spec}` e.g. "Two-tier sliding under-sink organiser — 40 cm wide" (only with verified specs).
- URL handle: short, lower-case, hyphenated (Shopify default).
- Meta description (≤155 chars): what it solves + one verified spec + "UK stock".
- Image alt text: describe the image ("White two-tier organiser fitted under a kitchen sink").
- Metafields used by the theme: `custom.benefits` (list), `custom.specifications` (multi-line), `custom.delivery_estimate` (single line, from supplier), `custom.fitting` (single line).
- Structured data: Product JSON-LD is output automatically by the theme; FAQ JSON-LD on FAQ sections.

## Buying guides (blog drafts generated weekly by Workflow 09)
1. How to organise an under-sink cupboard (renter-friendly)
2. How to measure a cupboard before buying organisers
3. Small bathroom storage ideas that don't need drilling
4. Drawer dividers: bamboo vs plastic — which suits you?
5. Under-bed storage: bags vs boxes

## Internal linking
- Every guide links to 1–3 relevant products and to the delivery/returns FAQ.
- Every product links to its collection (breadcrumbs) and to the measuring guide.
- The homepage FAQ links to the policies.

## Technical SEO (done in theme)
Canonical URLs, meta titles/descriptions, Open Graph tags, Product and FAQ structured data, responsive images with `srcset`, lazy loading below the fold, one H1 per page, semantic headings, fast CSS with no render-blocking third-party scripts.
