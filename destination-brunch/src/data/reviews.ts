/* =====================================================================
   CUSTOMER REVIEWS
   ---------------------------------------------------------------------
   The reviews section on the homepage stays hidden while this list is
   empty. Only add GENUINE reviews from real customers who agreed to be
   quoted (for example, from Gumroad ratings or emails), word for word.
   Never invent, edit the meaning of, or pay for reviews.

   Example:
   { quote: 'Found our Saturday brunch in two minutes.', name: 'Sarah K.', guide: 'dubai-brunch', date: '2026-12-03' },
   ===================================================================== */

export interface Review {
  quote: string;
  /** First name and initial, as the customer agreed. */
  name: string;
  /** Product id from products.ts */
  guide: string;
  /** YYYY-MM-DD */
  date: string;
}

export const REVIEWS: Review[] = [];
