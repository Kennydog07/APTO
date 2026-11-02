/** Checks that keep the tools mergeable into the main apto-pro.com site under /ai. */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { BASE_PATH, stripBase, withBase } from '../shared/paths.ts';

const root = path.resolve(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const fnFiles = fs
  .readdirSync(path.join(root, 'netlify/functions'))
  .filter((f) => f.endsWith('.ts'));

describe('base path helpers', () => {
  it('adds and removes /ai', () => {
    expect(BASE_PATH).toBe('/ai');
    expect(withBase('/')).toBe('/ai/');
    expect(withBase('/parking-appeal')).toBe('/ai/parking-appeal');
    expect(withBase('/api/stats?key=1')).toBe('/ai/api/stats?key=1');
    expect(withBase('/ai/terms')).toBe('/ai/terms'); // not doubled
    expect(withBase('https://x.com/a')).toBe('https://x.com/a');
    expect(withBase('//cdn.x/a')).toBe('//cdn.x/a');
    expect(stripBase('/ai')).toBe('/');
    expect(stripBase('/ai/')).toBe('/');
    expect(stripBase('/ai/blog/x')).toBe('/blog/x');
    expect(stripBase('/airport')).toBe('/airport'); // only a whole segment
  });
});

describe('every place that hard-codes the base path agrees', () => {
  it('vite base, prerender and netlify.toml', () => {
    expect(read('vite.config.ts')).toContain(`base: '${BASE_PATH}/'`);
    expect(read('scripts/prerender.mjs')).toContain(`const BASE = '${BASE_PATH}'`);
    expect(read('netlify.toml')).toContain(`from = "${BASE_PATH}/t/*"`);
    expect(read('merge-kit/netlify-main-site.toml')).toContain(`from = "${BASE_PATH}/t/*"`);
  });
  it('all functions are named ai-* and routed under /ai/api/ (or scheduled/background)', () => {
    expect(fnFiles.length).toBe(13);
    for (const f of fnFiles) {
      expect(f.startsWith('ai-')).toBe(true);
      const src = read(`netlify/functions/${f}`);
      const pathMatch = /path: '([^']+)'/.exec(src);
      if (pathMatch) expect(pathMatch[1]!.startsWith(`${BASE_PATH}/api/`)).toBe(true);
      else expect(/schedule: '/.test(src) || f.endsWith('-background.ts')).toBe(true);
    }
  });
  it('the background trigger calls the renamed function', () => {
    expect(read('netlify/lib/pipeline.ts')).toContain('/.netlify/functions/ai-generate-background');
    expect(fnFiles).toContain('ai-generate-background.ts');
  });
  it("no tool function clashes with the main site's functions", () => {
    const mainFns = fs
      .readdirSync(path.join(root, '..', 'functions'))
      .map((f) => f.replace(/\.[^.]+$/, ''));
    for (const f of fnFiles) expect(mainFns).not.toContain(f.replace(/\.ts$/, ''));
  });
});

describe('settings', () => {
  it('AI_TOOLS_-prefixed settings win over plain ones', async () => {
    const { readEnv, appUrl } = await import('../netlify/lib/env.ts');
    process.env.STRIPE_WEBHOOK_SECRET = 'main-site-secret';
    process.env.AI_TOOLS_STRIPE_WEBHOOK_SECRET = 'tools-secret';
    expect(readEnv('STRIPE_WEBHOOK_SECRET')).toBe('tools-secret');
    delete process.env.AI_TOOLS_STRIPE_WEBHOOK_SECRET;
    expect(readEnv('STRIPE_WEBHOOK_SECRET')).toBe('main-site-secret');
    process.env.AI_TOOLS_SITE_URL = 'https://apto-pro.com/';
    expect(appUrl()).toBe('https://apto-pro.com/ai');
    delete process.env.AI_TOOLS_SITE_URL;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });
});

describe('merge kit', () => {
  it('function wrappers are up to date', () => {
    expect(() =>
      execFileSync('node', [path.join(root, 'scripts/gen-merge-kit.mjs'), '--check'], {
        stdio: 'pipe',
      }),
    ).not.toThrow();
  });

  it('applies cleanly to a copy of the main site, and only once', () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'apto-merge-'));
    const mainToml =
      '[build]\n  publish = "."\n  functions = "functions"\n\n[functions]\n  node_bundler = "esbuild"\n\n[[redirects]]\n  from = "/api/*"\n  to = "/.netlify/functions/:splat"\n  status = 200\n';
    fs.writeFileSync(path.join(repo, 'netlify.toml'), mainToml);
    fs.writeFileSync(
      path.join(repo, 'robots.txt'),
      'User-agent: *\nAllow: /\n\nSitemap: https://apto-pro.com/sitemap.xml\n',
    );
    fs.writeFileSync(
      path.join(repo, 'package.json'),
      JSON.stringify({ name: 'apto-tools', dependencies: { stripe: '^14.0.0' } }),
    );
    fs.mkdirSync(path.join(repo, 'functions'));
    fs.writeFileSync(path.join(repo, 'functions', 'stripe-webhook.js'), '// APTO Pro');

    const run = () =>
      execFileSync('node', [path.join(root, 'scripts/apply-merge-kit.mjs'), '--repo', repo], {
        encoding: 'utf8',
      });
    run();
    const toml1 = fs.readFileSync(path.join(repo, 'netlify.toml'), 'utf8');
    expect(toml1).toContain('command = "npm ci --prefix ai-tools');
    expect(toml1).toContain('npm run build:functions --prefix ai-tools');
    expect(toml1).toContain('from = "/api/*"'); // main site's rules untouched
    expect(toml1).toContain('[functions."ai-cv-extract"]');
    expect(fs.readFileSync(path.join(repo, 'robots.txt'), 'utf8')).toContain(
      'Sitemap: https://apto-pro.com/ai/sitemap.xml',
    );
    const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
    expect(pkg.dependencies.stripe).toBe('^14.0.0'); // main site's versions untouched
    expect(pkg.dependencies['pdf-parse']).toBeTruthy();
    expect(
      fs.readdirSync(path.join(repo, 'functions')).filter((f) => f.startsWith('ai-')),
    ).toHaveLength(13);
    expect(fs.readFileSync(path.join(repo, 'functions', 'stripe-webhook.js'), 'utf8')).toBe(
      '// APTO Pro',
    );
    expect(fs.readFileSync(path.join(repo, '.gitignore'), 'utf8')).toContain('/ai/');

    run(); // second run changes nothing
    expect(fs.readFileSync(path.join(repo, 'netlify.toml'), 'utf8')).toBe(toml1);
    fs.rmSync(repo, { recursive: true, force: true });
  });
});
