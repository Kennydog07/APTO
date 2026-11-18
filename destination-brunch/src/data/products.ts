/* =====================================================================
   PRODUCTS (the guides you sell)
   ---------------------------------------------------------------------
   HOW TO PUT A GUIDE ON SALE (see README.md for screenshots and detail)
     1. Create the product on Gumroad and set the SAME price as pricing.ts.
     2. Copy the product's Gumroad link, e.g. https://yourname.gumroad.com/l/dubai-brunch
     3. Paste it between the quotes of `gumroadURL` for that product below.
     4. Change `status` to 'published'.
     5. Save, commit and push. Netlify rebuilds the site automatically.
   The "Download Now" button only appears when BOTH steps 3 and 4 are done.
   If the link is not a real Gumroad product link, the build stops with a
   clear message instead of sending customers to the wrong place.

   status:
     'published'   -> listed, and buyable once a Gumroad link is set
     'coming-soon' -> listed with a "Coming soon" label, no buy button
     'draft'       -> only visible on your own computer (npm run dev)
     'hidden'      -> never shown anywhere

   Prices come from pricing.ts (brunch = $4.99, happy hours / daily deals = $2.49).
   To give ONE product a different price, add e.g.  priceUSD: 3.99,
   ===================================================================== */
import type { CategoryId } from './categories';
import type { Status } from './destinations';

export interface Product {
  /** Unique ID, also the web address: /guides/<id> */
  id: string;
  /** The city's `slug` from destinations.ts (city, country and region come from there). */
  destination: string;
  title: string;
  category: CategoryId;
  /** Optional extra categories for filters, e.g. a combined brunch & happy hour guide: ['brunch'] */
  alsoIn?: CategoryId[];
  status: Status;
  /** The product's own Gumroad link. Leave '' until you have it. Never use your general storefront link. */
  gumroadURL: string;
  /** Optional: overrides the category price from pricing.ts. */
  priceUSD?: number;
  /** One sentence for product cards. */
  shortDescription: string;
  /** Paragraphs for the product page. */
  description: string[];
  /** Exactly three short benefits for the product card. Only list things the app really does. */
  highlights: [string, string, string];
  /** Full feature list for the product page. Only list things the app really does. */
  features: string[];
  /** Optional cover image path; defaults to the city photo. */
  coverImage?: string;
  /** Screenshots in public/images/screens/. */
  screenshots: { src: string; alt: string }[];
  compatibility: string;
  /** Date you last checked the guide's information, 'YYYY-MM' or 'YYYY-MM-DD'. Leave '' if not verified. */
  lastUpdated: string;
  seoTitle: string;
  seoDescription: string;
  /** Extra questions for this product page. */
  faqs?: { q: string; a: string }[];
}

/* ---- Shared wording (edit once, used by many products) ---------------- */

const WEB_APP_COMPAT =
  'Mobile-friendly web app that opens in your browser on iPhone, Android, tablet or computer. No app store needed. Internet connection required.';

/** Features every city brunch app has. Remove a line here if it stops being true. */
const BRUNCH_CORE = [
  'Weekend brunches with prices, packages, days and times',
  'Pick by cuisine, or search in plain words such as “steak with a DJ”',
  'Filter by area, views, pool or beach brunches and deals',
  'Sort by price or by the guide’s own food and fun ratings',
  'Map view for each venue, with Google Maps and Apple Maps directions',
  'Links to each venue or menu page so you can check details and book',
  'Save favourites and keep a private brunch log on your phone',
  'Share a shortlist with friends by WhatsApp, Messenger or link',
];
const DRINKS = 'Drinks-package prices and a drinks filter, where venues offer them';
const ARABIC = 'English and Arabic versions';

const shots = (id: string, city: string, kind = 'brunch guide') => [
  { src: `/images/screens/${id}-1.webp`, alt: `${city} ${kind} home screen with search` },
  { src: `/images/screens/${id}-2.webp`, alt: `${city} ${kind} venue card with price, times and links` },
  { src: `/images/screens/${id}-3.webp`, alt: `${city} ${kind} category picker` },
];

const brunchFaq = (city: string, days: string) => [
  {
    q: `Which days does the ${city} brunch guide cover?`,
    a: `It covers ${days} brunches, the main brunch days in ${city}.`,
  },
];

/** "Beyond brunch" section added to some apps in Nov 2026 (see city-app-picks/). */
const PICKS = (city: string) =>
  `Bonus \u201cBeyond brunch\u201d section: our picks of the best pubs, bars and restaurants in ${city}, with Maps links`;
const PICKS_HIGHLIGHT = 'Plus best pubs, bars & restaurants';
const picksShot = (id: string, city: string) => ({
  src: `/images/screens/${id}-4.webp`,
  alt: `${city} brunch guide best pubs, bars and restaurants section`,
});
const picksFaq = (city: string) => ({
  q: `Does the ${city} guide cover anything besides brunch?`,
  a: `Yes. It includes a \u201cBeyond brunch\u201d section with our picks of the best pubs, bars and restaurants in ${city}, each with its area, a short description, a price level and a link to open it in Maps.`,
});

/** Features of the day-by-day happy hour apps. Remove a line if it stops being true. */
const hhFeatures = (offers: string, opts: { free?: boolean; arabic?: boolean } = {}) => [
  `${offers.charAt(0).toUpperCase()}${offers.slice(1)} in one place, sorted by day and time`,
  'Day picker and a week-at-a-glance grid',
  `Filters for offers on now${opts.free ? ', free extras' : ''}, unlimited offers and set times`,
  'Filter by area; sort by start time, ending soonest, cheapest or venue name',
  'Prices and links to each offer\u2019s source',
  'Map view with Google Maps and Apple Maps directions',
  'Save offers to \u201cMy nights\u201d on your phone and share them with friends',
  ...(opts.arabic ? [ARABIC] : []),
];
const dealShots = (id: string, city: string, kind: string) => [
  { src: `/images/screens/${id}-1.webp`, alt: `${city} ${kind} home screen with day picker and search` },
  { src: `/images/screens/${id}-2.webp`, alt: `${city} ${kind} offers sorted by time` },
  { src: `/images/screens/${id}-3.webp`, alt: `${city} ${kind} offer type picker` },
];

/* ---- The catalogue ----------------------------------------------------- */

export const PRODUCTS: Product[] = [
  {
    id: 'dubai-brunch',
    destination: 'dubai',
    title: 'Destination : Brunch — Dubai',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Friday and Saturday brunches across the Palm, Dubai Marina, DIFC and Downtown.',
    description: [
      'Find your Friday or Saturday brunch in Dubai. Choose the food you are craving or type what you fancy, and the guide matches you with brunches across Palm Jumeirah, Dubai Marina, JBR, DIFC and Downtown.',
      'Each listing shows the soft-drink and drinks-package price, timings, the vibe and a link to the venue or menu, plus any 2-for-1 or discount offers the guide has found.',
    ],
    highlights: ['Prices, packages and times', 'Search by cuisine, area or vibe', 'Maps and venue links'],
    features: [...BRUNCH_CORE, DRINKS, ARABIC],
    screenshots: shots('dubai-brunch', 'Dubai'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'Dubai Brunch Guide 2026: Friday & Saturday Brunch Deals',
    seoDescription:
      'Dubai brunch guide with Friday and Saturday brunches, prices, packages, times, maps and venue links.',
    faqs: brunchFaq('Dubai', 'Friday and Saturday'),
  },
  {
    id: 'abu-dhabi-brunch',
    destination: 'abu-dhabi',
    title: 'Destination : Brunch — Abu Dhabi',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Friday and Saturday brunches on Saadiyat, Yas Island, Al Maryah and the Corniche.',
    description: [
      'Find your Friday or Saturday brunch in Abu Dhabi, from beachfront resorts on Saadiyat to hotel restaurants on Yas Island and Al Maryah Island.',
      'Each listing shows prices, packages, timings, the vibe and a link to the venue or menu.',
    ],
    highlights: ['Prices, packages and times', 'Pool, beach and views filters', 'Maps and venue links'],
    features: [...BRUNCH_CORE, DRINKS, ARABIC],
    screenshots: shots('abu-dhabi-brunch', 'Abu Dhabi'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'Abu Dhabi Brunch Guide 2026: Friday & Saturday Brunches',
    seoDescription:
      'Abu Dhabi brunch guide with weekend brunches on Saadiyat, Yas and Al Maryah: prices, packages, times, maps and venue links.',
    faqs: brunchFaq('Abu Dhabi', 'Friday and Saturday'),
  },
  {
    id: 'riyadh-brunch',
    destination: 'riyadh',
    title: 'Destination : Brunch — Riyadh',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Friday and Saturday brunches across Olaya, Al Hada, KAFD and North Riyadh.',
    description: [
      'Find your Friday or Saturday brunch in Riyadh. Choose your flavours or type what you fancy, and the guide matches you with brunches across Olaya, Al Hada, the business districts and North Riyadh.',
      'Each listing shows prices, timings, the vibe and a link to the venue or menu. Venues in Saudi Arabia do not serve alcohol, so the guide contains no drinks offers.',
    ],
    highlights: ['Prices and times', 'Search by cuisine, area or vibe', 'English and Arabic'],
    features: [...BRUNCH_CORE, ARABIC],
    screenshots: shots('riyadh-brunch', 'Riyadh'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'Riyadh Brunch Guide 2026: Friday & Saturday Brunches',
    seoDescription:
      'Riyadh brunch guide with Friday and Saturday brunches in Olaya, Al Hada and KAFD: prices, times, maps and venue links, in English and Arabic.',
    faqs: brunchFaq('Riyadh', 'Friday and Saturday'),
  },
  {
    id: 'riyadh-daily-deals',
    destination: 'riyadh',
    title: 'Daily Deals Riyadh',
    category: 'daily-deals',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Business lunches, ladies’ offers and food deals across Riyadh, sorted by day and time.',
    description: [
      'What’s the deal today? Daily Deals Riyadh lists business lunches, ladies’ offers and food deals across the city, sorted by day and time, with prices and venue links.',
      'Pick a day, see the week at a glance, and filter for offers that are on now, have free extras or run at set times. Everything is alcohol-free, in line with Saudi law.',
    ],
    highlights: ['Sorted by day and time', 'Business lunches and ladies’ offers', 'English and Arabic'],
    features: [
      'Business lunches, ladies’ offers and food deals in one place',
      'Day picker and a week-at-a-glance grid',
      'Filters for offers on now, free extras, unlimited offers and set times',
      'Filter by area; sort by start time, ending soonest, cheapest or venue name',
      'Prices and links to each offer’s source',
      'Map view with Google Maps and Apple Maps directions',
      'Save offers to “My deals” on your phone and share them with friends',
      ARABIC,
    ],
    screenshots: shots('riyadh-daily-deals', 'Riyadh', 'daily deals guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-16',
    seoTitle: 'Riyadh Restaurant Deals: Business Lunches & Food Offers',
    seoDescription:
      'Riyadh restaurant deals guide: business lunches, ladies’ offers and food deals sorted by day and time, with prices and maps.',
    faqs: [
      {
        q: 'Does Daily Deals Riyadh include happy hours?',
        a: 'No. Venues in Saudi Arabia do not serve alcohol, so the guide covers business lunches, ladies’ offers and food deals only.',
      },
    ],
  },
  {
    id: 'doha-brunch',
    destination: 'doha',
    title: 'Destination : Brunch — Doha',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'A Doha weekend brunch guide in the same format as our other city guides.',
    description: [
      'The Doha brunch guide is in preparation. When it launches it will follow the same format as our other city brunch guides.',
    ],
    highlights: ['Weekend brunches', 'Same format as our city guides', 'Coming soon'],
    // Features are not listed until the guide is ready and checked.
    features: [],
    screenshots: [],
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '',
    seoTitle: 'Destination : Brunch \u2014 Doha: Brunch Guide Coming Soon',
    seoDescription: 'The Doha brunch guide from Destination : Brunch is in preparation and will cover Friday and Saturday brunches in Qatar\u2019s capital.',
  },
  {
    id: 'london-brunch',
    destination: 'london',
    title: 'Destination : Brunch — London',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Saturday and Sunday brunches across Soho, the City, Mayfair and London Bridge.',
    description: [
      'Find your Saturday or Sunday brunch in London, from bottomless brunches in Soho to brunches with a view in the City and classic Sunday roasts.',
      'Each listing shows prices, packages, timings, the vibe and a link to the venue or menu.',
    ],
    highlights: ['Prices, packages and times', 'Bottomless and views filters', 'Maps and venue links'],
    features: [...BRUNCH_CORE, DRINKS],
    screenshots: shots('london-brunch', 'London'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'London Brunch Guide 2026: Saturday & Sunday Brunches',
    seoDescription:
      'London brunch guide with weekend brunches in Soho, the City, Mayfair and London Bridge: prices, packages, times, maps and venue links.',
    faqs: brunchFaq('London', 'Saturday and Sunday'),
  },
  {
    id: 'manchester-brunch',
    destination: 'manchester',
    title: 'Destination : Brunch — Manchester',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Bottomless and weekend brunches in the Northern Quarter, Ancoats, Spinningfields and Deansgate.',
    description: [
      'Find your Saturday or Sunday brunch in Manchester, including bottomless brunches across the Northern Quarter, Ancoats, Spinningfields and Deansgate.',
      'Each listing shows prices, packages, timings, the vibe and a link to the venue or menu.',
      'New: a \u201cBeyond brunch\u201d section with our picks of the best pubs, bars and restaurants in Manchester, so the guide covers the rest of your trip too.',
    ],
    highlights: ['Prices, packages and times', 'Bottomless brunch options', PICKS_HIGHLIGHT],
    features: [PICKS('Manchester'), ...BRUNCH_CORE, DRINKS],
    screenshots: [...shots('manchester-brunch', 'Manchester'), picksShot('manchester-brunch', 'Manchester')],
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'Manchester Bottomless Brunch Guide 2026',
    seoDescription:
      'Manchester bottomless brunch guide: weekend brunches in the Northern Quarter, Ancoats, Spinningfields and Deansgate, with prices and times.',
    faqs: [...brunchFaq('Manchester', 'Saturday and Sunday'), picksFaq('Manchester')],
  },
  {
    id: 'brighton-brunch',
    destination: 'brighton',
    title: 'Destination : Brunch \u2014 Brighton, Hove & Worthing',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Weekend brunches from The Lanes and Hove along the coast to Lancing and Worthing.',
    description: [
      'Find your Saturday or Sunday brunch in Brighton, Hove and along the coast to Worthing: bottomless brunches in The Lanes and on West Street, award-winning cafés on Church Road in Hove, a beach café in Lancing and bottomless brunches in Worthing.',
      'Each listing shows prices, packages, timings, the vibe and a link to the venue or menu, and you can filter by area, from The Lanes to Hove, Lancing and Worthing.',
      'It also includes a \u201cBeyond brunch\u201d section with our picks of the best pubs, bars and restaurants from Brighton and Hove to Shoreham-by-Sea and Worthing.',
    ],
    highlights: ['Brighton, Hove & Worthing in one guide', 'Bottomless and café brunches', PICKS_HIGHLIGHT],
    features: [
      'Covers Brighton, Hove, Lancing and Worthing, with an area filter for each',
      PICKS('Brighton, Hove, Shoreham and Worthing'),
      ...BRUNCH_CORE,
      DRINKS,
    ],
    screenshots: [...shots('brighton-brunch', 'Brighton'), picksShot('brighton-brunch', 'Brighton')],
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'Brighton & Hove Brunch Guide 2026: Bottomless Brunch to Worthing',
    seoDescription:
      'Brighton and Hove brunch guide covering The Lanes, Hove, Lancing and Worthing: bottomless and café brunches with prices, times, maps and links.',
    faqs: [...brunchFaq('Brighton', 'Saturday and Sunday'), picksFaq('Brighton')],
  },
  {
    id: 'barcelona-brunch',
    destination: 'barcelona',
    title: 'Destination : Brunch — Barcelona',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Weekend brunches in the Gothic Quarter, Born, Eixample and Sant Antoni.',
    description: [
      'Find your Saturday or Sunday brunch in Barcelona, from the Gothic Quarter and Born to Eixample and Sant Antoni.',
      'Each listing shows prices, timings, the vibe and a link to the venue or menu.',
      'New: a \u201cBeyond brunch\u201d section with our picks of the best pubs, bars and restaurants in Barcelona, so the guide covers the rest of your trip too.',
    ],
    highlights: ['Prices and times', 'Search by cuisine, area or vibe', PICKS_HIGHLIGHT],
    features: [PICKS('Barcelona'), ...BRUNCH_CORE, DRINKS],
    screenshots: [...shots('barcelona-brunch', 'Barcelona'), picksShot('barcelona-brunch', 'Barcelona')],
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'Barcelona Brunch Guide 2026: Weekend Brunches',
    seoDescription:
      'Barcelona brunch guide with weekend brunches in the Gothic Quarter, Born, Eixample and Sant Antoni: prices, times, maps and links.',
    faqs: [...brunchFaq('Barcelona', 'Saturday and Sunday'), picksFaq('Barcelona')],
  },
  {
    id: 'bangkok-brunch',
    destination: 'bangkok',
    title: 'Destination : Brunch — Bangkok',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Hotel and rooftop brunches across Sukhumvit, Silom, Sathorn and Siam.',
    description: [
      'Find your Saturday or Sunday brunch in Bangkok, from hotel brunches to rooftop venues across Sukhumvit, Silom, Sathorn and Siam.',
      'Each listing shows prices, packages, timings, the vibe and a link to the venue or menu.',
      'New: a \u201cBeyond brunch\u201d section with our picks of the best pubs, bars and restaurants in Bangkok, so the guide covers the rest of your trip too.',
    ],
    highlights: ['Prices, packages and times', 'Views and pool filters', PICKS_HIGHLIGHT],
    features: [PICKS('Bangkok'), ...BRUNCH_CORE, DRINKS],
    screenshots: [...shots('bangkok-brunch', 'Bangkok'), picksShot('bangkok-brunch', 'Bangkok')],
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'Bangkok Brunch Guide 2026: Hotel & Rooftop Brunches',
    seoDescription:
      'Bangkok brunch guide with weekend hotel and rooftop brunches on Sukhumvit, Silom, Sathorn and Siam: prices, times, maps and links.',
    faqs: [...brunchFaq('Bangkok', 'Saturday and Sunday'), picksFaq('Bangkok')],
  },
  {
    id: 'singapore-brunch',
    destination: 'singapore',
    title: 'Destination : Brunch — Singapore',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Weekend brunches around Marina Bay, Orchard and Sentosa.',
    description: [
      'Find your Saturday or Sunday brunch in Singapore, from Marina Bay hotel brunches to spots on Orchard Road and Sentosa.',
      'Each listing shows prices, packages, timings, the vibe and a link to the venue or menu.',
      'New: a \u201cBeyond brunch\u201d section with our picks of the best pubs, bars and restaurants in Singapore, so the guide covers the rest of your trip too.',
    ],
    highlights: ['Prices, packages and times', 'Search by cuisine, area or vibe', PICKS_HIGHLIGHT],
    features: [PICKS('Singapore'), ...BRUNCH_CORE, DRINKS],
    screenshots: [...shots('singapore-brunch', 'Singapore'), picksShot('singapore-brunch', 'Singapore')],
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'Singapore Brunch Guide 2026: Weekend Brunches & Dining',
    seoDescription:
      'Singapore brunch and dining guide: weekend brunches at Marina Bay, Orchard and Sentosa with prices, packages, times, maps and links.',
    faqs: [...brunchFaq('Singapore', 'Saturday and Sunday'), picksFaq('Singapore')],
  },
  {
    id: 'hong-kong-brunch',
    destination: 'hong-kong',
    title: 'Destination : Brunch — Hong Kong',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Weekend brunches in Central, Tsim Sha Tsui, Admiralty and Discovery Bay.',
    description: [
      'Find your Saturday or Sunday brunch in Hong Kong, from harbour-view hotel brunches in Central and Tsim Sha Tsui to Discovery Bay.',
      'Each listing shows prices, packages, timings, the vibe and a link to the venue or menu.',
      'New: a \u201cBeyond brunch\u201d section with our picks of the best pubs, bars and restaurants in Hong Kong, so the guide covers the rest of your trip too.',
    ],
    highlights: ['Prices, packages and times', 'Views filter', PICKS_HIGHLIGHT],
    features: [PICKS('Hong Kong'), ...BRUNCH_CORE, DRINKS],
    screenshots: [...shots('hong-kong-brunch', 'Hong Kong'), picksShot('hong-kong-brunch', 'Hong Kong')],
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'Hong Kong Brunch Guide 2026: Weekend Brunches',
    seoDescription:
      'Hong Kong brunch guide with weekend brunches in Central, Tsim Sha Tsui, Admiralty and Discovery Bay: prices, times, maps and links.',
    faqs: [...brunchFaq('Hong Kong', 'Saturday and Sunday'), picksFaq('Hong Kong')],
  },
  {
    id: 'new-york-brunch',
    destination: 'new-york',
    title: 'Destination : Brunch — New York',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Saturday and Sunday brunches across Manhattan, Brooklyn and Queens.',
    description: [
      'Find your Saturday or Sunday brunch in New York, across Manhattan, Brooklyn and Queens.',
      'Each listing shows prices, timings, the vibe and a link to the venue or menu.',
      'New: a \u201cBeyond brunch\u201d section with our picks of the best pubs, bars and restaurants in New York, so the guide covers the rest of your trip too.',
    ],
    highlights: ['Prices and times', 'Search by cuisine, area or vibe', PICKS_HIGHLIGHT],
    features: [PICKS('New York'), ...BRUNCH_CORE, DRINKS],
    screenshots: [...shots('new-york-brunch', 'New York'), picksShot('new-york-brunch', 'New York')],
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'New York Brunch Guide 2026: Saturday & Sunday Brunches',
    seoDescription:
      'New York brunch guide with weekend brunches in Manhattan, Brooklyn and Queens: prices, times, maps and venue links.',
    faqs: [...brunchFaq('New York', 'Saturday and Sunday'), picksFaq('New York')],
  },
  {
    id: 'dubai-happy-hours',
    destination: 'dubai',
    title: 'Happy Hour Dubai',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, ladies’ nights and food deals across Dubai, sorted by day and time.',
    description: [
      'Happy hours, ladies’ nights and food deals across Dubai, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, have free extras, are unlimited or run at set times. Covers areas including Business Bay, Palm Jumeirah, JBR and DIFC.',
      'Drinks offers are at licensed venues such as hotels. Please drink responsibly and follow local laws.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and ladies’ nights', 'English and Arabic'],
    features: hhFeatures('happy hours, ladies’ nights and food deals', { free: true, arabic: true }),
    screenshots: dealShots('dubai-happy-hours', 'Dubai', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-16',
    seoTitle: 'Dubai Happy Hour Guide: Happy Hours, Ladies’ Nights & Deals',
    seoDescription:
      'Dubai happy hour guide: happy hours, ladies’ nights and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'abu-dhabi-happy-hours',
    destination: 'abu-dhabi',
    title: 'Happy Hour Abu Dhabi',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, ladies’ nights and food deals across Abu Dhabi, sorted by day and time.',
    description: [
      'Happy hours, ladies’ nights and food deals across Abu Dhabi, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, have free extras, are unlimited or run at set times. Covers areas including Yas Bay, the Corniche, Yas Island and Saadiyat Island.',
      'Drinks offers are at licensed venues such as hotels. Please drink responsibly and follow local laws.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and ladies’ nights', 'English and Arabic'],
    features: hhFeatures('happy hours, ladies’ nights and food deals', { free: true, arabic: true }),
    screenshots: dealShots('abu-dhabi-happy-hours', 'Abu Dhabi', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-16',
    seoTitle: 'Abu Dhabi Happy Hour Guide: Happy Hours, Ladies’ Nights & Deals',
    seoDescription:
      'Abu Dhabi happy hour guide: happy hours, ladies’ nights and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'doha-happy-hours',
    destination: 'doha',
    title: 'Happy Hour Doha',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, ladies’ nights, food deals and staff & resident discounts across Doha, sorted by day and time.',
    description: [
      'Updated 18 November 2026 with more than 150 offers, including Hamilton’s, Marina29 and Mulberry Tavern on The Pearl.',
      'Happy hours, ladies’ nights and food deals across Doha, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, have free extras, are unlimited or run at set times. Covers areas including West Bay, Lusail, Msheireb and The Pearl.',
      'Drinks offers are at licensed venues such as hotels. Please drink responsibly and follow local laws.',
    ],
    highlights: ['150+ offers, sorted by day and time', 'Staff & resident deals', 'English and Arabic'],
    features: [
      ...hhFeatures('happy hours, ladies’ nights and food deals', { free: true, arabic: true }),
      'Staff & resident deals: industry nights for hoteliers, crew, teachers and healthcare staff, plus resident and employee discounts',
    ],
    screenshots: dealShots('doha-happy-hours', 'Doha', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-18',
    seoTitle: 'Doha Happy Hour Guide: Happy Hours, Ladies’ Nights & Deals',
    seoDescription:
      'Doha happy hour guide: happy hours, ladies’ nights and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'london-happy-hours',
    destination: 'london',
    title: 'Happy Hour London',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, bottomless deals and food deals across London, sorted by day and time.',
    description: [
      'Happy hours, bottomless deals and food deals across London, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, are unlimited or run at set times. Covers areas including Soho, Covent Garden, Shoreditch and Spitalfields.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and bottomless deals', 'Maps and venue links'],
    features: hhFeatures('happy hours, bottomless deals and food deals', { free: false, arabic: false }),
    screenshots: dealShots('london-happy-hours', 'London', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'London Happy Hour Guide: Happy Hours, Bottomless & Food Deals',
    seoDescription:
      'London happy hour guide: happy hours, bottomless deals and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'manchester-happy-hours',
    destination: 'manchester',
    title: 'Happy Hour Manchester',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, bottomless deals and food deals across Manchester, sorted by day and time.',
    description: [
      'Happy hours, bottomless deals and food deals across Manchester, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, are unlimited or run at set times. Covers areas including the Northern Quarter, the City Centre and Ancoats.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and bottomless deals', 'Maps and venue links'],
    features: hhFeatures('happy hours, bottomless deals and food deals', { free: false, arabic: false }),
    screenshots: dealShots('manchester-happy-hours', 'Manchester', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Manchester Happy Hour Guide: Happy Hours, Bottomless & Food Deals',
    seoDescription:
      'Manchester happy hour guide: happy hours, bottomless deals and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'brighton-happy-hours',
    destination: 'brighton',
    title: 'Happy Hour Brighton',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, bottomless deals and food deals across Brighton, sorted by day and time.',
    description: [
      'Happy hours, bottomless deals and food deals across Brighton, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, are unlimited or run at set times. Covers areas including The Lanes, the seafront, Kemptown and West Street.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and bottomless deals', 'Maps and venue links'],
    features: hhFeatures('happy hours, bottomless deals and food deals', { free: false, arabic: false }),
    screenshots: dealShots('brighton-happy-hours', 'Brighton', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Brighton Happy Hour Guide: Happy Hours, Bottomless & Food Deals',
    seoDescription:
      'Brighton happy hour guide: happy hours, bottomless deals and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'barcelona-happy-hours',
    destination: 'barcelona',
    title: 'Happy Hour Barcelona',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, bottomless deals and food deals across Barcelona, sorted by day and time.',
    description: [
      'Happy hours, bottomless deals and food deals across Barcelona, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, are unlimited or run at set times. Covers areas including the Gothic Quarter, Gràcia and El Born.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and bottomless deals', 'Maps and venue links'],
    features: hhFeatures('happy hours, bottomless deals and food deals', { free: false, arabic: false }),
    screenshots: dealShots('barcelona-happy-hours', 'Barcelona', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Barcelona Happy Hour Guide: Happy Hours, Bottomless & Food Deals',
    seoDescription:
      'Barcelona happy hour guide: happy hours, bottomless deals and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'bangkok-happy-hours',
    destination: 'bangkok',
    title: 'Happy Hour Bangkok',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, ladies’ nights and food deals across Bangkok, sorted by day and time.',
    description: [
      'Happy hours, ladies’ nights and food deals across Bangkok, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, have free extras, are unlimited or run at set times. Covers areas including Sukhumvit, Thong Lo, Ratchadamri and Bang Rak.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and ladies’ nights', 'Maps and venue links'],
    features: hhFeatures('happy hours, ladies’ nights and food deals', { free: true, arabic: false }),
    screenshots: dealShots('bangkok-happy-hours', 'Bangkok', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Bangkok Happy Hour Guide: Happy Hours, Ladies’ Nights & Deals',
    seoDescription:
      'Bangkok happy hour guide: happy hours, ladies’ nights and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'singapore-happy-hours',
    destination: 'singapore',
    title: 'Happy Hour Singapore',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, ladies’ nights and food deals across Singapore, sorted by day and time.',
    description: [
      'Happy hours, ladies’ nights and food deals across Singapore, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, have free extras, are unlimited or run at set times. Covers areas including Tanjong Pagar, Clarke Quay, Orchard and Marina Bay.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and ladies’ nights', 'Maps and venue links'],
    features: hhFeatures('happy hours, ladies’ nights and food deals', { free: true, arabic: false }),
    screenshots: dealShots('singapore-happy-hours', 'Singapore', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Singapore Happy Hour Guide: Happy Hours, Ladies’ Nights & Deals',
    seoDescription:
      'Singapore happy hour guide: happy hours, ladies’ nights and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'hong-kong-happy-hours',
    destination: 'hong-kong',
    title: 'Happy Hour Hong Kong',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, ladies’ nights and food deals across Hong Kong, sorted by day and time.',
    description: [
      'Happy hours, ladies’ nights and food deals across Hong Kong, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, have free extras, are unlimited or run at set times. Covers areas including Central, Lan Kwai Fong, Wan Chai and Causeway Bay.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and ladies’ nights', 'Maps and venue links'],
    features: hhFeatures('happy hours, ladies’ nights and food deals', { free: true, arabic: false }),
    screenshots: dealShots('hong-kong-happy-hours', 'Hong Kong', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Hong Kong Happy Hour Guide: Happy Hours, Ladies’ Nights & Deals',
    seoDescription:
      'Hong Kong happy hour guide: happy hours, ladies’ nights and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'new-york-happy-hours',
    destination: 'new-york',
    title: 'Happy Hour New York',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, bottomless deals and food deals across New York, sorted by day and time.',
    description: [
      'Happy hours, bottomless deals and food deals across New York, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, are unlimited or run at set times. Covers areas including the Lower East Side, the East Village, Midtown and Williamsburg.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and bottomless deals', 'Maps and venue links'],
    features: hhFeatures('happy hours, bottomless deals and food deals', { free: false, arabic: false }),
    screenshots: dealShots('new-york-happy-hours', 'New York', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'New York Happy Hour Guide: Happy Hours, Bottomless & Food Deals',
    seoDescription:
      'New York happy hour guide: happy hours, bottomless deals and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'edinburgh-happy-hours',
    destination: 'edinburgh',
    title: 'Happy Hour Edinburgh',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, bottomless deals and food deals across Edinburgh, sorted by day and time.',
    description: [
      'Happy hours, bottomless deals and food deals across Edinburgh, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, are unlimited or run at set times. Covers areas including George Street, Lothian Road, the West End and the Old Town.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and bottomless deals', 'Maps and venue links'],
    features: hhFeatures('happy hours, bottomless deals and food deals', { free: false, arabic: false }),
    screenshots: dealShots('edinburgh-happy-hours', 'Edinburgh', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Edinburgh Happy Hour Guide: Happy Hours, Bottomless & Food Deals',
    seoDescription:
      'Edinburgh happy hour guide: happy hours, bottomless deals and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'muscat-happy-hours',
    destination: 'muscat',
    title: 'Happy Hour Muscat',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, ladies’ nights and food deals across Muscat, sorted by day and time.',
    description: [
      'Happy hours, ladies’ nights and food deals across Muscat, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, have free extras, are unlimited or run at set times. Covers areas including Shatti Al Qurum, Al Mouj, Qurum and Barr Al Jissah.',
      'Drinks offers are at licensed venues such as hotels. Please drink responsibly and follow local laws.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and ladies’ nights', 'English and Arabic'],
    features: hhFeatures('happy hours, ladies’ nights and food deals', { free: true, arabic: true }),
    screenshots: dealShots('muscat-happy-hours', 'Muscat', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-16',
    seoTitle: 'Muscat Happy Hour Guide: Happy Hours, Ladies’ Nights & Deals',
    seoDescription:
      'Muscat happy hour guide: happy hours, ladies’ nights and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'bahrain-happy-hours',
    destination: 'bahrain',
    title: 'Happy Hour Bahrain',
    category: 'happy-hours',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Happy hours, ladies’ nights and food deals across Bahrain, sorted by day and time.',
    description: [
      'Happy hours, ladies’ nights and food deals across Bahrain, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, have free extras, are unlimited or run at set times. Covers areas including Juffair, Manama, Adliya and Seef.',
      'Drinks offers are at licensed venues such as hotels. Please drink responsibly and follow local laws.',
    ],
    highlights: ['Sorted by day and time', 'Happy hours and ladies’ nights', 'English and Arabic'],
    features: hhFeatures('happy hours, ladies’ nights and food deals', { free: true, arabic: true }),
    screenshots: dealShots('bahrain-happy-hours', 'Bahrain', 'happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-16',
    seoTitle: 'Bahrain Happy Hour Guide: Happy Hours, Ladies’ Nights & Deals',
    seoDescription:
      'Bahrain happy hour guide: happy hours, ladies’ nights and food deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'paris-brunch-happy-hours',
    destination: 'paris',
    title: 'Brunch & Happy Hour Paris',
    category: 'happy-hours',
    alsoIn: ['brunch'],
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Weekend brunches, happy hours and bottomless deals across Paris, sorted by day and time.',
    description: [
      'Weekend brunches, happy hours and bottomless deals across Paris, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, are unlimited or run at set times. Covers areas including the 1er, 6e, 8e and 15e arrondissements and Oberkampf.',
    ],
    highlights: ['Brunches and happy hours', 'Sorted by day and time', 'Maps and venue links'],
    features: hhFeatures('weekend brunches, happy hours and bottomless deals', { free: false }),
    screenshots: dealShots('paris-brunch-happy-hours', 'Paris', 'brunch & happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Paris Brunch & Happy Hour Guide: Weekend Brunches & Deals',
    seoDescription:
      'Paris brunch and happy hour guide: weekend brunches, happy hours and bottomless deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'rome-brunch-happy-hours',
    destination: 'rome',
    title: 'Brunch & Happy Hour Rome',
    category: 'happy-hours',
    alsoIn: ['brunch'],
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Weekend brunches, aperitivo and brunch deals across Rome, sorted by day and time.',
    description: [
      'Weekend brunches, aperitivo and brunch deals across Rome, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, are unlimited or run at set times. Covers areas including Piazza del Popolo, Piazza di Spagna and the Colosseum.',
    ],
    highlights: ['Brunches and aperitivo', 'Sorted by day and time', 'Maps and venue links'],
    features: hhFeatures('weekend brunches, aperitivo and brunch deals', { free: false }),
    screenshots: dealShots('rome-brunch-happy-hours', 'Rome', 'brunch & happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Rome Brunch & Aperitivo Guide: Weekend Brunches & Aperitivo Deals',
    seoDescription:
      'Rome brunch and happy hour guide: weekend brunches, aperitivo and brunch deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'milan-brunch-happy-hours',
    destination: 'milan',
    title: 'Brunch & Happy Hour Milan',
    category: 'happy-hours',
    alsoIn: ['brunch'],
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Weekend brunches, aperitivo and brunch deals across Milan, sorted by day and time.',
    description: [
      'Weekend brunches, aperitivo and brunch deals across Milan, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, are unlimited or run at set times. Covers areas including the Duomo, Brera, the Navigli and Centrale.',
    ],
    highlights: ['Brunches and aperitivo', 'Sorted by day and time', 'Maps and venue links'],
    features: hhFeatures('weekend brunches, aperitivo and brunch deals', { free: false }),
    screenshots: dealShots('milan-brunch-happy-hours', 'Milan', 'brunch & happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Milan Brunch & Aperitivo Guide: Weekend Brunches & Aperitivo Deals',
    seoDescription:
      'Milan brunch and happy hour guide: weekend brunches, aperitivo and brunch deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'munich-brunch-happy-hours',
    destination: 'munich',
    title: 'Brunch & Happy Hour Munich',
    category: 'happy-hours',
    alsoIn: ['brunch'],
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Weekend brunches, happy hours and bottomless deals across Munich, sorted by day and time.',
    description: [
      'Weekend brunches, happy hours and bottomless deals across Munich, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, are unlimited or run at set times. Covers areas including Schwabing, Glockenbach and Maximilianstraße.',
    ],
    highlights: ['Brunches and happy hours', 'Sorted by day and time', 'Maps and venue links'],
    features: hhFeatures('weekend brunches, happy hours and bottomless deals', { free: false }),
    screenshots: dealShots('munich-brunch-happy-hours', 'Munich', 'brunch & happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Munich Brunch & Happy Hour Guide: Weekend Brunches & Deals',
    seoDescription:
      'Munich brunch and happy hour guide: weekend brunches, happy hours and bottomless deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'sydney-brunch-happy-hours',
    destination: 'sydney',
    title: 'Brunch & Happy Hour Sydney',
    category: 'happy-hours',
    alsoIn: ['brunch'],
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Weekend brunches, happy hours and bottomless deals across Sydney, sorted by day and time.',
    description: [
      'Weekend brunches, happy hours and bottomless deals across Sydney, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, are unlimited or run at set times. Covers areas including the CBD, The Rocks, Surry Hills and Bondi.',
    ],
    highlights: ['Brunches and happy hours', 'Sorted by day and time', 'Maps and venue links'],
    features: hhFeatures('weekend brunches, happy hours and bottomless deals', { free: false }),
    screenshots: dealShots('sydney-brunch-happy-hours', 'Sydney', 'brunch & happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Sydney Brunch & Happy Hour Guide: Weekend Brunches & Deals',
    seoDescription:
      'Sydney brunch and happy hour guide: weekend brunches, happy hours and bottomless deals sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'hanoi-brunch-happy-hours',
    destination: 'hanoi',
    title: 'Brunch & Happy Hour Hanoi',
    category: 'happy-hours',
    alsoIn: ['brunch'],
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Weekend brunches, happy hours and ladies’ nights across Hanoi, sorted by day and time.',
    description: [
      'Weekend brunches, happy hours and ladies’ nights across Hanoi, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, have free extras, are unlimited or run at set times. Covers areas including Hoan Kiem, the Old Quarter and Ba Dinh.',
    ],
    highlights: ['Brunches and happy hours', 'Sorted by day and time', 'Maps and venue links'],
    features: hhFeatures('weekend brunches, happy hours and ladies’ nights', { free: true }),
    screenshots: dealShots('hanoi-brunch-happy-hours', 'Hanoi', 'brunch & happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Hanoi Brunch & Happy Hour Guide: Weekend Brunches & Deals',
    seoDescription:
      'Hanoi brunch and happy hour guide: weekend brunches, happy hours and ladies’ nights sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'ho-chi-minh-city-brunch-happy-hours',
    destination: 'ho-chi-minh-city',
    title: 'Brunch & Happy Hour Ho Chi Minh City',
    category: 'happy-hours',
    alsoIn: ['brunch'],
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Weekend brunches, happy hours and ladies’ nights across Ho Chi Minh City, sorted by day and time.',
    description: [
      'Weekend brunches, happy hours and ladies’ nights across Ho Chi Minh City, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, have free extras, are unlimited or run at set times. Covers areas including District 1 and District 3.',
    ],
    highlights: ['Brunches and happy hours', 'Sorted by day and time', 'Maps and venue links'],
    features: hhFeatures('weekend brunches, happy hours and ladies’ nights', { free: true }),
    screenshots: dealShots('ho-chi-minh-city-brunch-happy-hours', 'Ho Chi Minh City', 'brunch & happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Ho Chi Minh City Brunch & Happy Hour Guide: Weekend Brunches & Deals',
    seoDescription:
      'Ho Chi Minh City brunch and happy hour guide: weekend brunches, happy hours and ladies’ nights sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'pattaya-brunch-happy-hours',
    destination: 'pattaya',
    title: 'Brunch & Happy Hour Pattaya',
    category: 'happy-hours',
    alsoIn: ['brunch'],
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Weekend brunches, happy hours and ladies’ nights across Pattaya, sorted by day and time.',
    description: [
      'Weekend brunches, happy hours and ladies’ nights across Pattaya, sorted by day and time, with prices and links to each offer’s source.',
      'Pick a day, see the week at a glance and filter for offers that are on now, have free extras, are unlimited or run at set times. Covers areas including North Pattaya and Pattaya Beach.',
    ],
    highlights: ['Brunches and happy hours', 'Sorted by day and time', 'Maps and venue links'],
    features: hhFeatures('weekend brunches, happy hours and ladies’ nights', { free: true }),
    screenshots: dealShots('pattaya-brunch-happy-hours', 'Pattaya', 'brunch & happy hour guide'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11-17',
    seoTitle: 'Pattaya Brunch & Happy Hour Guide: Weekend Brunches & Deals',
    seoDescription:
      'Pattaya brunch and happy hour guide: weekend brunches, happy hours and ladies’ nights sorted by day and time, with prices, maps and venue links.',
  },
  {
    id: 'edinburgh-brunch',
    destination: 'edinburgh',
    title: 'Destination : Brunch — Edinburgh',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Saturday and Sunday brunches across the New Town, Old Town and Leith.',
    description: [
      'Find your Saturday or Sunday brunch in Edinburgh, across the New Town, the Old Town and Leith.',
      'Each listing shows prices, packages, timings, the vibe and a link to the venue or menu.',
    ],
    highlights: ['Prices, packages and times', 'Search by cuisine, area or vibe', 'Maps and venue links'],
    features: [...BRUNCH_CORE, DRINKS],
    screenshots: shots('edinburgh-brunch', 'Edinburgh'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'Edinburgh Brunch Guide 2026: Saturday & Sunday Brunches',
    seoDescription:
      'Edinburgh brunch guide with weekend brunches in the New Town, Old Town and Leith: prices, packages, times, maps and venue links.',
    faqs: brunchFaq('Edinburgh', 'Saturday and Sunday'),
  },
  {
    id: 'muscat-brunch',
    destination: 'muscat',
    title: 'Destination : Brunch — Muscat',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Friday and Saturday brunches across Qurum, Shatti and Al Mouj.',
    description: [
      'Find your Friday or Saturday brunch in Muscat, from hotel brunches in Qurum and Shatti to Al Mouj and the coast.',
      'Each listing shows prices, packages, timings, the vibe and a link to the venue or menu.',
    ],
    highlights: ['Prices, packages and times', 'Pool, beach and views filters', 'English and Arabic'],
    features: [...BRUNCH_CORE, DRINKS, ARABIC],
    screenshots: shots('muscat-brunch', 'Muscat'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'Muscat Brunch Guide 2026: Friday & Saturday Brunches',
    seoDescription:
      'Muscat brunch guide with Friday and Saturday brunches in Qurum, Shatti and Al Mouj: prices, packages, times, maps and links.',
    faqs: brunchFaq('Muscat', 'Friday and Saturday'),
  },
  {
    id: 'bahrain-brunch',
    destination: 'bahrain',
    title: 'Destination : Brunch — Bahrain',
    category: 'brunch',
    status: 'coming-soon',
    gumroadURL: '',
    shortDescription: 'Friday and Saturday brunches across Manama, Seef, Bahrain Bay and the beach resorts.',
    description: [
      'Find your Friday or Saturday brunch in Bahrain, from Seef and Manama to Bahrain Bay, Juffair and the beach resorts.',
      'Each listing shows prices, packages, timings, the vibe and a link to the venue or menu.',
    ],
    highlights: ['Prices, packages and times', 'Pool, beach and views filters', 'English and Arabic'],
    features: [...BRUNCH_CORE, DRINKS, ARABIC],
    screenshots: shots('bahrain-brunch', 'Bahrain'),
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '2026-11',
    seoTitle: 'Bahrain Brunch Guide 2026: Friday & Saturday Brunches',
    seoDescription:
      'Bahrain brunch guide with Friday and Saturday brunches in Manama, Seef and Bahrain Bay: prices, packages, times, maps and links.',
    faqs: brunchFaq('Bahrain', 'Friday and Saturday'),
  },
];
