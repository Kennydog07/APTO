/* =====================================================================
   FREQUENTLY ASKED QUESTIONS
   ---------------------------------------------------------------------
   GENERAL_FAQS appear on the homepage. PURCHASE_FAQS appear on every
   product page. Keep answers accurate to how you actually deliver the
   guides on Gumroad. Prices are filled in automatically.
   ===================================================================== */
import { PRICES } from './pricing';

const usd = (n: number) => `US $${n.toFixed(2)}`;

export const GENERAL_FAQS = [
  {
    q: 'What is a Destination : Brunch guide?',
    a: 'Each guide is a city-specific web app that lists brunches or dining deals with prices, days, times, areas and links to the venue. You open it in your phone or computer browser.',
  },
  {
    q: 'How much do the guides cost?',
    a: `Brunch guides are ${usd(PRICES.brunch)} each. Happy hour and daily deals guides are ${usd(PRICES.deals)} each. Each guide is a one-off purchase for one city; it is not a subscription.`,
  },
  {
    q: 'How do I pay?',
    a: 'Payment is handled by Gumroad, a secure checkout for digital products. When you tap Download Now you go to the guide’s own Gumroad page, where you can review the details before you pay. We never see your card details.',
  },
  {
    q: 'How do I get my guide after I pay?',
    a: 'Gumroad shows the access details for your guide once your payment is complete and also sends them to the email address you use at checkout. Follow those instructions to open your guide.',
  },
  {
    q: 'Do I need to install an app?',
    a: 'No. The guides are web apps that open in your browser on iPhone, Android, tablet or computer, so there is nothing to install from an app store. You need an internet connection to use them.',
  },
  {
    q: 'Are the restaurant prices and offers guaranteed?',
    a: 'No. Venues change their prices, packages and offers, sometimes at short notice. Each guide shows when its information was last checked. Always confirm the details with the venue before you go or book.',
  },
  {
    q: 'Are you connected to the restaurants?',
    a: 'Destination : Brunch is an independent guide publisher. We are not paid by, affiliated with or endorsed by the venues listed, unless a guide clearly says otherwise.',
  },
  {
    q: 'Can I get a refund?',
    a: 'See our Refunds & Delivery page for how refund requests are handled. Your statutory consumer rights are not affected.',
  },
];

export const PURCHASE_FAQS = [
  {
    q: 'What do I receive?',
    a: 'Access to the city guide described on this page: a mobile-friendly web app that you open in your browser. Gumroad shows the access details once your payment is complete and emails them to you.',
  },
  {
    q: 'Is checkout secure?',
    a: 'Yes. Checkout and payment take place on Gumroad. Destination : Brunch never sees or stores your card details.',
  },
  {
    q: 'Does clicking Download Now charge me?',
    a: 'No. Download Now takes you to the guide’s Gumroad page. You are only charged if you complete the checkout there.',
  },
  {
    q: 'What if a venue changes its offer?',
    a: 'Restaurant offers change often. The guide shows when its information was last checked; always confirm prices and availability with the venue.',
  },
];
