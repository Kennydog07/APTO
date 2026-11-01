import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

/**
 * Bundles each Netlify function (netlify/functions/ai-*.ts) into ONE ESM file in
 * functions-dist/, with every npm package inlined EXCEPT pdf-parse (it uses a native add-on,
 * @napi-rs/canvas, so it must be installed normally; the merge adds it to the main site's
 * package.json). The main apto-pro.com site's function wrappers import these files.
 *
 *   npm run build:functions
 */
const fnDir = path.resolve(__dirname, 'netlify/functions');
const input = Object.fromEntries(
  fs
    .readdirSync(fnDir)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => [f.replace(/\.ts$/, ''), path.join(fnDir, f)]),
);

export default defineConfig({
  build: {
    ssr: true,
    outDir: 'functions-dist',
    emptyOutDir: true,
    target: 'node22',
    minify: false,
    rollupOptions: {
      input,
      external: ['pdf-parse'],
      output: {
        format: 'es',
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[name]-[hash].mjs',
      },
    },
  },
  ssr: { noExternal: true, target: 'node' },
});
