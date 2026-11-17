// @ts-check
import { defineConfig } from 'astro/config';

// The public web address of the site. Netlify sets URL automatically during a build.
// To use your own domain, set SITE_URL in Netlify (Site configuration > Environment variables).
const site = process.env.SITE_URL || process.env.URL || 'https://destination-brunch.netlify.app';

export default defineConfig({
  site,
  // /destinations/dubai rather than /destinations/dubai/
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
  devToolbar: { enabled: false },
});
