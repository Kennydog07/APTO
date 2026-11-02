import { describe, expect, it } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { bedtimeStorySchema } from '../shared/schemas/bedtime-story.ts';
import { bedtimeStoryPrompt, storyWordTarget } from '../prompts/bedtime-story.ts';
import { OutputParseError } from '../prompts/types.ts';
import { bedtimeStoryGenerator } from '../netlify/lib/generators/bedtime-story.ts';
import { layoutPassage } from '../netlify/lib/docs/story-pdf.ts';
import { toWinAnsi } from '../netlify/lib/docs/pdf.ts';
import { SAMPLE_INPUTS } from '../scripts/sample-inputs.ts';
import sample from '../src/samples/bedtime-story.json';

const inputs = bedtimeStorySchema.parse(SAMPLE_INPUTS['bedtime-story']);
const output = { title: sample.title, pages: sample.pages };

describe('bedtime story input schema', () => {
  it('accepts valid inputs and drops blank favourites', () => {
    const r = bedtimeStorySchema.parse({
      ...SAMPLE_INPUTS['bedtime-story'],
      favourites: ['space', '', ''],
    });
    expect(r.favourites).toEqual(['space']);
    expect(r.theme).toBe('kindness');
  });
  it('allows first names with accents, hyphens and apostrophes', () => {
    for (const childName of ['Zoë', 'Mary-Jane', "D'Arcy", 'Łucja', 'Siân']) {
      expect(bedtimeStorySchema.safeParse({ ...inputs, childName }).success).toBe(true);
    }
  });
  it('rejects surnames-by-email, digits and over-long names', () => {
    for (const childName of ['', 'maya@example.com', 'Maya 2', 'x'.repeat(31), '-Maya']) {
      expect(bedtimeStorySchema.safeParse({ ...inputs, childName }).success).toBe(false);
    }
  });
  it('needs 1 to 3 favourites, each short', () => {
    expect(bedtimeStorySchema.safeParse({ ...inputs, favourites: ['', ''] }).success).toBe(false);
    expect(
      bedtimeStorySchema.safeParse({ ...inputs, favourites: ['a', 'b', 'c', 'd'] }).success,
    ).toBe(false);
    expect(bedtimeStorySchema.safeParse({ ...inputs, favourites: ['x'.repeat(41)] }).success).toBe(
      false,
    );
  });
  it('theme is optional; age band and length are required', () => {
    const { theme: _t, ...noTheme } = inputs;
    expect(bedtimeStorySchema.parse(noTheme).theme).toBe('');
    expect(bedtimeStorySchema.safeParse({ ...inputs, ageBand: '11-13' }).success).toBe(false);
    expect(bedtimeStorySchema.safeParse({ ...inputs, length: 'epic' }).success).toBe(false);
  });
});

describe('bedtime story prompt', () => {
  it('system prompt has the safety and style rules', () => {
    const s = bedtimeStoryPrompt.buildSystemPrompt();
    expect(s).toMatch(/hero/);
    expect(s).toMatch(/nothing scary/i);
    expect(s).toMatch(/British English/);
    expect(s).toMatch(/Return ONLY a JSON object/);
  });
  it('user prompt includes name, age, favourites, theme and a word target', () => {
    const u = bedtimeStoryPrompt.buildUserPrompt(inputs) as string;
    expect(u).toContain('Maya');
    expect(u).toContain('Age 5–7');
    expect(u).toContain('"rockets"');
    expect(u).toContain('Kindness');
    expect(u).toContain(`about ${storyWordTarget(inputs)} words`);
  });
  it('long stories are twice as long, and younger bands are shorter', () => {
    expect(storyWordTarget({ ageBand: '5-7', length: 'long' })).toBe(
      2 * storyWordTarget({ ageBand: '5-7', length: 'short' }),
    );
    expect(storyWordTarget({ ageBand: '2-4', length: 'short' })).toBeLessThan(
      storyWordTarget({ ageBand: '8-10', length: 'short' }),
    );
  });
  it('regeneration includes the note and the previous story', () => {
    const u = bedtimeStoryPrompt.buildUserPrompt(inputs, {
      previous: output,
      note: 'more about Biscuit',
    }) as string;
    expect(u).toContain('more about Biscuit');
    expect(u).toContain('Sleepy Star');
  });
  it('max_tokens is 3000', () => expect(bedtimeStoryPrompt.max_tokens).toBe(3000));
});

describe('bedtime story parser', () => {
  it('parses a valid story', () => {
    expect(bedtimeStoryPrompt.parseOutput(JSON.stringify(output), inputs)).toEqual(output);
  });
  it('rejects a story that never mentions the child', () => {
    const noName = {
      ...output,
      title: 'The Sleepy Star',
      pages: output.pages.map((p) => p.replaceAll('Maya', 'the girl')),
    };
    expect(() => bedtimeStoryPrompt.parseOutput(JSON.stringify(noName), inputs)).toThrow(
      OutputParseError,
    );
  });
  it('rejects a story far shorter than requested', () => {
    const short = { title: 'Maya', pages: ['Maya slept.', 'Good night.', 'The end.', 'Zzz.'] };
    expect(() => bedtimeStoryPrompt.parseOutput(JSON.stringify(short), inputs)).toThrow(
      OutputParseError,
    );
  });
  it('rejects malformed JSON', () => {
    expect(() => bedtimeStoryPrompt.parseOutput('{"title":"x","pages":[]}', inputs)).toThrow(
      OutputParseError,
    );
  });
});

describe('bedtime story PDF', () => {
  it('is A5 with cover + one page per passage + The End', async () => {
    const { files, display } = await bedtimeStoryGenerator.build(inputs, output);
    expect(files).toHaveLength(1);
    expect(files[0]!.filename).toBe('bedtime-story.pdf');
    expect(files[0]!.filename).not.toContain('Maya'); // no child name in file names
    const doc = await PDFDocument.load(files[0]!.bytes);
    expect(doc.getPageCount()).toBe(output.pages.length + 2);
    const [w, h] = [doc.getPage(0).getWidth(), doc.getPage(0).getHeight()];
    expect(Math.round(w)).toBe(420);
    expect(Math.round(h)).toBe(595);
    expect(display).toMatchObject({ childName: 'Maya', title: sample.title });
  });
  it('shrinks or continues very long passages instead of overflowing', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.TimesRoman);
    const fits = layoutPassage('A short passage.', font, 20);
    expect(fits.size).toBe(20);
    const huge = layoutPassage('word '.repeat(1200), font, 20);
    expect(huge.size).toBe(11);
    expect(huge.overflow.length).toBeGreaterThan(0);
    const { files } = await bedtimeStoryGenerator.build(inputs, {
      ...output,
      pages: [...output.pages, `Maya ${'word '.repeat(1200)}`],
    });
    expect((await PDFDocument.load(files[0]!.bytes)).getPageCount()).toBeGreaterThan(
      output.pages.length + 2,
    );
  });
  it('keeps names readable when a letter has no glyph in the PDF font', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    expect(toWinAnsi('Łucja', font)).toBe('Lucja');
    expect(toWinAnsi('Zoë', font)).toBe('Zoë');
    expect(toWinAnsi('Ștefan', font)).toBe('Stefan');
  });
});
