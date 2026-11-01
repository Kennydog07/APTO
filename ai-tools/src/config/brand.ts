/**
 * Site name, logo and contact details. Change these in one place to rebrand.
 * (Imported by the frontend and by emails, so keep it free of secrets.)
 */
export const BRAND = {
  name: 'APTO Quick Tools',
  shortName: 'APTO',
  tagline: 'Small AI tools. Pay once. No account.',
  logo: '/logo.jpg',
  contactEmail: 'apto.tools@gmail.com',
  /** Shown in the terms and privacy policy as the data controller. */
  legalName: 'APTO',
  country: 'United Kingdom',
  /** Accent colour (Tailwind blue-700). Meets WCAG AA on white. */
  themeColor: '#1d4ed8',
} as const;
