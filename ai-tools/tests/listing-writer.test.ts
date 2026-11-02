import { describe, expect, it } from 'vitest';
import {
  listingJobInputsSchema,
  listingPurchaseSchema,
  listingRequestSchema,
  TOKEN_RE,
} from '../shared/schemas/listing-writer.ts';
import { fitTitle, listingWriterPrompt } from '../prompts/listing-writer.ts';
import { OutputParseError } from '../prompts/types.ts';
import { listingWriterGenerator } from '../netlify/lib/generators/listing-writer.ts';
import { looksLikeImage, newToken, withoutImages } from '../netlify/lib/credits.ts';
import { TOOLS } from '../shared/tools.ts';

// Tiny valid images (just the magic bytes matter for looksLikeImage).
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 74, 70, 73, 70, 0, 1]).toString('base64');
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]).toString(
  'base64',
);
const WEBP = Buffer.from('RIFF\x00\x00\x00\x00WEBPVP8 ', 'latin1').toString('base64');
const token = 'A'.repeat(16) + 'b'.repeat(8) + '12345678';

const inputs = listingJobInputsSchema.parse({
  kind: 'listing',
  token,
  platform: 'ebay',
  notes: 'Size 12, wool blend label',
  images: [{ mediaType: 'image/jpeg', data: JPEG }],
});

const good = {
  title: "Women's Navy Wool Blend Peacoat Size 12",
  description: 'Navy double-breasted peacoat in good pre-owned condition.',
  category: 'Clothes > Women > Coats',
  item_specifics: [{ name: 'Colour', value: 'Navy' }],
  condition: 'Pre-owned – good',
  keywords: [
    'navy peacoat',
    'wool coat',
    'size 12 coat',
    'womens coat',
    'winter coat',
    'extra one',
  ],
  checks: ['exact wool percentage'],
};

describe('listing writer config', () => {
  it('is a 10-credit pack for £1.99 with a 1200 token cap', () => {
    expect(TOOLS['listing-writer'].credits).toBe(10);
    expect(TOOLS['listing-writer'].pricePence).toBe(199);
    expect(listingWriterPrompt.max_tokens).toBe(1200);
  });
});

describe('listing schemas', () => {
  it('needs 1 to 3 images of an allowed type', () => {
    const base = { platform: 'ebay', notes: '' };
    expect(listingRequestSchema.safeParse({ ...base, images: [] }).success).toBe(false);
    const img = { mediaType: 'image/jpeg', data: JPEG };
    expect(listingRequestSchema.safeParse({ ...base, images: [img, img, img, img] }).success).toBe(
      false,
    );
    expect(
      listingRequestSchema.safeParse({ ...base, images: [{ mediaType: 'image/gif', data: JPEG }] })
        .success,
    ).toBe(false);
    expect(
      listingRequestSchema.safeParse({
        ...base,
        images: [{ mediaType: 'image/jpeg', data: 'not base64!' }],
      }).success,
    ).toBe(false);
    expect(
      listingRequestSchema.safeParse({
        ...base,
        images: [{ mediaType: 'image/jpeg', data: 'A'.repeat(1_400_001) }],
      }).success,
    ).toBe(false);
  });
  it('caps notes at 500 characters', () => {
    expect(
      listingRequestSchema.safeParse({
        platform: 'vinted',
        notes: 'x'.repeat(501),
        images: [{ mediaType: 'image/jpeg', data: JPEG }],
      }).success,
    ).toBe(false);
  });
  it('purchase is a pack, optionally topping up a valid token', () => {
    expect(listingPurchaseSchema.parse({})).toEqual({ kind: 'pack' });
    expect(listingPurchaseSchema.parse({ topUpToken: token }).topUpToken).toBe(token);
    expect(listingPurchaseSchema.safeParse({ topUpToken: 'short' }).success).toBe(false);
  });
});

describe('tokens and images', () => {
  it('generates 32-character tokens from [A-Za-z0-9] that are all different', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const t = newToken();
      expect(t).toMatch(TOKEN_RE);
      seen.add(t);
    }
    expect(seen.size).toBe(200);
  });
  it('checks image bytes match the declared type', () => {
    expect(looksLikeImage({ mediaType: 'image/jpeg', data: JPEG })).toBe(true);
    expect(looksLikeImage({ mediaType: 'image/png', data: PNG })).toBe(true);
    expect(looksLikeImage({ mediaType: 'image/webp', data: WEBP })).toBe(true);
    expect(looksLikeImage({ mediaType: 'image/png', data: JPEG })).toBe(false);
    expect(
      looksLikeImage({ mediaType: 'image/jpeg', data: Buffer.from('<svg>').toString('base64') }),
    ).toBe(false);
  });
  it('strips photos from stored inputs', () => {
    const stripped = withoutImages(inputs as unknown as Record<string, unknown>)!;
    expect(stripped.images).toBeUndefined();
    expect(stripped.image_count).toBe(1);
    expect(stripped.platform).toBe('ebay');
  });
});

describe('listing prompt', () => {
  it('system prompt has the honesty rules', () => {
    const s = listingWriterPrompt.buildSystemPrompt();
    expect(s).toMatch(/only what is visible/);
    expect(s).toMatch(/check:/);
    expect(s).toMatch(/Do NOT name a brand unless/);
    expect(s).toMatch(/Do NOT suggest or mention any price/);
  });
  it('sends images first, then the text with platform and notes', () => {
    const blocks = listingWriterPrompt.buildUserPrompt(inputs) as {
      type: string;
      text?: string;
      source?: { media_type: string };
    }[];
    expect(blocks[0]).toMatchObject({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg' },
    });
    const text = blocks.at(-1)!;
    expect(text.type).toBe('text');
    expect(text.text).toContain('eBay');
    expect(text.text).toContain('<seller_notes>');
    expect(text.text).toContain('Size 12');
  });
});

describe('listing parser', () => {
  it('parses and keeps exactly 5 keywords', () => {
    const out = listingWriterPrompt.parseOutput(JSON.stringify(good), inputs);
    expect(out.keywords).toHaveLength(5);
  });
  it('trims eBay titles to 80 and Vinted titles to 60 characters at a word boundary', () => {
    const long = {
      ...good,
      title:
        'Navy Wool Blend Double Breasted Peacoat Womens Size 12 Gold Buttons Lined Winter Smart Coat',
    };
    const ebay = listingWriterPrompt.parseOutput(JSON.stringify(long), inputs);
    expect(ebay.title.length).toBeLessThanOrEqual(80);
    expect(long.title.startsWith(ebay.title)).toBe(true);
    const vinted = listingWriterPrompt.parseOutput(JSON.stringify(long), {
      ...inputs,
      platform: 'vinted',
    });
    expect(vinted.title.length).toBeLessThanOrEqual(60);
    expect(fitTitle('short title', 80)).toBe('short title');
  });
  it('rejects listings that mention a price', () => {
    for (const description of ['Bargain at £20!', 'RRP was high', 'Yours for 15 pounds']) {
      expect(() =>
        listingWriterPrompt.parseOutput(
          JSON.stringify({ ...good, description: description.padEnd(30, '.') }),
          inputs,
        ),
      ).toThrow(OutputParseError);
    }
  });
  it('rejects invalid output', () => {
    expect(() => listingWriterPrompt.parseOutput('{"title":"x"}', inputs)).toThrow(
      OutputParseError,
    );
  });
  it('display prefixes every uncertainty note with "check:" and has no files', async () => {
    const out = listingWriterPrompt.parseOutput(JSON.stringify(good), inputs);
    const { display, files } = await listingWriterGenerator.build(inputs, out);
    expect(files).toEqual([]);
    expect((display as { checks: string[] }).checks).toEqual(['check: exact wool percentage']);
    expect((display as { platform: string }).platform).toBe('eBay');
  });
});
