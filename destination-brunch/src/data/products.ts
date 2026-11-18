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

  /* ---- Example of a future product (draft: not shown on the live site) ----
     Copy this block when you build a new happy hour app. Fill in real
     features, add screenshots, then change status when it's ready. */
  {
    id: 'dubai-happy-hours',
    destination: 'dubai',
    title: 'Dubai Happy Hours',
    category: 'happy-hours',
    status: 'draft',
    gumroadURL: '',
    shortDescription: 'Happy hours and drinks offers across Dubai, sorted by day and time.',
    description: ['Draft example. Replace this text with a description of the finished app.'],
    highlights: ['Sorted by day and time', 'Example benefit two', 'Example benefit three'],
    features: [],
    screenshots: [],
    compatibility: WEB_APP_COMPAT,
    lastUpdated: '',
    seoTitle: 'Dubai Happy Hours Guide',
    seoDescription: 'Dubai happy hours guide (draft).',
  },
];
