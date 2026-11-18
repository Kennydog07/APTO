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
export type Region = 'Middle East' | 'Europe' | 'Asia' | 'North America' | 'Oceania';

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
    status: 'published',
    featured: false,
    tagline: 'Happy hours and ladies\u2019 nights in West Bay and Lusail, with a brunch guide coming soon.',
    areas: ['West Bay', 'Lusail', 'Msheireb', 'The Pearl'],
    brunchDays: 'Friday and Saturday',
    intro: [
      'Doha\u2019s happy hours and ladies\u2019 nights are found in licensed hotel bars and restaurants, especially in West Bay, Lusail, Msheireb and The Pearl.',
      'The Doha happy hour guide lists happy hours, ladies\u2019 nights and food deals, sorted by day and time. A Doha weekend brunch guide is in preparation.',
    ],
    arabic: true,
    image: {
      alt: 'West Bay skyline, Doha',
      credit: {
        title: 'Doha - West Bay Skyline 03',
        author: 'P. Hughes',
        license: 'CC BY 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File%3ADoha_-_West_Bay_Skyline_03.jpg',
      },
    },
    theme: { primary: '#8a1538', deep: '#4f0b1f', accent: '#e9dfe2', onAccent: '#4f0b1f' },
    seoTitle: 'Doha Happy Hours & Ladies\u2019 Nights Guide',
    seoDescription:
      'Doha happy hour guide: happy hours, ladies\u2019 nights and food deals in West Bay, Lusail and The Pearl, sorted by day and time. Brunch guide coming soon.',
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
  {
    slug: 'edinburgh',
    city: 'Edinburgh',
    country: 'United Kingdom',
    region: 'Europe',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches and happy hours from the New Town to the Old Town.',
    areas: ['New Town', 'Old Town', 'Leith', 'West End', 'George Street', 'Lothian Road'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      'Scotland’s capital has a lively weekend brunch scene across the elegant New Town and the historic Old Town, and plenty of early-evening offers along George Street and Lothian Road.',
      'There are two Edinburgh guides: a Saturday and Sunday brunch guide, and a happy hour guide with happy hours, bottomless deals and food deals sorted by day and time.',
    ],
    image: {
      alt: 'Edinburgh skyline from Calton Hill',
      credit: {
        title: 'Edinburgh Calton Hill',
        author: 'Saffron Blaze',
        license: 'CC BY 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Edinburgh_Calton_Hill.jpg',
      },
    },
    theme: { primary: '#0b3d7a', deep: '#06244a', accent: '#e6ebf2', onAccent: '#06244a' },
    seoTitle: 'Edinburgh Brunch & Happy Hour Guides',
    seoDescription:
      'Edinburgh brunch and happy hour guides: weekend brunches in the New Town, Old Town and Leith, plus happy hours and deals sorted by day and time.',
  },
  {
    slug: 'muscat',
    city: 'Muscat',
    country: 'Oman',
    region: 'Middle East',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches and happy hours from Qurum to Al Mouj.',
    areas: ['Qurum', 'Shatti Al Qurum', 'Al Mouj', 'Madinat Al Irfan', 'Barr Al Jissah'],
    brunchDays: 'Friday and Saturday',
    intro: [
      'Muscat’s brunches and happy hours are mostly found in its hotels and resorts, from Qurum and Shatti Al Qurum to Al Mouj and the coast at Barr Al Jissah.',
      'There are two Muscat guides: a Friday and Saturday brunch guide, and a happy hour guide with happy hours, ladies’ nights and food deals sorted by day and time. Alcohol is only served at licensed venues such as hotels.',
    ],
    arabic: true,
    image: {
      alt: 'Fishing boats at night in Mutrah, Muscat',
      credit: {
        title: 'Fishing at night time, Mutrah, Muscat',
        author: 'Omar AV',
        license: 'CC BY 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Fishing_at_night_time,_Mutrah,_Muscat_-_panoramio.jpg',
      },
    },
    theme: { primary: '#8a1a1c', deep: '#4f0d0f', accent: '#3c9a5b', onAccent: '#ffffff' },
    seoTitle: 'Muscat Brunch & Happy Hour Guides',
    seoDescription:
      'Muscat brunch and happy hour guides: Friday and Saturday brunches plus happy hours and ladies’ nights in Qurum, Shatti and Al Mouj.',
  },
  {
    slug: 'bahrain',
    city: 'Bahrain',
    country: 'Bahrain',
    region: 'Middle East',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches and happy hours across Manama, Seef and Juffair.',
    areas: ['Manama', 'Seef', 'Juffair', 'Adliya', 'Bahrain Bay', 'Amwaj'],
    brunchDays: 'Friday and Saturday',
    intro: [
      'Bahrain is known across the Gulf for its Friday brunches, with hotel and beach-resort brunches from Seef and Bahrain Bay to Amwaj.',
      'There are two Bahrain guides: a Friday and Saturday brunch guide, and a happy hour guide with happy hours, ladies’ nights and food deals in Juffair, Adliya, Manama and beyond, sorted by day and time.',
    ],
    arabic: true,
    image: {
      alt: 'Bahrain Bay skyline',
      credit: {
        title: 'Bahrain Bay 01',
        author: 'Gabby Canonizado from Dubai, United Arab Emirates',
        license: 'CC BY 2.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bahrain_Bay_01_(44195199982).jpg',
      },
    },
    theme: { primary: '#8e0e20', deep: '#560812', accent: '#e8e2dc', onAccent: '#560812' },
    seoTitle: 'Bahrain Brunch & Happy Hour Guides',
    seoDescription:
      'Bahrain brunch and happy hour guides: Friday and Saturday brunches plus happy hours and ladies’ nights in Manama, Seef, Juffair and Adliya.',
  },
  {
    slug: 'paris',
    city: 'Paris',
    country: 'France',
    region: 'Europe',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches and happy hours across the arrondissements.',
    areas: ['1er', '6e', '8e', '15e', 'Oberkampf'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      'Paris does weekend brunch in bistros, hotels and cafés across the city, and its bars have plenty of early-evening happy hours.',
      'The Paris guide puts weekend brunches, happy hours and bottomless deals in one place, sorted by day and time, across areas including the 1er, 6e, 8e and 15e arrondissements and Oberkampf.',
    ],
    image: {
      alt: 'The Eiffel Tower above the Seine, Paris',
      credit: {
        title: 'Eiffel Tower @ Seine @ Paris',
        author: 'Guilhem Vellut from Paris, France',
        license: 'CC BY 2.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Eiffel_Tower_@_Seine_@_Paris_(25463344431).jpg',
      },
    },
    theme: { primary: '#0b3f8c', deep: '#06275a', accent: '#ef4135', onAccent: '#ffffff' },
    seoTitle: 'Paris Brunch & Happy Hour Guide',
    seoDescription:
      'Paris brunch and happy hour guide: weekend brunches, happy hours and bottomless deals sorted by day and time, with prices and links.',
  },
  {
    slug: 'rome',
    city: 'Rome',
    country: 'Italy',
    region: 'Europe',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches and aperitivo, from Piazza del Popolo to the Colosseum.',
    areas: ['Piazza del Popolo', 'Piazza di Spagna', 'Colosseum', 'Monte Mario'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      'In Rome, weekend brunch sits alongside aperitivo, the early-evening ritual of drinks served with snacks before dinner.',
      'The Rome guide brings together weekend brunches and aperitivo offers, sorted by day and time, from Piazza del Popolo and Piazza di Spagna to the Colosseum.',
    ],
    image: {
      alt: 'The Colosseum in Rome',
      credit: {
        title: 'Colosseum of Rome, Italy',
        author: 'Wilfredor',
        license: 'CC0',
        licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Colosseum_of_Rome,_Italy.jpg',
      },
    },
    theme: { primary: '#a51e2a', deep: '#61101a', accent: '#1f8f4e', onAccent: '#ffffff' },
    seoTitle: 'Rome Brunch & Aperitivo Guide',
    seoDescription:
      'Rome brunch and aperitivo guide: weekend brunches and aperitivo offers sorted by day and time, with prices, maps and venue links.',
  },
  {
    slug: 'milan',
    city: 'Milan',
    country: 'Italy',
    region: 'Europe',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches and aperitivo from the Duomo to the Navigli.',
    areas: ['Duomo', 'Brera', 'Navigli', 'Centrale', 'Cordusio'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      'Milan is famous for aperitivo, and its weekend brunches run from the streets around the Duomo to Brera and the canals of the Navigli.',
      'The Milan guide brings together weekend brunches and aperitivo offers, sorted by day and time, across the Duomo, Brera, the Navigli and Centrale.',
    ],
    image: {
      alt: 'Milan Cathedral (Duomo)',
      credit: {
        title: 'Duomo Cathedral, Milan.',
        author: '2alessio8',
        license: 'CC BY 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Duomo_Cathedral,_Milan._-_panoramio.jpg',
      },
    },
    theme: { primary: '#0e5c3a', deep: '#063821', accent: '#ce2b37', onAccent: '#ffffff' },
    seoTitle: 'Milan Brunch & Aperitivo Guide',
    seoDescription:
      'Milan brunch and aperitivo guide: weekend brunches and aperitivo offers around the Duomo, Brera and the Navigli, sorted by day and time.',
  },
  {
    slug: 'munich',
    city: 'Munich',
    country: 'Germany',
    region: 'Europe',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches and happy hours from Schwabing to Glockenbach.',
    areas: ['Schwabing', 'Glockenbach', 'Maximilianstraße', 'Sendlinger Tor'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      'Munich’s weekend brunches range from café brunches in Schwabing to spots around the Old Town, with happy hours in Glockenbach and beyond.',
      'The Munich guide puts weekend brunches, happy hours and bottomless deals in one place, sorted by day and time, with prices and venue links.',
    ],
    image: {
      alt: 'Munich\u2019s Frauenkirche seen from St Peter\u2019s tower',
      credit: {
        title: 'Frauenkirche Munich - View from Peterskirche Tower',
        author: 'Diliff',
        license: 'CC BY 2.5',
        licenseUrl: 'https://creativecommons.org/licenses/by/2.5',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Frauenkirche_Munich_-_View_from_Peterskirche_Tower.jpg',
      },
    },
    theme: { primary: '#1d1d1f', deep: '#0b0b0c', accent: '#ffce00', onAccent: '#1d1d1f' },
    seoTitle: 'Munich Brunch & Happy Hour Guide',
    seoDescription:
      'Munich brunch and happy hour guide: weekend brunches, happy hours and bottomless deals in Schwabing, Glockenbach and beyond.',
  },
  {
    slug: 'sydney',
    city: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches and happy hours from the CBD to Bondi.',
    areas: ['CBD', 'The Rocks', 'Darling Harbour', 'Surry Hills', 'Bondi', 'North Sydney'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      'Brunch is a Sydney institution, from harbourside venues in The Rocks and Darling Harbour to cafés in Surry Hills and Bondi.',
      'The Sydney guide puts weekend brunches, happy hours, bottomless deals and food deals in one place, sorted by day and time.',
    ],
    image: {
      alt: 'Sydney Opera House at dusk',
      credit: {
        title: 'MC Sydney Opera House',
        author: 'Christian Mehlführer, User:Chmehl',
        license: 'CC BY 2.5',
        licenseUrl: 'https://creativecommons.org/licenses/by/2.5',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:MC_Sydney_Opera_House.jpg',
      },
    },
    theme: { primary: '#0a1f5c', deep: '#05123a', accent: '#e8ebf3', onAccent: '#05123a' },
    seoTitle: 'Sydney Brunch & Happy Hour Guide',
    seoDescription:
      'Sydney brunch and happy hour guide: weekend brunches, happy hours and bottomless deals from the CBD to Bondi, sorted by day and time.',
  },
  {
    slug: 'hanoi',
    city: 'Hanoi',
    country: 'Vietnam',
    region: 'Asia',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches and happy hours around the Old Quarter.',
    areas: ['Hoan Kiem', 'Old Quarter', 'Ba Dinh', 'Cau Giay'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      'Hanoi’s weekend brunches and happy hours centre on Hoan Kiem and the Old Quarter, with more in Ba Dinh and Cau Giay.',
      'The Hanoi guide puts weekend brunches, happy hours and ladies’ nights in one place, sorted by day and time, with prices and venue links.',
    ],
    image: {
      alt: 'Hanoi city skyline',
      credit: {
        title: 'Hanoi skyline',
        author: 'cloud.shepherd',
        license: 'CC BY 2.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hanoi_skyline_(22813421939).jpg',
      },
    },
    theme: { primary: '#8f0e16', deep: '#55070c', accent: '#f2c100', onAccent: '#4a0609' },
    seoTitle: 'Hanoi Brunch & Happy Hour Guide',
    seoDescription:
      'Hanoi brunch and happy hour guide: weekend brunches, happy hours and ladies’ nights around Hoan Kiem and the Old Quarter.',
  },
  {
    slug: 'ho-chi-minh-city',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    region: 'Asia',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches, happy hours and ladies’ nights in District 1 and District 3.',
    areas: ['District 1', 'District 3'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      'Ho Chi Minh City’s hotel brunches, rooftop bars and happy hours are concentrated in District 1, with more in District 3.',
      'The Ho Chi Minh City guide puts weekend brunches, happy hours and ladies’ nights in one place, sorted by day and time.',
    ],
    image: {
      alt: 'Ho Chi Minh City skyline',
      credit: {
        title: 'Ho Chi Minh City Skyline',
        author: 'Pimnl',
        license: 'CC0',
        licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ho_Chi_Minh_City_Skyline.jpg',
      },
    },
    theme: { primary: '#c41e24', deep: '#7a0f13', accent: '#ffd400', onAccent: '#5a0a0e' },
    seoTitle: 'Ho Chi Minh City Brunch & Happy Hour Guide',
    seoDescription:
      'Ho Chi Minh City brunch and happy hour guide: weekend brunches, happy hours and ladies’ nights in District 1 and District 3.',
  },
  {
    slug: 'pattaya',
    city: 'Pattaya',
    country: 'Thailand',
    region: 'Asia',
    status: 'published',
    featured: false,
    tagline: 'Weekend brunches and happy hours along Pattaya Beach.',
    areas: ['North Pattaya', 'Pattaya Beach'],
    brunchDays: 'Saturday and Sunday',
    intro: [
      'Pattaya’s brunches and happy hours line the beachfront, from North Pattaya to the hotels along Pattaya Beach.',
      'The Pattaya guide puts weekend brunches, happy hours and ladies’ nights in one place, sorted by day and time, with prices and venue links.',
    ],
    image: {
      alt: 'Pattaya Bay and Pattaya Beach',
      credit: {
        title: 'Pattaya Bay, Pattaya Beach, Thailand',
        author: 'Vyacheslav Argenberg',
        license: 'CC BY 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pattaya_Bay,_Pattaya_Beach,_Thailand.jpg',
      },
    },
    theme: { primary: '#26235c', deep: '#15133a', accent: '#e9e8f2', onAccent: '#15133a' },
    seoTitle: 'Pattaya Brunch & Happy Hour Guide',
    seoDescription:
      'Pattaya brunch and happy hour guide: weekend brunches, happy hours and ladies’ nights along Pattaya Beach, sorted by day and time.',
  },
];
