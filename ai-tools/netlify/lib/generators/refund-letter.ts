import {
  COMPLAINT_TYPES,
  DATE_LABEL,
  OUTCOMES,
  refundLetterSchema,
  type RefundLetterInputs,
} from '../../../shared/schemas/refund-letter.ts';
import {
  REFUND_DISCLAIMER,
  REPLY_DAYS,
  paymentNote,
} from '../../../shared/rules/consumer-rights.ts';
import {
  refundLetterPrompt,
  refundRight,
  type RefundOutput,
} from '../../../prompts/refund-letter.ts';
import { letterToText, ukDate, type Letter } from '../docs/letter.ts';
import { letterToPdf } from '../docs/pdf.ts';
import { letterToDocx } from '../docs/docx.ts';
import type { LetterDisplay } from '../../../shared/letter-display.ts';
import type { ToolGenerator } from './types.ts';

const isoToUk = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return ukDate(new Date(Date.UTC(y!, m! - 1, d!, 12)));
};
const lines = (s: string) => s.split(/\r?\n|,\s*/).filter(Boolean);
const gbp = (n: number) =>
  `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function refundNextSteps(inputs: RefundLetterInputs, today = new Date()): string[] {
  const r = refundRight(inputs, today);
  const pay = paymentNote(inputs.paymentMethod, inputs.price);
  return [
    ...r.nextSteps,
    ...(pay ? [pay] : []),
    'Free help: Citizens Advice consumer helpline (England, Wales, Scotland), or Consumerline in Northern Ireland.',
  ];
}

export function buildRefundLetter(
  inputs: RefundLetterInputs,
  output: RefundOutput,
  date = new Date(),
): Letter {
  const deadline = new Date(date.getTime() + REPLY_DAYS * 86_400_000);
  return {
    senderLines: [inputs.customerName, ...lines(inputs.customerAddress)],
    dateLine: ukDate(date),
    recipientLines: refundRecipientLines(inputs.companyName, inputs.companyAddress),
    subjectLines: [
      `Re: Complaint – ${COMPLAINT_TYPES[inputs.complaintType].toLowerCase()}: ${inputs.item}`,
      `${inputs.orderRef ? `Reference: ${inputs.orderRef} · ` : ''}${DATE_LABEL[inputs.complaintType]}: ${isoToUk(inputs.date)} · Price: ${gbp(inputs.price)}`,
    ],
    salutation: 'Dear Sir or Madam,',
    paragraphs: [
      ...output.body_paragraphs,
      `I would like ${OUTCOMES[inputs.outcome].replace(/^A /, 'a ').replace(/^The /, 'the ')}. Please reply in writing by ${ukDate(deadline)}, which is ${REPLY_DAYS} days from the date of this letter.`,
    ],
    signOff: 'Yours faithfully,',
    signature: inputs.customerName,
    footer: REFUND_DISCLAIMER,
    appendix: [
      { heading: 'The right this letter uses', lines: [refundRight(inputs, date).summary] },
      {
        heading: 'Next steps (for you – not part of the letter)',
        lines: refundNextSteps(inputs, date),
      },
    ],
  };
}

export const refundLetterGenerator: ToolGenerator<RefundLetterInputs, RefundOutput> = {
  inputSchema: refundLetterSchema as never,
  prompt: refundLetterPrompt,
  async build(inputs, output) {
    const letter = buildRefundLetter(inputs, output);
    const title = 'Refund and complaint letter';
    const [pdf, docx] = await Promise.all([
      letterToPdf(letter, title),
      letterToDocx(letter, title),
    ]);
    const display: LetterDisplay = {
      letterText: letterToText(letter),
      headline: refundRight(inputs).summary,
      figures: [
        { label: 'Price paid', value: gbp(inputs.price) },
        { label: 'You’re asking for', value: OUTCOMES[inputs.outcome] },
        { label: 'Reply within', value: `${REPLY_DAYS} days` },
      ],
      evidence: output.evidence_to_keep,
      nextSteps: refundNextSteps(inputs),
      disclaimer: REFUND_DISCLAIMER,
    };
    return {
      display,
      files: [
        {
          filename: 'refund-letter.pdf',
          label: 'Download PDF',
          contentType: 'application/pdf',
          bytes: pdf,
        },
        {
          filename: 'refund-letter.docx',
          label: 'Download Word',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          bytes: docx,
        },
      ],
    };
  },
};

const DEPARTMENT_RE =
  /\b(customer|complaints?|relations|services?|care|department|dept|team|attn|f\.?a\.?o)\b/i;

/**
 * Company name, a complaints department line, then the address. If the buyer's address already
 * starts with a department (e.g. "Customer Relations"), don't add a second one, and drop an address
 * line that just repeats the company name.
 */
export function refundRecipientLines(companyName: string, companyAddress: string): string[] {
  const norm = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  const addr = lines(companyAddress).filter((l) => norm(l) !== norm(companyName));
  const hasDept = addr.length > 0 && !/\d/.test(addr[0]!) && DEPARTMENT_RE.test(addr[0]!);
  return [companyName, ...(hasDept ? [] : ['Customer Services – Complaints']), ...addr];
}
