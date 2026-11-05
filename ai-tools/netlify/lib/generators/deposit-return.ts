import {
  DISPUTE_REASONS,
  EVIDENCE_ITEMS,
  depositReturnSchema,
  depositSums,
  gbp,
  type DepositReturnInputs,
} from '../../../shared/schemas/deposit-return.ts';
import {
  DEPOSIT_DISCLAIMER,
  DEPOSIT_REPLY_DAYS,
  LETTER_TYPE_LABEL,
  NATIONS,
  chooseLetterType,
  depositNextSteps,
} from '../../../shared/rules/deposits.ts';
import { depositReturnPrompt, type DepositOutput } from '../../../prompts/deposit-return.ts';
import { letterToText, ukDate, type Letter, type LetterBlock } from '../docs/letter.ts';
import { letterToPdf } from '../docs/pdf.ts';
import { letterToDocx } from '../docs/docx.ts';
import type { ToolGenerator } from './types.ts';

import type { LetterDisplay } from '../../../shared/letter-display.ts';

/** Shape shown on the done page (see src/components/LetterResult.tsx). */
export type DepositDisplay = LetterDisplay;

const isoToUk = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return ukDate(new Date(Date.UTC(y!, m! - 1, d!, 12)));
};
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
const lines = (s: string) => s.split(/\r?\n|,\s*/).filter(Boolean);

export function depositBlocks(inputs: DepositReturnInputs): LetterBlock[] {
  const s = depositSums(inputs);
  const rows: [string, string][] = [
    ['Deposit paid', gbp(inputs.deposit)],
    ...(inputs.returned > 0
      ? [['Already returned', `– ${gbp(inputs.returned)}`] as [string, string]]
      : []),
    ...inputs.deductions
      .filter((d) => d.accept)
      .map((d): [string, string] => [`Deduction accepted: ${d.item}`, `– ${gbp(d.amount)}`]),
    ['Amount now requested', gbp(s.owed)],
  ];
  const blocks: LetterBlock[] = [{ heading: 'Amount requested', rows }];
  const disputed = inputs.deductions.filter((d) => !d.accept);
  if (disputed.length)
    blocks.unshift({
      heading: 'Deductions disputed',
      rows: disputed.map((d): [string, string] => [
        `${d.item} (${DISPUTE_REASONS[d.reason].toLowerCase()})`,
        gbp(d.amount),
      ]),
    });
  return blocks;
}

/** Neutral, code-written closing for a letter before action only. Never predicts an outcome. */
export function beforeActionParagraph(inputs: DepositReturnInputs, deadline: Date): string {
  const s = depositSums(inputs);
  return `If I have not received ${gbp(s.owed)}, or a written reply setting out your position, by ${ukDate(deadline)}, I may take further steps without further notice. This may include applying to ${NATIONS[inputs.nation].claimForum}.`;
}

export function buildDepositLetter(
  inputs: DepositReturnInputs,
  output: DepositOutput,
  date = new Date(),
): Letter {
  const type = chooseLetterType(inputs);
  const deadline = addDays(date, DEPOSIT_REPLY_DAYS);
  const paragraphs = [...output.body_paragraphs];
  if (type === 'before_action') paragraphs.push(beforeActionParagraph(inputs, deadline));
  return {
    senderLines: [inputs.tenantName, ...lines(inputs.tenantAddress)],
    dateLine: ukDate(date),
    recipientLines: [inputs.landlordName, ...lines(inputs.landlordAddress)],
    subjectLines: [
      `Re: ${LETTER_TYPE_LABEL[type]} – ${lines(inputs.propertyAddress)[0]}`,
      `Tenancy from ${isoToUk(inputs.tenancyStart)}; moved out ${isoToUk(inputs.moveOut)} · Reply by ${ukDate(deadline)}`,
    ],
    salutation: 'Dear ' + inputs.landlordName + ',',
    paragraphs,
    blocks: depositBlocks(inputs),
    signOff: 'Yours sincerely,',
    signature: inputs.tenantName,
    footer: DEPOSIT_DISCLAIMER,
    appendix: [
      {
        heading: 'Next steps (for you – not part of the letter)',
        lines: depositNextSteps(inputs.nation, inputs.protectedStatus),
      },
      {
        heading: 'Evidence checklist',
        lines: Object.entries(EVIDENCE_ITEMS).map(
          ([k, label]) => `${inputs.evidence.includes(k as never) ? '[x]' : '[ ]'} ${label}`,
        ),
      },
    ],
  };
}

export const depositReturnGenerator: ToolGenerator<DepositReturnInputs, DepositOutput> = {
  inputSchema: depositReturnSchema as never,
  prompt: depositReturnPrompt,
  async build(inputs, output) {
    const letter = buildDepositLetter(inputs, output);
    const type = chooseLetterType(inputs);
    const s = depositSums(inputs);
    const title = 'Deposit return letter';
    const [pdf, docx] = await Promise.all([
      letterToPdf(letter, title),
      letterToDocx(letter, title),
    ]);
    const display: DepositDisplay = {
      letterText: letterToText(letter),
      headline: LETTER_TYPE_LABEL[type],
      figures: [
        { label: 'Deposit paid', value: gbp(inputs.deposit) },
        { label: 'Deductions disputed', value: gbp(s.disputed) },
        { label: 'Amount requested', value: gbp(s.owed) },
      ],
      checklist: Object.entries(EVIDENCE_ITEMS).map(([k, item]) => ({
        item,
        have: inputs.evidence.includes(k as never),
      })),
      evidence: output.evidence_to_gather,
      nextSteps: depositNextSteps(inputs.nation, inputs.protectedStatus),
      disclaimer: DEPOSIT_DISCLAIMER,
    };
    return {
      display,
      files: [
        {
          filename: 'deposit-letter.pdf',
          label: 'Download PDF',
          contentType: 'application/pdf',
          bytes: pdf,
        },
        {
          filename: 'deposit-letter.docx',
          label: 'Download Word',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          bytes: docx,
        },
      ],
    };
  },
};
