import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { parkingAppealPrompt, PARKING_NEXT_STEPS } from '../prompts/parking-appeal.ts';
import { OutputParseError } from '../prompts/types.ts';
import { parkingAppealSchema } from '../shared/schemas/parking-appeal.ts';
import {
  buildParkingLetter,
  parkingAppealGenerator,
} from '../netlify/lib/generators/parking-appeal.ts';
import { letterToText } from '../netlify/lib/docs/letter.ts';
import { parkingInputs, parkingOutput } from './fixtures.ts';

describe('parking appeal input schema', () => {
  it('accepts valid inputs', () => {
    expect(parkingAppealSchema.safeParse(parkingInputs).success).toBe(true);
  });
  it('enforces the 1500 character limit on what happened', () => {
    const r = parkingAppealSchema.safeParse({ ...parkingInputs, whatHappened: 'x'.repeat(1501) });
    expect(r.success).toBe(false);
  });
  it('requires at least one ground and a description for "other"', () => {
    expect(parkingAppealSchema.safeParse({ ...parkingInputs, grounds: [] }).success).toBe(false);
    expect(parkingAppealSchema.safeParse({ ...parkingInputs, otherGround: '' }).success).toBe(
      false,
    );
  });
  it('rejects unknown grounds and ticket types', () => {
    expect(parkingAppealSchema.safeParse({ ...parkingInputs, grounds: ['bribery'] }).success).toBe(
      false,
    );
    expect(parkingAppealSchema.safeParse({ ...parkingInputs, ticketType: 'bus' }).success).toBe(
      false,
    );
  });
  it('strips unknown keys', () => {
    const r = parkingAppealSchema.parse({ ...parkingInputs, _test_force_fail: true });
    expect('_test_force_fail' in r).toBe(false);
  });
});

describe('parking appeal prompt builders', () => {
  it('system prompt contains the core safety rules', () => {
    const s = parkingAppealPrompt.buildSystemPrompt();
    expect(s).toMatch(/ONLY the facts the user supplied/);
    expect(s).toMatch(/not legal advice/);
    expect(s).toMatch(/Return ONLY a JSON object/);
    expect(s).toMatch(/do NOT cite specific case names/);
  });
  it('user prompt includes the facts and wraps free text', () => {
    const u = parkingAppealPrompt.buildUserPrompt(parkingInputs) as string;
    expect(u).toContain('EX12345678');
    expect(u).toContain('Council Penalty Charge Notice');
    expect(u).toContain('The payment machine was broken');
    expect(u).toContain('Other: No alternative payment method was signposted');
    expect(u).toContain('<user_account>');
  });
  it('regeneration prompt includes the previous version and the note', () => {
    const u = parkingAppealPrompt.buildUserPrompt(parkingInputs, {
      previous: parkingOutput,
      note: 'make it shorter',
    }) as string;
    expect(u).toContain('make it shorter');
    expect(u).toContain('The machine was broken.');
    expect(u).toMatch(/must not add facts/);
  });
  it('uses the configured token cap', () => {
    expect(parkingAppealPrompt.max_tokens).toBe(2000);
  });
});

describe('parking appeal output parser', () => {
  const good = JSON.stringify(parkingOutput);
  it('parses plain JSON', () => {
    expect(parkingAppealPrompt.parseOutput(good)).toEqual(parkingOutput);
  });
  it('parses JSON wrapped in fences or chatter', () => {
    expect(parkingAppealPrompt.parseOutput('```json\n' + good + '\n```')).toEqual(parkingOutput);
    expect(parkingAppealPrompt.parseOutput('Here you go: ' + good)).toEqual(parkingOutput);
  });
  it('defaults missing suggestions to []', () => {
    const rest: Record<string, unknown> = { ...parkingOutput };
    delete rest.suggestions;
    expect(parkingAppealPrompt.parseOutput(JSON.stringify(rest)).suggestions).toEqual([]);
  });
  it('throws OutputParseError on invalid output', () => {
    expect(() => parkingAppealPrompt.parseOutput('not json')).toThrow(OutputParseError);
    expect(() => parkingAppealPrompt.parseOutput('{"body_paragraphs": "oops"}')).toThrow(
      OutputParseError,
    );
    expect(() =>
      parkingAppealPrompt.parseOutput('{"body_paragraphs": [], "evidence_to_attach": ["a"]}'),
    ).toThrow(OutputParseError);
  });
});

describe('parking appeal documents', () => {
  it('builds the letter header from user inputs, not the AI', () => {
    const l = buildParkingLetter(parkingInputs, parkingOutput, new Date('2026-03-03T10:00:00Z'));
    const text = letterToText(l);
    expect(l.senderLines).toEqual(['Alex Example', '12 Sample Street', 'Exampletown', 'EX1 2MP']);
    expect(text).toContain('3 March 2026');
    expect(text).toContain('Penalty Charge Notice EX12345678');
    expect(text).toContain('AB12 CDE');
    expect(text).toContain('28 February 2026');
    expect(text).toContain('Yours faithfully,');
    expect(l.footer).toContain('This is a letter-writing tool, not legal advice.');
  });
  it('uses private-charge wording for private tickets', () => {
    const l = buildParkingLetter({ ...parkingInputs, ticketType: 'private' }, parkingOutput);
    expect(l.subjectLines[0]).toContain('Parking Charge Notice');
  });
  it('produces a valid PDF and DOCX, and display data with next steps + disclaimer', async () => {
    const { files, display } = await parkingAppealGenerator.build(
      { ...parkingInputs, whatHappened: parkingInputs.whatHappened + ' “smart quotes” – emoji 🚗' },
      {
        ...parkingOutput,
        body_paragraphs: [...parkingOutput.body_paragraphs, 'Long ' + 'word '.repeat(800)],
      },
    );
    const pdf = files.find((f) => f.filename.endsWith('.pdf'))!;
    const docx = files.find((f) => f.filename.endsWith('.docx'))!;
    const doc = await PDFDocument.load(pdf.bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(2); // long text flows onto a new page
    expect(Buffer.from(docx.bytes.slice(0, 2)).toString()).toBe('PK'); // DOCX is a zip
    const d = display as { nextSteps: string[]; disclaimer: string; letterText: string };
    expect(d.nextSteps).toEqual(PARKING_NEXT_STEPS.council);
    expect(d.disclaimer).toBe('This is a letter-writing tool, not legal advice.');
    expect(d.letterText).toContain('Dear Sir or Madam,');
  });
});
