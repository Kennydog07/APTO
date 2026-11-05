import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
  chooseRight,
  daysBetween,
  paymentNote,
  withinMonths,
} from '../shared/rules/consumer-rights.ts';
import { refundLetterSchema } from '../shared/schemas/refund-letter.ts';
import { refundFacts, refundLetterPrompt } from '../prompts/refund-letter.ts';
import { OutputParseError } from '../prompts/types.ts';
import {
  buildRefundLetter,
  refundLetterGenerator,
} from '../netlify/lib/generators/refund-letter.ts';
import { refundRecipientLines } from '../netlify/lib/generators/refund-letter.ts';
import { GENERATORS } from '../netlify/lib/generators/index.ts';
import { letterToText } from '../netlify/lib/docs/letter.ts';
import { SAMPLE_INPUTS } from '../scripts/sample-inputs.ts';
import sample from '../src/samples/refund-letter.json';

const today = new Date('2026-11-05T12:00:00Z');
const inputs = refundLetterSchema.parse(SAMPLE_INPUTS['refund-letter']);
const pick = (date: string, o: Partial<Parameters<typeof chooseRight>[0]> = {}) =>
  chooseRight({ type: 'faulty', date, boughtOnline: false, repairAttempted: false, today, ...o })
    .key;

describe('consumer right is chosen by code from the dates', () => {
  it('counts days and calendar months', () => {
    expect(daysBetween('2026-10-06', today)).toBe(30);
    expect(withinMonths('2026-05-05', today, 6)).toBe(true);
    expect(withinMonths('2026-05-04', today, 6)).toBe(false);
  });
  it('faulty: 30-day reject, then repair/replace within 6 months, then final reject', () => {
    expect(pick('2026-10-06')).toBe('short_term_reject');
    expect(pick('2026-10-05')).toBe('repair_or_replace');
    expect(pick('2026-10-05', { repairAttempted: true })).toBe('final_reject');
    expect(pick('2026-05-04')).toBe('repair_after_6_months');
    expect(pick('2019-01-01')).toBe('possibly_out_of_time');
  });
  it('mentions the 14-day online cancellation only when it applies', () => {
    const r = chooseRight({
      type: 'faulty',
      date: '2026-10-30',
      boughtOnline: true,
      repairAttempted: false,
      today,
    });
    expect(r.nextSteps.join(' ')).toContain('14 days');
    const r2 = chooseRight({
      type: 'faulty',
      date: '2026-10-30',
      boughtOnline: false,
      repairAttempted: false,
      today,
    });
    expect(r2.nextSteps.join(' ')).not.toContain('cancel');
  });
  it('covers delivery, services and energy', () => {
    expect(pick('2026-10-01', { type: 'not_delivered' })).toBe('non_delivery');
    expect(pick('2026-10-01', { type: 'poor_service' })).toBe('services');
    const e = chooseRight({
      type: 'energy_bill',
      date: '2026-10-01',
      boughtOnline: false,
      repairAttempted: false,
      today,
    });
    expect(e.summary).toContain('8 weeks');
    expect(e.nextSteps.join(' ')).toContain('12 months');
  });
  it('Section 75 only for credit card purchases over £100 up to £30,000', () => {
    expect(paymentNote('credit', 100)).toContain('chargeback');
    expect(paymentNote('credit', 100.01)).toContain('Section 75');
    expect(paymentNote('credit', 30000)).toContain('Section 75');
    expect(paymentNote('credit', 30000.01)).toContain('chargeback');
    expect(paymentNote('debit', 500)).toContain('chargeback');
    expect(paymentNote('paypal', 50)).toContain('PayPal');
    expect(paymentNote('other', 50)).toBeNull();
  });
});

describe('refund prompt', () => {
  it('passes the chosen right and its points', () => {
    const f = refundFacts(inputs, today);
    expect(f).toContain('within 6 months');
    expect(f).toContain('one opportunity to repair or replace');
  });
  it('parses the sample and rejects threats, section numbers and case law', () => {
    expect(refundLetterPrompt.parseOutput(JSON.stringify(sample)).body_paragraphs).toHaveLength(4);
    for (const bad of [
      'I will see you in the small claims court.',
      'Under section 23 you must...',
      'As in Smith v Jones...',
    ])
      expect(() =>
        refundLetterPrompt.parseOutput(
          JSON.stringify({ ...sample, body_paragraphs: [...sample.body_paragraphs, bad] }),
        ),
      ).toThrow(OutputParseError);
  });
  it('validates the form', () => {
    const base = SAMPLE_INPUTS['refund-letter'];
    expect(refundLetterSchema.safeParse({ ...base, problem: '' }).success).toBe(false);
    expect(refundLetterSchema.safeParse({ ...base, date: '2999-01-01' }).success).toBe(false);
    expect(refundLetterSchema.safeParse({ ...base, outcome: 'cash' }).success).toBe(false);
  });
});

describe('refund documents', () => {
  it('adds the outcome and 14-day reply date by code', () => {
    const t = letterToText(buildRefundLetter(inputs, sample, today));
    expect(t).toContain('I would like a replacement. Please reply in writing by 19 November 2026');
    expect(t).toContain('Reference: ORD-48213');
  });
  it('generates a PDF and Word file and is registered', async () => {
    expect(GENERATORS['refund-letter']).toBe(refundLetterGenerator);
    const out = await refundLetterGenerator.build(inputs, sample);
    expect(out.files.map((f) => f.filename)).toEqual(['refund-letter.pdf', 'refund-letter.docx']);
    expect((out.display as { disclaimer: string }).disclaimer).toBe(
      'This is a letter-writing tool, not legal advice.',
    );
    const pdf = await PDFDocument.load(out.files[0]!.bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(2);
  });
});

describe('refund recipient block', () => {
  it('adds a complaints line only when the address has no department', () => {
    expect(refundRecipientLines('Shop Ltd', 'Customer Relations, 20 Trade Park, EX4 5EF')).toEqual([
      'Shop Ltd',
      'Customer Relations',
      '20 Trade Park',
      'EX4 5EF',
    ]);
    expect(refundRecipientLines('Shop Ltd', 'Shop Ltd\n20 Trade Park')).toEqual([
      'Shop Ltd',
      'Customer Services – Complaints',
      '20 Trade Park',
    ]);
  });
});
