/* =====================================================================
   DESTINATIONS (cities)
   ---------------------------------------------------------------------
   One entry per city. Products (the guides you sell) live in
   products.ts and point at a city using its `slug`.

   TO ADD A CITY: copy one whole { ... } block below, paste it at the
   end of the list, and change every value. See README.md, step 1.

   status:
     'published'   -> city page is live and listed
     'coming-soon' -> city page is live and labelled "Coming soon"
     'draft'       -> only visible on your own computer (npm run dev)
     'hidden'      -> never shown anywhere
   A city only appears on the site if it also has at least one product
   that is published or coming soon.

   image: put two files in public/images/destinations/
     <slug>-1600.webp (1600px wide) and <slug>-800.webp (800px wide)
   then fill in the photo credit. Use only photos you are allowed to use
   commercially (your own, CC0, CC BY with credit, or licensed stock).
   Set image: null to use a coloured cover until you have a photo.
   ===================================================================== */

export type Status = 'published' | 'coming-soon' | 'draft' | 'hidden';
export type Region = 'Middle East' | 'Europe' | 'Asia' | 'North America';

export interface PhotoCredit {
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}

export interface Destination {
  slug: string;
  city: string;
  country: string;
  region: Region;
  status: Status;
  /** Show on the homepage "Featured destinations" row. */
  featured: boolean;
  /** Short line shown on the city card and hero. */
  tagline: string;
  /** Neighbourhoods the guides cover, as shown in the apps. */
  areas: string[];
  /** Which days brunch happens in this city. */
  brunchDays: string;
  /** 1-3 short paragraphs for the city page. */
  intro: string[];
  /** true where venues do not serve alcohol (no drinks offers advertised). */
  alcoholFree?: boolean;
  /** Arabic version available in the apps for this city. */
  arabic?: boolean;
  image: { alt: string; credit: PhotoCredit } | null;
  /** City colours, taken from each city app's own design. */
  theme: { primary: string; deep: string; accent: string; onAccent: string };
  seoTitle: string;
  seoDescription: string;
  /** Extra city-specific questions shown on the city page. */
  faqs?: { q: string; a: string }[];
}

export const DESTINATIONS: Destination[] = [
  {
    slug: 'dubai',
    city: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    status: 'published',
    featured: true,
    tagline: 'Friday and Saturday brunches from the Palm to DIFC.',
    areas: ['Palm Jumeirah', 'Dubai Marina', 'JBR', 'DIFC', 'Downtown'],
    brunchDays: 'Friday and Saturday',
    intro: [
      'Weekend brunch is a fixture of Dubai life, from beach-club buffets on the Palm to big-name restaurant brunches in DIFC and Downtown.',
      'The Dubai brunch guide puts Friday and Saturday brunches in one place, with soft-drink and drinks-package prices, timings, the vibe and a link to the venue or menu, so you can compare options before you book.',
    ],
    arabic: true,
    image: {
      alt: 'Dubai skyline at dusk with the Burj Khalifa',
      credit: {
        title: 'Burj Khalifa and the Dubai skyline',
        author: 'imran shahabuddin',
        license: 'CC BY 2.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Burj_Khalifa_(worlds_tallest_building)_and_the_Dubai_skyline_(25781049892).jpg',
      },
    },
    theme: { primary: '#1d1d20', deep: '#0d0d0f', accent: '#cf3a42', onAccent: '#ffffff' },
    seoTitle: 'Dubai Brunch Guide: Friday & Saturday Brunches',
    seoDescription:
      'Dubai brunch guide covering Friday and Saturday brunches across the Palm, Dubai Marina, DIFC and Downtown, with prices, packages, times and venue links.',
  },
  {
    slug: 'abu-dhabi',
    city: 'Abu Dhabi',
    country: 'UAE',
    region: 'Middle East',
    status: 'published',
    featured: true,
    tagline: 'Weekend brunches on Saadiyat, Yas and the Corniche.',
    areas: ['Saadiyat Island', 'Yas Island', 'Al Maryah Island', 'The Corniche'],
    brunchDays: 'Friday and Saturday',
    intro: [
      "Abu Dhabi's brunch scene stretches from beachfront resorts on Saadiyat to hotel restaurants on Yas Island and Al Maryah Island.",
      'The Abu Dhabi brunch guide lists Friday and Saturday brunches with prices, packages, timings and venue links, plus filters for pool and beach brunches, views and deals.',
    ],
    arabic: true,
    image: {
      alt: 'Abu Dhabi skyline across the water',
      credit: {
        title: 'Skyline Abu Dhabi I',
        author: 'Madlen Steiner',
        license: 'CC BY 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Skyline_Abu_Dhabi_I_(260477643).jpeg',
      },
    },
    theme: { primary: '#0b4f34', deep: '#05301f', accent: '#d8544b', onAccent: '#ffffff' },
    seoTitle: 'Abu Dhabi Brunch Guide: Friday & Saturday Brunches',
    seoDescription:
      'Abu Dhabi brunch guide covering Saadiyat, Yas Island, Al Maryah Island and the Corniche, with brunch prices, packages, times and venue links.',
  },
  {
    slug: 'riyadh',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    region: 'Middle East',
    status: 'published',
    featured: true,
    tagline: 'Weekend brunches plus business lunches and food deals.',
    areas: ['Olaya', 'Al Hada', 'KAFD', 'North Riyadh'],
    brunchDays: 'Friday and Saturday',
    intro: [
      "Riyadh's restaurant scene has grown fast, with hotel brunches, set business lunches and weekly food offers across Olaya, Al Hada, KAFD and North Riyadh.",
      'There are two Riyadh guides: a brunch guide for Friday and Saturday, and a Daily Deals guide for business lunches, ladies’ offers and food deals, sorted by day and time. Venues in Saudi Arabia do not serve alcohol, so neither guide includes drinks offers.',
    ],
    alcoholFree: true,
    arabic: true,
    image: {
      alt: 'Riyadh city skyline at night',
      credit: {
        title: 'Night view of City Riyadh',
        author: 'Jack Soma',
        license: 'CC BY 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Night_view_of_City_Riyadh_from_Hauptstadt_Saudi_Arabiens_-_panoramio.jpg',
      },
    },
    theme: { primary: '#0a5634', deep: '#043520', accent: '#e6e1d3', onAccent: '#043520' },
    seoTitle: 'Riyadh Brunch & Restaurant Deals Guides',
    seoDescription:
      'Riyadh brunch guide and Riyadh restaurant deals guide: weekend brunches, business lunches, ladies’ offers and food deals across Olaya, Al Hada and KAFD.',
  },
  {
    slug: 'doha',
    city: 'Doha',
    country: 'Qatar',
    region: 'Middle East',
    status: 'coming-soon',
    featured: false,
    tagline: 'Friday and Saturday brunches in Qatar’s capital.',
    areas: [],
    brunchDays: 'Friday and Saturday',
    intro: [
      'A Doha weekend brunch guide is in preparation. When it launches it will follow the same format as our other city brunch guides.',
      'Check back soon, or browse the guides that are already listed for Dubai, Abu Dhabi and Riyadh.',
    ],
    // No licensed photo yet: a coloured cover is shown instead.
    image: null,
    theme: { primary: '#8a1538', deep: '#4f0b1f', accent: '#e9dfe2', onAccent: '#4f0b1f' },
    seoTitle: 'Doha Weekend Brunch Guide (Coming Soon)',
    seoDescription: 'A Doha weekend brunch guide from Destination : Brunch is coming soon.',
  },
  {
    slug: 'london',
    city: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    status: 'published',
    featured: true,
    tagline: 'Saturday and Sunday brunches from Soho to the City.',
    areas: ['Soho', 'The City', 'Mayfair', 'London Bridge'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      "London's weekend brunches range from bottomless sessions in Soho to sky-high brunches in the City and long Sunday roasts.",
      'The London brunch guide lists Saturday and Sunday brunches with prices, packages, times and venue links, with filters for views, drinks packages, deals and more.',
    ],
    image: {
      alt: 'London skyline over the River Thames',
      credit: {
        title: 'London (Flickr)',
        author: 'Pierre Blaché',
        license: 'CC0',
        licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:London_-_Flickr_-_Pierre_Blach%C3%A9_(1).jpg',
      },
    },
    theme: { primary: '#14213d', deep: '#0a1328', accent: '#d22b3c', onAccent: '#ffffff' },
    seoTitle: 'London Brunch Guide: Saturday & Sunday Brunches',
    seoDescription:
      'London brunch guide covering Saturday and Sunday brunches in Soho, the City, Mayfair and London Bridge, with prices, packages, times and venue links.',
  },
  {
    slug: 'manchester',
    city: 'Manchester',
    country: 'United Kingdom',
    region: 'Europe',
    status: 'published',
    featured: true,
    tagline: 'Bottomless and weekend brunches across the city centre.',
    areas: ['Northern Quarter', 'Ancoats', 'Spinningfields', 'Deansgate'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      'From the Northern Quarter and Ancoats to Spinningfields and Deansgate, Manchester has a lively weekend brunch scene, including plenty of bottomless brunches.',
      'The Manchester brunch guide lists Saturday and Sunday brunches with prices, packages, times and venue links, so you can compare and plan before you book.',
    ],
    image: {
      alt: 'Castlefield canal area in Manchester',
      credit: {
        title: 'Castlefield area of Manchester looking north, across the Bridgewater Canal',
        author: 'Ridiculopathy',
        license: 'CC0',
        licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Castlefield_area_of_Manchester_looking_north,_across_the_Bridgewater_Canal.jpg',
      },
    },
    theme: { primary: '#a3172b', deep: '#5e0b18', accent: '#e7e8ef', onAccent: '#1d2b53' },
    seoTitle: 'Manchester Bottomless Brunch Guide: Weekend Brunches',
    seoDescription:
      'Manchester brunch guide covering bottomless and weekend brunches in the Northern Quarter, Ancoats, Spinningfields and Deansgate, with prices and times.',
  },
  {
    slug: 'brighton',
    city: 'Brighton',
    country: 'United Kingdom',
    region: 'Europe',
    status: 'published',
    featured: true,
    tagline: 'Weekend brunches from The Lanes and Hove along the coast to Worthing.',
    areas: ['The Lanes', 'North Laine', 'Kemptown', 'Hove', 'Shoreham-by-Sea', 'Lancing', 'Worthing'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      'Brighton does weekend brunch in every style, from bottomless brunches in The Lanes and on West Street to award-winning cafés along Church Road in Hove.',
      'The Brighton guide follows the coast west too, with beach-café brunches in Lancing and bottomless brunches in Worthing, plus our picks of the best pubs, bars and restaurants from Brighton to Shoreham-by-Sea and Worthing.',
    ],
    image: {
      alt: 'Brighton Palace Pier at golden hour',
      credit: {
        title: 'Brighton Palace Pier at the golden hour',
        author: 'August Schwerdfeger',
        license: 'CC BY 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Brighton_Palace_Pier_at_the_golden_hour_2019-05-28_-_1.jpg',
      },
    },
    theme: { primary: '#1d4f8f', deep: '#0f2f59', accent: '#e0303f', onAccent: '#ffffff' },
    seoTitle: 'Brighton & Hove Brunch Guide: Weekend Brunches to Worthing',
    seoDescription:
      'Brighton and Hove brunch guide, from The Lanes and Church Road along the coast to Lancing and Worthing, with bottomless brunch prices, times and links.',
    faqs: [
      {
        q: 'Does the Brighton guide cover Hove and Worthing?',
        a: 'Yes. Alongside central Brighton it lists brunches in Hove, Lancing and Worthing, and its pubs, bars and restaurants section also covers Shoreham-by-Sea.',
      },
    ],
  },
  {
    slug: 'barcelona',
    city: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches from the Gothic Quarter to Eixample.',
    areas: ['Gothic Quarter', 'Born', 'Eixample', 'Sant Antoni', 'Gràcia'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      "Barcelona's brunch spots sit in the lanes of the Gothic Quarter and Born and along the grid of Eixample and Sant Antoni.",
      'The Barcelona brunch guide lists Saturday and Sunday brunches with prices, times, the vibe and venue links.',
    ],
    image: {
      alt: 'Barcelona skyline seen from above',
      credit: {
        title: 'Barcelona Skyline (panoramio)',
        author: 'Daniel Phillips',
        license: 'CC BY 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Barcelona_Skyline_-_panoramio.jpg',
      },
    },
    theme: { primary: '#a50f1b', deep: '#6a0911', accent: '#f1bf00', onAccent: '#3a0609' },
    seoTitle: 'Barcelona Brunch Guide: Saturday & Sunday Brunches',
    seoDescription:
      'Barcelona brunch guide covering the Gothic Quarter, Born, Eixample and Sant Antoni, with weekend brunch prices, times and venue links.',
  },
  {
    slug: 'bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    region: 'Asia',
    status: 'published',
    featured: true,
    tagline: 'Hotel and rooftop brunches on Sukhumvit, Silom and Sathorn.',
    areas: ['Sukhumvit', 'Silom', 'Sathorn', 'Siam'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      "Bangkok is known for its weekend hotel brunches, from riverside spreads to rooftop venues along Sukhumvit, Silom, Sathorn and Siam.",
      'The Bangkok brunch guide lists Saturday and Sunday brunches with prices, packages, times and venue links, with filters for views, pools, drinks packages and deals.',
    ],
    image: {
      alt: 'Bangkok skyline at twilight',
      credit: {
        title: 'Twilight over the modern city skyline in Ratchadamri district, Bangkok',
        author: 'Sergei Gussev',
        license: 'CC BY 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Twilight_over_the_modern_city_skyline_in_Ratchadamri_district,_Bangkok,_Thailand,_July_2019_-_Flickr_-_sergei.gussev.jpg',
      },
    },
    theme: { primary: '#a51931', deep: '#5f0d1b', accent: '#3d4fa8', onAccent: '#ffffff' },
    seoTitle: 'Bangkok Brunch Guide: Weekend Hotel & Rooftop Brunches',
    seoDescription:
      'Bangkok brunch guide covering Sukhumvit, Silom, Sathorn and Siam, with weekend brunch prices, packages, times and venue links.',
  },
  {
    slug: 'singapore',
    city: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    status: 'published',
    featured: true,
    tagline: 'Weekend brunches around Marina Bay, Orchard and Sentosa.',
    areas: ['Marina Bay', 'Orchard', 'Sentosa'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      "Singapore's weekend brunches run from champagne brunches at Marina Bay hotels to relaxed spots on Orchard Road and Sentosa.",
      'The Singapore brunch guide lists Saturday and Sunday brunches with prices, packages, times and venue links, so you can compare dining options across the island.',
    ],
    image: {
      alt: 'Singapore city skyline at Marina Bay',
      credit: {
        title: 'Singapore city skyline',
        author: 'Zexsen Xie',
        license: 'CC BY 2.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Singapore_city_skyline_(Zexsen).jpg',
      },
    },
    theme: { primary: '#b5152b', deep: '#6e0d1c', accent: '#efe6e7', onAccent: '#6e0d1c' },
    seoTitle: 'Singapore Brunch Guide: Weekend Brunches & Dining',
    seoDescription:
      'Singapore brunch guide covering Marina Bay, Orchard and Sentosa, with weekend brunch prices, packages, times and venue links.',
  },
  {
    slug: 'hong-kong',
    city: 'Hong Kong',
    country: 'Hong Kong',
    region: 'Asia',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches in Central, Tsim Sha Tsui and beyond.',
    areas: ['Central', 'Tsim Sha Tsui', 'Admiralty', 'Wan Chai', 'Discovery Bay'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      "Hong Kong's weekend brunches range from harbour-view hotel spreads in Central and Tsim Sha Tsui to laid-back spots in Discovery Bay.",
      'The Hong Kong brunch guide lists Saturday and Sunday brunches with prices, packages, times and venue links.',
    ],
    image: {
      alt: 'Hong Kong skyline across Victoria Harbour',
      credit: {
        title: 'Hong Kong Skyline Restitch, Dec 2007',
        author: 'Diliff',
        license: 'CC BY 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hong_Kong_Skyline_Restitch_-_Dec_2007.jpg',
      },
    },
    theme: { primary: '#ba1f24', deep: '#6c0f13', accent: '#f4e3e1', onAccent: '#6c0f13' },
    seoTitle: 'Hong Kong Brunch Guide: Weekend Brunches',
    seoDescription:
      'Hong Kong brunch guide covering Central, Tsim Sha Tsui, Admiralty and Discovery Bay, with weekend brunch prices, packages, times and venue links.',
  },
  {
    slug: 'new-york',
    city: 'New York',
    country: 'USA',
    region: 'North America',
    status: 'published',
    featured: true,
    tagline: 'Saturday and Sunday brunches in Manhattan, Brooklyn and Queens.',
    areas: ['Manhattan', 'Brooklyn', 'Queens'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      'Weekend brunch is a New York institution, from classic Manhattan spots to Brooklyn favourites and neighbourhood places in Queens.',
      'The New York brunch guide lists Saturday and Sunday brunches with prices, times, the vibe and venue links, with filters for drinks, views and deals.',
    ],
    image: {
      alt: 'Brooklyn Bridge and the Manhattan skyline',
      credit: {
        title: 'Brooklyn Bridge, view from Brooklyn Bridge Park, New York City',
        author: 'Jakub Hałun',
        license: 'CC BY 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Brooklyn_Bridge,_view_from_Brooklyn_Bridge_Park,_New_York_City,_20231002_0909_1574.jpg',
      },
    },
    theme: { primary: '#0b3a7e', deep: '#05234f', accent: '#ff6319', onAccent: '#ffffff' },
    seoTitle: 'New York Brunch Guide: Saturday & Sunday Brunches',
    seoDescription:
      'New York brunch guide covering Manhattan, Brooklyn and Queens, with weekend brunch prices, times and venue links.',
  },
];
