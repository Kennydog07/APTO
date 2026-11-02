import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Everything is served under /ai/ (see shared/paths.ts), so the tools can live inside the main
 * apto-pro.com site. Output folder:
 *  - standalone (this folder deployed on its own): dist/ai, published from dist/
 *  - merged into the main site: AI_TOOLS_OUT_DIR=../ai, i.e. <repo root>/ai/
 */
const outDir = process.env.AI_TOOLS_OUT_DIR || 'dist/ai';
const resolved = path.resolve(__dirname, outDir);
if (resolved === path.resolve(__dirname) || resolved === path.resolve(__dirname, '..')) {
  throw new Error(`Refusing to build into ${resolved}`);
}

// Only variables prefixed VITE_ are exposed to the browser. Never put secrets in VITE_ vars.
export default defineConfig({
  base: '/ai/',
  plugins: [react(), tailwindcss()],
  build: { outDir, emptyOutDir: true },
  server: {
    // When running plain `vite` (not `netlify dev`), forward API calls to a local `netlify dev`.
    proxy: { '/ai/api': 'http://localhost:8888' },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
