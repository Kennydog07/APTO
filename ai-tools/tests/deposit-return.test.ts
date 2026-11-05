import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
  DEPOSIT_DISCLAIMER,
  NATIONS,
  chooseLetterType,
  depositNextSteps,
} from '../shared/rules/deposits.ts';
import { depositReturnSchema, depositSums } from '../shared/schemas/deposit-return.ts';
import { depositFacts, depositReturnPrompt } from '../prompts/deposit-return.ts';
import { OutputParseError } from '../prompts/types.ts';
import {
  beforeActionParagraph,
  buildDepositLetter,
  depositReturnGenerator,
} from '../netlify/lib/generators/deposit-return.ts';
import { GENERATORS } from '../netlify/lib/generators/index.ts';
import { letterToText } from '../netlify/lib/docs/letter.ts';
import { SAMPLE_INPUTS } from '../scripts/sample-inputs.ts';
import sample from '../src/samples/deposit-return.json';

const inputs = depositReturnSchema.parse(SAMPLE_INPUTS['deposit-return']);
const raw = (o: object) => JSON.stringify({ ...sample, ...o });

describe('letter type is chosen by code', () => {
  it('request, dispute or letter before action', () => {
    expect(chooseLetterType({ timesAsked: 'none', protectedStatus: 'yes', deductions: [] })).toBe(
      'request',
    );
    expect(
      chooseLetterType({ timesAsked: 'once', protectedStatus: 'unknown', deductions: [{}] }),
    ).toBe('dispute');
    expect(chooseLetterType({ timesAsked: 'twice', protectedStatus: 'yes', deductions: [] })).toBe(
      'before_action',
    );
    expect(chooseLetterType({ timesAsked: 'none', protectedStatus: 'no', deductions: [{}] })).toBe(
      'before_action',
    );
  });
});

describe('deposit rules config', () => {
  it('has verified per-nation facts with sources', () => {
    expect(NATIONS.england.protectWithin).toContain('30 days');
    expect(NATIONS.england.returnRule).toContain('10 days');
    expect(NATIONS.scotland.protectWithin).toContain('30 working days');
    expect(NATIONS.scotland.unprotected).toContain('3 months');
    expect(NATIONS.ni.protectWithin).toContain('28 days');
    expect(NATIONS.ni.schemes).toHaveLength(2);
    for (const n of Object.values(NATIONS))
      expect(n.sources.every((s) => s.startsWith('https://'))).toBe(true);
  });
  it('only adds unprotected-deposit steps when it may not be protected', () => {
    expect(depositNextSteps('england', 'yes').join(' ')).not.toContain('1 and 3 times');
    expect(depositNextSteps('england', 'unknown').join(' ')).toContain('1 and 3 times');
  });
});

describe('deposit sums and schema', () => {
  it('subtracts returned money and accepted deductions only', () => {
    expect(depositSums(inputs)).toEqual({ accepted: 25, disputed: 530, owed: 1125 });
  });
  it('rejects a fully returned deposit, more than 10 deductions and move-out before start', () => {
    const base = SAMPLE_INPUTS['deposit-return'];
    expect(depositReturnSchema.safeParse({ ...base, returned: 1150 }).success).toBe(false);
    expect(depositReturnSchema.safeParse({ ...base, moveOut: '2024-01-01' }).success).toBe(false);
    const d = base.deductions[0];
    expect(depositReturnSchema.safeParse({ ...base, deductions: Array(11).fill(d) }).success).toBe(
      false,
    );
    expect(depositReturnSchema.safeParse({ ...base, extra: 'x'.repeat(1501) }).success).toBe(false);
  });
});

describe('deposit prompt', () => {
  it('passes the code-chosen letter type and amount', () => {
    const f = depositFacts(inputs);
    expect(f).toContain('Dispute of proposed deductions');
    expect(f).toContain('£1,125.00');
    expect(depositReturnPrompt.buildSystemPrompt()).toMatch(/NEVER mention courts/);
  });
  it('rejects court threats and outcome predictions', () => {
    expect(
      depositReturnPrompt.parseOutput(JSON.stringify(sample), inputs).body_paragraphs,
    ).toHaveLength(5);
    for (const bad of [
      'Otherwise I will take you to court.',
      'A tribunal would award me three times the deposit.',
      'The adjudicator will find in my favour.',
    ])
      expect(() =>
        depositReturnPrompt.parseOutput(
          raw({ body_paragraphs: [...sample.body_paragraphs, bad] }),
          inputs,
        ),
      ).toThrow(OutputParseError);
  });
});

describe('deposit documents', () => {
  it('adds neutral before-action wording only to a letter before action', () => {
    const lba = depositReturnSchema.parse({
      ...SAMPLE_INPUTS['deposit-return'],
      timesAsked: 'twice',
    });
    const t = letterToText(buildDepositLetter(lba, sample));
    expect(t).toContain('Re: Letter before action');
    expect(t).toContain('may include applying to the county court');
    expect(beforeActionParagraph({ ...lba, nation: 'scotland' }, new Date())).toContain(
      'First-tier Tribunal',
    );
    const normal = letterToText(buildDepositLetter(inputs, sample));
    expect(normal).not.toMatch(/court|tribunal/i);
    expect(normal).toContain('Amount now requested: £1,125.00');
    expect(normal).toContain('Repainting the living room (fair wear and tear): £350.00');
  });
  it('generates a PDF and Word file with checklist and disclaimer, and is registered', async () => {
    expect(GENERATORS['deposit-return']).toBe(depositReturnGenerator);
    const out = await depositReturnGenerator.build(inputs, sample);
    expect(out.files.map((f) => f.filename)).toEqual(['deposit-letter.pdf', 'deposit-letter.docx']);
    const d = out.display as {
      checklist: { have: boolean }[];
      disclaimer: string;
      headline: string;
    };
    expect(d.checklist.filter((c) => !c.have)).toHaveLength(2);
    expect(d.disclaimer).toBe(DEPOSIT_DISCLAIMER);
    expect(d.headline).toBe('Dispute of proposed deductions');
    const pdf = await PDFDocument.load(out.files[0]!.bytes);
    // sample letter fits on page 1 (sign-off included); page 2 is the next-steps appendix
    expect(pdf.getPageCount()).toBe(2);
  });
});
