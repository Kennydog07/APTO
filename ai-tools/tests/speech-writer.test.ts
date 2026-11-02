import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { speechWriterSchema, targetWords } from '../shared/schemas/speech-writer.ts';
import { speechWordCount, speechWriterPrompt } from '../prompts/speech-writer.ts';
import { OutputParseError } from '../prompts/types.ts';
import { buildSpeechDoc, speechWriterGenerator } from '../netlify/lib/generators/speech-writer.ts';
import { SAMPLE_INPUTS } from '../scripts/sample-inputs.ts';
import sample from '../src/samples/speech-writer.json';

const raw = SAMPLE_INPUTS['speech-writer'];
const inputs = speechWriterSchema.parse(raw);
const output = {
  title: sample.title,
  speech_paragraphs: sample.speechText.split('\n\n'),
  cue_cards: sample.cueCards,
};

describe('speech input schema', () => {
  it('accepts valid inputs and drops blank anecdotes', () => {
    const r = speechWriterSchema.parse({ ...raw, anecdotes: ['one', '', 'two', '', ''] });
    expect(r.anecdotes).toEqual(['one', 'two']);
  });
  it('needs 2 to 5 anecdotes of up to 600 characters', () => {
    expect(speechWriterSchema.safeParse({ ...raw, anecdotes: ['only one'] }).success).toBe(false);
    expect(
      speechWriterSchema.safeParse({ ...raw, anecdotes: ['a', 'b', 'c', 'd', 'e', 'f'] }).success,
    ).toBe(false);
    expect(
      speechWriterSchema.safeParse({ ...raw, anecdotes: ['a', 'x'.repeat(601)] }).success,
    ).toBe(false);
  });
  it('only allows 3, 5 or 8 minutes', () => {
    expect(speechWriterSchema.safeParse({ ...raw, minutes: 4 }).success).toBe(false);
    expect(speechWriterSchema.safeParse({ ...raw, minutes: 8 }).success).toBe(true);
  });
  it('does not allow a "funny" eulogy', () => {
    expect(
      speechWriterSchema.safeParse({ ...raw, speechType: 'eulogy', tone: 'funny' }).success,
    ).toBe(false);
    expect(
      speechWriterSchema.safeParse({ ...raw, speechType: 'eulogy', tone: 'balanced' }).success,
    ).toBe(true);
  });
  it('130 words per minute', () => {
    expect(targetWords(3)).toBe(390);
    expect(targetWords(8)).toBe(1040);
  });
});

describe('speech prompt', () => {
  it('system prompt has the core rules', () => {
    const s = speechWriterPrompt.buildSystemPrompt();
    expect(s).toMatch(/Do NOT invent new facts/);
    expect(s).toMatch(/clean and inclusive/);
    expect(s).toMatch(/\[pause\]/);
    expect(s).toMatch(/Return ONLY a JSON object/);
  });
  it('user prompt includes the brief, all anecdotes and things to avoid', () => {
    const u = speechWriterPrompt.buildUserPrompt(inputs) as string;
    expect(u).toContain('Best man');
    expect(u).toContain('Jordan');
    expect(u).toContain('Sam and Priya');
    expect(u).toContain('about 390 words');
    expect(u).toContain('wrong classroom');
    expect(u).toContain('<anecdote 3>');
    expect(u).toContain('No jokes about exes');
  });
  it('eulogy tone is never jokey', () => {
    const u = speechWriterPrompt.buildUserPrompt({
      ...inputs,
      speechType: 'eulogy',
      tone: 'balanced',
    }) as string;
    expect(u).toMatch(/Never jokey/);
    expect(u).toMatch(/Never make light of the death/);
  });
  it('regeneration keeps the no-invention rule', () => {
    const u = speechWriterPrompt.buildUserPrompt(inputs, {
      previous: output,
      note: 'shorter intro',
    }) as string;
    expect(u).toContain('shorter intro');
    expect(u).toMatch(/no invented facts/);
  });
  it('max_tokens is 3500', () => expect(speechWriterPrompt.max_tokens).toBe(3500));
});

describe('speech parser', () => {
  it('parses a valid speech of roughly the right length', () => {
    expect(
      speechWriterPrompt.parseOutput(JSON.stringify(output), { ...inputs, minutes: 3 }),
    ).toEqual(output);
  });
  it('rejects a speech far shorter than requested', () => {
    expect(() =>
      speechWriterPrompt.parseOutput(JSON.stringify(output), { ...inputs, minutes: 8 }),
    ).toThrow(OutputParseError);
  });
  it('rejects missing cue cards', () => {
    const { cue_cards: _c, ...noCards } = output;
    expect(() => speechWriterPrompt.parseOutput(JSON.stringify(noCards))).toThrow(OutputParseError);
  });
  it('does not count [pause] markers as words', () => {
    expect(speechWordCount(['Hello [pause] there', 'friends'])).toBe(3);
  });
});

describe('speech documents', () => {
  it('builds a large-print PDF with cue card pages, a DOCX and display data', async () => {
    const { files, display } = await speechWriterGenerator.build(inputs, output);
    const pdf = files.find((f) => f.filename === 'speech.pdf')!;
    const docx = files.find((f) => f.filename === 'speech.docx')!;
    const doc = await PDFDocument.load(pdf.bytes);
    // reading copy (>=1 page) + 5 cue cards at 2 per page (3 pages)
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(4);
    expect(Buffer.from(docx.bytes.slice(0, 2)).toString()).toBe('PK');
    expect(display).toMatchObject({ title: sample.title, cueCards: sample.cueCards });
    expect((display as { wordCount: number }).wordCount).toBe(
      speechWordCount(output.speech_paragraphs),
    );
  });
  it('subtitle states the speech type and estimated minutes', () => {
    expect(buildSpeechDoc(inputs, output).subtitle).toBe('Best man speech · about 2 minutes');
  });
});
