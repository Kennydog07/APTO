/* =====================================================================
   GUIDE CATEGORIES
   ---------------------------------------------------------------------
   Every product belongs to one of these categories. `tier` decides the
   price (see pricing.ts). You normally never need to edit this file.
   ===================================================================== */
import type { PriceTier } from './pricing';

export const CATEGORIES = {
  brunch: {
    label: 'Brunch',
    plural: 'Brunch guides',
    tier: 'brunch' as PriceTier,
    blurb: 'Weekend brunches with prices, packages, days and times.',
  },
  'happy-hours': {
    label: 'Happy Hours',
    plural: 'Happy hour guides',
    tier: 'deals' as PriceTier,
    blurb: 'Happy hours and drinks offers, sorted by day and time.',
  },
  'daily-deals': {
    label: 'Daily Deals',
    plural: 'Daily deals guides',
    tier: 'deals' as PriceTier,
    blurb: 'Business lunches, restaurant specials and food deals, day by day.',
  },
} as const;

export type CategoryId = keyof typeof CATEGORIES;
export const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[];
