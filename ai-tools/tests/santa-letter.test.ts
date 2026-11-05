import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { santaLetterSchema } from '../shared/schemas/santa-letter.ts';
import {
  SANTA_SIGNATURE,
  letterWords,
  santaLetterPrompt,
  santaProblems,
} from '../prompts/santa-letter.ts';
import { OutputParseError } from '../prompts/types.ts';
import { santaLetterGenerator } from '../netlify/lib/generators/santa-letter.ts';
import { GENERATORS } from '../netlify/lib/generators/index.ts';
import { TOOLS, isInSeason, navTools, ukMonthDay } from '../shared/tools.ts';
import { SAMPLE_INPUTS } from '../scripts/sample-inputs.ts';
import sample from '../src/samples/santa-letter.json';

const inputs = santaLetterSchema.parse(SAMPLE_INPUTS['santa-letter']);
const output = { paragraphs: sample.paragraphs, postscript: sample.postscript };
const raw = (o: unknown) => JSON.stringify(o);
const santa = TOOLS['santa-letter'];
/** Noon UTC on a given day of 2026 (UK is UTC or UTC+1, so the UK date is the same). */
const day = (m: number, d: number) => new Date(Date.UTC(2026, m - 1, d, 12));

describe('santa letter input schema', () => {
  it('accepts valid inputs, drops blank good things and defaults optionals', () => {
    const r = santaLetterSchema.parse({
      childName: 'Zoë',
      ageBand: '2-4',
      goodThings: ['tidied up', '', ''],
      tone: 'cosy',
    });
    expect(r.goodThings).toEqual(['tidied up']);
    expect(r).toMatchObject({ encouragement: '', siblingName: '', petName: '', presentHint: '' });
  });
  it('first names only (same rule as the bedtime story)', () => {
    for (const childName of ['Mary-Jane', "D'Arcy", 'Siân'])
      expect(santaLetterSchema.safeParse({ ...inputs, childName }).success).toBe(true);
    for (const childName of ['', 'oli@example.com', 'Oliver 2', 'x'.repeat(31)])
      expect(santaLetterSchema.safeParse({ ...inputs, childName }).success).toBe(false);
    expect(santaLetterSchema.safeParse({ ...inputs, siblingName: 'Rosie 7' }).success).toBe(false);
    expect(santaLetterSchema.safeParse({ ...inputs, petName: '' }).success).toBe(true);
  });
  it('needs 1 to 3 good things, an age band and a tone', () => {
    expect(santaLetterSchema.safeParse({ ...inputs, goodThings: ['', ''] }).success).toBe(false);
    expect(
      santaLetterSchema.safeParse({ ...inputs, goodThings: ['a', 'b', 'c', 'd'] }).success,
    ).toBe(false);
    expect(santaLetterSchema.safeParse({ ...inputs, ageBand: '11-13' }).success).toBe(false);
    expect(santaLetterSchema.safeParse({ ...inputs, tone: 'spooky' }).success).toBe(false);
  });
});

describe('santa letter prompt', () => {
  it('system prompt has the safety rules', () => {
    const s = santaLetterPrompt.buildSystemPrompt();
    expect(s).toMatch(/NEVER promise a specific present/);
    expect(s).toMatch(/NEVER mention money/);
    expect(s).toMatch(/other children/);
    expect(s).toMatch(/Nothing scary/);
    expect(s).toMatch(/British English/);
    expect(s).toMatch(/120 and 350 words/);
    expect(s).toMatch(/Return ONLY a JSON object/);
  });
  it('user prompt includes every supplied detail, and the hint as never-promise', () => {
    const u = santaLetterPrompt.buildUserPrompt(inputs) as string;
    for (const t of [
      'Oliver',
      'Age 5–7',
      '"learned to ride his bike by himself"',
      'Rosie',
      'Pickle',
      'Magical',
    ])
      expect(u).toContain(t);
    expect(u).toMatch(/space rocket.*|NEVER promise/);
    expect(u).toContain('NEVER promise');
  });
  it('omits optional lines that were left blank', () => {
    const u = santaLetterPrompt.buildUserPrompt({
      ...inputs,
      siblingName: '',
      petName: '',
      presentHint: '',
      encouragement: '',
    }) as string;
    expect(u).not.toMatch(/Sibling|Pet|Present hint|encouragement/);
  });
  it('regeneration includes the note and the previous letter', () => {
    const u = santaLetterPrompt.buildUserPrompt(inputs, {
      previous: output,
      note: 'mention snow',
    }) as string;
    expect(u).toContain('mention snow');
    expect(u).toContain('Rudolph says thank you');
  });
  it('max_tokens is 1500', () => expect(santaLetterPrompt.max_tokens).toBe(1500));
});

describe('santa letter parser and honesty checks', () => {
  it('accepts the sample letter (120–350 words, mentions the name)', () => {
    expect(letterWords(output)).toBeGreaterThanOrEqual(120);
    expect(letterWords(output)).toBeLessThanOrEqual(350);
    expect(santaLetterPrompt.parseOutput(raw(output), inputs)).toEqual(output);
  });
  it('rejects a letter without the child’s name', () => {
    const noName = {
      ...output,
      paragraphs: output.paragraphs.map((p) => p.replaceAll('Oliver', 'you')),
    };
    expect(() => santaLetterPrompt.parseOutput(raw(noName), inputs)).toThrow(OutputParseError);
  });
  it('rejects too short and too long letters', () => {
    expect(() =>
      santaLetterPrompt.parseOutput(
        raw({ paragraphs: ['Hello Oliver.', 'Merry Christmas!'] }),
        inputs,
      ),
    ).toThrow(/too short/);
    const long = { ...output, paragraphs: [...output.paragraphs, 'snow '.repeat(170)] };
    expect(() => santaLetterPrompt.parseOutput(raw(long), inputs)).toThrow(/too long/);
  });
  const withLine = (line: string) => ({
    ...output,
    paragraphs: [...output.paragraphs.slice(0, 4), line],
  });
  it.each([
    ['I will bring you a space rocket on Christmas Eve.', 'promised present'],
    ["You'll find a bike under the tree.", 'promised present'],
    ['The elves made it for less than £10.', 'money'],
    ['It cost the elves a lot of money.', 'money'],
    ['You were better than the other children in your class.', 'other children'],
    ['Remember, I am always watching you.', 'scary'],
    ['Be good, or there will be coal in your stocking.', 'scary'],
    ['Leave out some cookies for me!', 'American English'],
  ])('rejects: %s', (line, label) => {
    const problems = santaProblems(withLine(line), inputs);
    expect(problems.join(' ')).toMatch(new RegExp(label.split(' ')[0]!, 'i'));
    expect(() => santaLetterPrompt.parseOutput(raw(withLine(line)), inputs)).toThrow(
      OutputParseError,
    );
  });
  it('rejects malformed JSON', () => {
    expect(() => santaLetterPrompt.parseOutput('{"paragraphs":[]}', inputs)).toThrow(
      OutputParseError,
    );
  });
});

describe('santa letter PDF and display', () => {
  it('is registered as a generator', () => {
    expect(GENERATORS['santa-letter']).toBe(santaLetterGenerator);
  });
  it('builds a 3-page A4 PDF signed Father Christmas, without the name in the file name', async () => {
    const { files, display } = await santaLetterGenerator.build(inputs, output);
    expect(files).toHaveLength(1);
    expect(files[0]!.filename).toBe('letter-from-santa.pdf');
    expect(files[0]!.filename).not.toContain('Oliver');
    const doc = await PDFDocument.load(files[0]!.bytes);
    expect(doc.getPageCount()).toBe(3);
    expect(Math.round(doc.getPage(0).getWidth())).toBe(595);
    expect(Math.round(doc.getPage(0).getHeight())).toBe(842);
    expect(display).toMatchObject({
      childName: 'Oliver',
      greeting: 'Dear Oliver,',
      signature: SANTA_SIGNATURE,
      postscript: output.postscript,
    });
    expect(SANTA_SIGNATURE).toBe('Father Christmas');
  });
  it('copes with names the PDF font cannot draw and a letter at the word limit', async () => {
    const { files } = await santaLetterGenerator.build(
      { ...inputs, childName: 'Łucja' },
      { paragraphs: ['Łucja '.concat('snow '.repeat(340)), 'Merry Christmas'], postscript: '' },
    );
    expect((await PDFDocument.load(files[0]!.bytes)).getPageCount()).toBe(3);
  });
});

describe('santa letter seasonal switch', () => {
  it('dates live in shared/tools.ts: 1 October to 24 December', () => {
    expect(santa.season).toMatchObject({ from: [10, 1], to: [12, 24] });
    expect(santa.season?.offSeasonNote).toMatch(/back next Christmas/i);
  });
  it.each([
    [10, 1, true],
    [11, 4, true],
    [12, 24, true],
    [12, 25, false],
    [1, 15, false],
    [9, 30, false],
  ])('%i/%i in season: %s', (m, d, expected) => {
    expect(isInSeason(santa, day(m, d))).toBe(expected);
    expect(navTools(day(m, d)).some((t) => t.id === 'santa-letter')).toBe(expected);
  });
  it('uses UK dates (late on 24 Dec UTC is still Christmas Eve in the UK)', () => {
    expect(ukMonthDay(new Date(Date.UTC(2026, 11, 24, 23, 30)))).toEqual([12, 24]);
    // In summer the UK is UTC+1: 23:30 UTC on 30 Sep is already 1 Oct in the UK.
    expect(isInSeason(santa, new Date(Date.UTC(2026, 8, 30, 23, 30)))).toBe(true);
  });
  it('non-seasonal tools are always in season and always in the nav', () => {
    expect(isInSeason(TOOLS['bedtime-story'], day(7, 1))).toBe(true);
    expect(navTools(day(7, 1)).map((t) => t.id)).toContain('bedtime-story');
  });
  it('the landing page stays live (route kept) even out of season', () => {
    expect(santa.live).toBe(true);
  });
});
