/* =====================================================================
   SITE SETTINGS
   ---------------------------------------------------------------------
   Anything left as an empty string '' is treated as "not set yet".
   Legal pages show a yellow "To complete before launch" box wherever
   a required detail below is still empty.
   ===================================================================== */

export const SITE = {
  name: 'Destination : Brunch',
  shortName: 'Destination Brunch',
  tagline: 'Discover the destination. Find the deals. Enjoy more.',
  description:
    "City guides to brunches, happy hours and dining deals, from Dubai to London and Bangkok to New York. Buy a guide for the city you're visiting through Gumroad.",
  /** Who publishes the guides (shown in the footer and on legal pages). */
  publisher: 'J Gilmour',

  // ---- TO COMPLETE BEFORE LAUNCH ---------------------------------------
  /** Customer contact email, e.g. 'hello@yourdomain.com'. */
  contactEmail: '',
  /** Registered business / trading name, if you have one. */
  legalName: '',
  /** Business address, if the law where you operate requires you to show one. */
  businessAddress: '',
  /** Country whose law governs the Terms, e.g. 'England and Wales'. */
  governingLaw: '',
  /** Your refund policy in one or two sentences. Must match Gumroad. */
  refundPolicy: '',
  /** Date the legal pages were last reviewed, e.g. '2026-12-01'. */
  legalLastReviewed: '',
  // ----------------------------------------------------------------------

  /** Social profiles. Leave '' to hide an icon. */
  social: {
    facebook: '',
    instagram: '',
    pinterest: '',
    tiktok: '',
    x: '',
    threads: '',
    youtube: '',
  },
};

/* =====================================================================
   ANALYTICS (optional, privacy-friendly, no cookies)
   ---------------------------------------------------------------------
   provider: 'none'      -> no analytics at all (default)
   provider: 'plausible' -> set plausibleDomain to your site domain
   provider: 'umami'     -> set umamiWebsiteId (and umamiScript if self-hosted)
   Events sent: Destination View, Product View, Download Click.
   A "Download Click" means someone left for Gumroad. It is NOT a sale.
   ===================================================================== */
export const ANALYTICS: {
  provider: 'none' | 'plausible' | 'umami';
  plausibleDomain: string;
  plausibleScript: string;
  umamiWebsiteId: string;
  umamiScript: string;
} = {
  provider: 'none',
  plausibleDomain: '',
  plausibleScript: 'https://plausible.io/js/script.outbound-links.js',
  umamiWebsiteId: '',
  umamiScript: 'https://cloud.umami.is/script.js',
};
