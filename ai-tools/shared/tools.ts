/**
 * Single source of truth for every tool: route, price, token cap and SEO copy.
 * Imported by the frontend AND the Netlify functions, so it must not contain secrets.
 *
 * To change a price: edit `pricePence` here and redeploy. Stripe Checkout uses inline
 * price data, so no Stripe dashboard change is needed.
 */

export type ToolId =
  'parking-appeal' | 'bedtime-story' | 'speech-writer' | 'listing-writer' | 'cv-tailor';

export interface ToolConfig {
  id: ToolId;
  /** Public route of the landing page, e.g. "/parking-appeal". */
  route: string;
  name: string;
  /** Short label for the header navigation. */
  shortName: string;
  /** Text shown on the Stripe Checkout page. */
  stripeProductName: string;
  pricePence: number;
  /** Hard output cap passed to the AI as max_tokens. */
  maxTokens: number;
  /** false = not built yet: hidden from navigation, sitemap and checkout. */
  live: boolean;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
}

export const TOOLS: Record<ToolId, ToolConfig> = {
  'parking-appeal': {
    id: 'parking-appeal',
    route: '/parking-appeal',
    name: 'Parking Ticket Appeal Letter',
    shortName: 'Parking appeal',
    stripeProductName: 'Parking ticket appeal letter (PDF + Word)',
    pricePence: 399,
    maxTokens: 2000,
    live: true,
    tagline:
      'A firm, polite appeal letter for a council PCN or private parking charge, in minutes.',
    metaTitle: 'Parking Ticket Appeal Letter Writer (UK) – PCN & Private Charge | £3.99',
    metaDescription:
      'Write a firm, polite appeal letter for a UK council PCN or private parking charge. Answer a few questions, pay £3.99, download a ready-to-send PDF and Word letter.',
  },
  'bedtime-story': {
    id: 'bedtime-story',
    route: '/bedtime-story',
    name: 'Personalised Bedtime Story',
    shortName: 'Bedtime story',
    stripeProductName: 'Personalised bedtime story (A5 PDF)',
    pricePence: 299,
    maxTokens: 3000,
    live: true,
    tagline: 'A gentle, calming story starring your child, as a beautiful printable PDF.',
    metaTitle: 'Personalised Bedtime Story PDF for Your Child | £2.99',
    metaDescription:
      'A gentle bedtime story where your child is the hero, featuring their favourite things. Printable A5 PDF for £2.99.',
  },
  'speech-writer': {
    id: 'speech-writer',
    route: '/speech-writer',
    name: 'Speech Writer',
    shortName: 'Speech writer',
    stripeProductName: 'Speech (PDF + Word + cue cards)',
    pricePence: 499,
    maxTokens: 3500,
    live: true,
    tagline: 'Best man, wedding, eulogy or leaving-do speech built around your own stories.',
    metaTitle: 'Speech Writer – Best Man, Wedding, Eulogy & Retirement Speeches | £4.99',
    metaDescription:
      'Get a heartfelt or funny speech built from your own anecdotes, timed to length, with cue cards. £4.99.',
  },
  'listing-writer': {
    id: 'listing-writer',
    route: '/listing-writer',
    name: 'eBay & Vinted Listing Writer',
    shortName: 'Listing writer',
    stripeProductName: '10 eBay/Vinted listings',
    pricePence: 199,
    maxTokens: 1200,
    live: false,
    tagline: 'Snap a photo, get a search-friendly title and description. 10 listings for £1.99.',
    metaTitle: 'eBay & Vinted Listing Writer from Photos | 10 Listings £1.99',
    metaDescription:
      'Upload photos and get an optimised eBay or Vinted title, description, item specifics and keywords. 10 listings for £1.99.',
  },
  'cv-tailor': {
    id: 'cv-tailor',
    route: '/cv-tailor',
    name: 'Tailored CV & Cover Letter',
    shortName: 'CV tailor',
    stripeProductName: 'Tailored CV + cover letter (PDF + Word)',
    pricePence: 499,
    maxTokens: 5000,
    live: false,
    tagline: 'Tailor your CV to a job advert honestly, plus a one-page cover letter.',
    metaTitle: 'Tailor Your CV to a Job Advert + Cover Letter (UK) | £4.99',
    metaDescription:
      'Upload your CV and paste the job advert. Get an ATS-friendly tailored CV and cover letter. Free match preview. £4.99.',
  },
};

export const TOOL_IDS = Object.keys(TOOLS) as ToolId[];
export const LIVE_TOOLS = TOOL_IDS.map((id) => TOOLS[id]).filter((t) => t.live);

export function isToolId(value: unknown): value is ToolId {
  return typeof value === 'string' && value in TOOLS;
}

/** "£3.99" */
export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

/** Path of the post-payment page for a job. */
export function donePath(tool: ToolId, jobId: string): string {
  return `/t/${tool}/done?job=${encodeURIComponent(jobId)}`;
}
