import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Only variables prefixed VITE_ are exposed to the browser. Never put secrets in VITE_ vars.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // When running plain `vite` (not `netlify dev`), forward API calls to a local `netlify dev`.
    proxy: { '/api': 'http://localhost:8888' },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
