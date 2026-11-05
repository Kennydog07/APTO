/**
 * Single source of truth for every tool: route, price, token cap and SEO copy.
 * Imported by the frontend AND the Netlify functions, so it must not contain secrets.
 *
 * To change a price: edit `pricePence` here and redeploy. Stripe Checkout uses inline
 * price data, so no Stripe dashboard change is needed.
 */

export type ToolId =
  | 'parking-appeal'
  | 'bedtime-story'
  | 'speech-writer'
  | 'listing-writer'
  | 'cv-tailor'
  | 'santa-letter'
  | 'flight-delay-claim'
  | 'deposit-return'
  | 'refund-letter'
  | 'meal-planner';

/** Month (1-12) and day, inclusive. */
export type MonthDay = [month: number, day: number];

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
  /** Set for credit-pack tools: number of uses bought per purchase. */
  credits?: number;
  /**
   * Seasonal tools only. Inside the window (inclusive, UK time) the tool is in the navigation
   * and can be bought. Outside it the landing page stays live for SEO, with a
   * "Back next Christmas" note, and checkout is switched off (client and server).
   */
  season?: { from: MonthDay; to: MonthDay; offSeasonNote: string };
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
    live: true,
    credits: 10,
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
    live: true,
    tagline: 'Tailor your CV to a job advert honestly, plus a one-page cover letter.',
    metaTitle: 'Tailor Your CV to a Job Advert + Cover Letter (UK) | £4.99',
    metaDescription:
      'Upload your CV and paste the job advert. Get an ATS-friendly tailored CV and cover letter. Free match preview. £4.99.',
  },
  'santa-letter': {
    id: 'santa-letter',
    route: '/santa-letter',
    name: 'Personalised Letter from Santa',
    shortName: 'Santa letter',
    stripeProductName: 'Personalised letter from Father Christmas (A4 PDF)',
    pricePence: 199,
    maxTokens: 1500,
    live: true,
    season: {
      from: [10, 1],
      to: [12, 24],
      offSeasonNote:
        'Father Christmas is resting after a busy Christmas. Letters are back next Christmas, from 1 October.',
    },
    tagline:
      'A warm, personal letter from the North Pole, with a Nice List certificate and envelope.',
    metaTitle: 'Personalised Letter from Santa (UK) – Printable PDF | £1.99',
    metaDescription:
      'A personalised letter from Father Christmas that mentions your child’s good deeds, plus a Nice List certificate and envelope to print. A4 PDF for £1.99.',
  },
  'flight-delay-claim': {
    id: 'flight-delay-claim',
    route: '/flight-delay-claim',
    name: 'Flight Delay & Cancellation Claim Letter',
    shortName: 'Flight delay claim',
    stripeProductName: 'Flight delay compensation claim letter (PDF + Word)',
    pricePence: 399,
    maxTokens: 2000,
    live: true,
    tagline:
      'Check what UK261 / EU261 compensation you may be owed for free, then get a firm claim letter.',
    metaTitle: 'Flight Delay Compensation Claim Letter (UK261) – Free Check | £3.99',
    metaDescription:
      'Delayed, cancelled or bumped flight? Check free what UK261 or EU261 compensation you may be owed, then get a formal claim letter (PDF + Word) for £3.99.',
  },
  'deposit-return': {
    id: 'deposit-return',
    route: '/deposit-return',
    name: 'Tenancy Deposit Return Letter',
    shortName: 'Deposit return',
    stripeProductName: 'Tenancy deposit return letter (PDF + Word)',
    pricePence: 399,
    maxTokens: 2000,
    live: true,
    tagline:
      'Get your tenancy deposit back: a request, a dispute of unfair deductions, or a letter before action.',
    metaTitle: 'Tenancy Deposit Return Letter (UK) – Dispute Deductions | £3.99',
    metaDescription:
      'Landlord keeping your deposit? Get a letter asking for it back or disputing unfair deductions, with next steps for England, Wales, Scotland or NI. £3.99.',
  },
  'refund-letter': {
    id: 'refund-letter',
    route: '/refund-letter',
    name: 'Refund & Complaint Letter',
    shortName: 'Refund letter',
    stripeProductName: 'Refund and complaint letter (PDF + Word)',
    pricePence: 299,
    maxTokens: 1800,
    live: true,
    tagline:
      'Faulty item, missing order, bad service or a wrong energy bill? Get a firm letter that uses your consumer rights.',
    metaTitle: 'Refund & Complaint Letter (Consumer Rights Act) – UK | £2.99',
    metaDescription:
      'Faulty goods, a missing delivery, poor service or a wrong energy bill? Get a firm complaint letter using the right consumer rights for your dates. £2.99.',
  },
  'meal-planner': {
    id: 'meal-planner',
    route: '/meal-planner',
    name: 'Weekly Meal Plan & Shopping List',
    shortName: 'Meal planner',
    stripeProductName: 'Personalised weekly meal plan and shopping list (PDF)',
    pricePence: 299,
    maxTokens: 4000,
    live: true,
    tagline:
      'A week of meals built around your family, budget and allergies, with a shopping list by aisle.',
    metaTitle: 'Personalised Weekly Meal Plan & Shopping List (UK) – PDF | £2.99',
    metaDescription:
      'A 7-day meal plan for your household, budget, diet and allergies, with a shopping list by supermarket aisle and simple recipe cards. Printable PDF, £2.99.',
  },
};

export const TOOL_IDS = Object.keys(TOOLS) as ToolId[];
export const LIVE_TOOLS = TOOL_IDS.map((id) => TOOLS[id]).filter((t) => t.live);

/** Today's month and day in the UK (seasonal switches follow UK dates). */
export function ukMonthDay(now: Date = new Date()): MonthDay {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return [get('month'), get('day')];
}

/** True if the tool is non-seasonal, or today (UK) is inside its season window. */
export function isInSeason(tool: ToolConfig, now: Date = new Date()): boolean {
  if (!tool.season) return true;
  const [m, d] = ukMonthDay(now);
  const key = m * 100 + d;
  const from = tool.season.from[0] * 100 + tool.season.from[1];
  const to = tool.season.to[0] * 100 + tool.season.to[1];
  return from <= to ? key >= from && key <= to : key >= from || key <= to;
}

/** Tools to show in navigation and on the home page today (live and in season). */
export function navTools(now: Date = new Date()): ToolConfig[] {
  return LIVE_TOOLS.filter((t) => isInSeason(t, now));
}

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
