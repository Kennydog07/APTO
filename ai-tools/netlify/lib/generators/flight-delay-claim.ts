import {
  EXPENSE_TYPES,
  expensesTotal,
  flightDelayClaimSchema,
  flightFacts,
  type FlightDelayClaimInputs,
} from '../../../shared/schemas/flight-delay-claim.ts';
import {
  FLIGHT_DISCLAIMER,
  FLIGHT_NEXT_STEPS,
  checkEligibility,
  flightNotSellableReason,
  money,
  type Eligibility,
} from '../../../shared/rules/flight-compensation.ts';
import {
  flightDelayClaimPrompt,
  type FlightClaimOutput,
} from '../../../prompts/flight-delay-claim.ts';
import { letterToText, ukDate, type Letter, type LetterBlock } from '../docs/letter.ts';
import { letterToPdf } from '../docs/pdf.ts';
import { letterToDocx } from '../docs/docx.ts';
import type { ToolGenerator } from './types.ts';

/** Shape shown on the done page (see src/tools/flight-delay-claim/Result.tsx). */
export interface FlightClaimDisplay {
  letterText: string;
  claim: { perPassenger: string; total: string; passengers: number; expenses: string };
  evidence: string[];
  nextSteps: string[];
  disclaimer: string;
}

const isoToUk = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return ukDate(new Date(Date.UTC(y!, m! - 1, d!, 12)));
};

export function claimBlocks(inputs: FlightDelayClaimInputs, e: Eligibility): LetterBlock[] {
  const blocks: LetterBlock[] = [];
  if (e.perPassenger > 0)
    blocks.push({
      heading: 'Compensation claimed',
      rows: [
        ...inputs.passengers.map((p): [string, string] => [p, money(e.currency, e.perPassenger)]),
        ['Total compensation', money(e.currency, e.total)],
      ],
    });
  if (inputs.expenses.length)
    blocks.push({
      heading: 'Expenses claimed',
      rows: [
        ...inputs.expenses.map((x): [string, string] => [
          `${EXPENSE_TYPES[x.type]}${x.description ? ` – ${x.description}` : ''} (${x.receipt ? 'receipt attached' : 'no receipt'})`,
          money('£', x.amount),
        ]),
        ['Total expenses', money('£', expensesTotal(inputs.expenses))],
      ],
    });
  return blocks;
}

export function buildFlightLetter(
  inputs: FlightDelayClaimInputs,
  output: FlightClaimOutput,
  date = new Date(),
): Letter {
  const e = checkEligibility(flightFacts(inputs));
  const what =
    inputs.what === 'delayed'
      ? 'delayed flight'
      : inputs.what === 'cancelled'
        ? 'cancelled flight'
        : 'denied boarding';
  return {
    senderLines: [
      inputs.claimantName,
      ...inputs.claimantAddress.split(/\r?\n|,\s*/).filter(Boolean),
      inputs.claimantEmail,
    ],
    dateLine: ukDate(date),
    recipientLines: [inputs.airline, 'Customer Relations – Compensation Claims'],
    subjectLines: [
      `Re: Compensation claim for ${what} ${inputs.flightNumber} on ${isoToUk(inputs.flightDate)}`,
      `Route: ${inputs.from} to ${inputs.to} · Booking reference: ${inputs.bookingRef.toUpperCase()}`,
    ],
    salutation: 'Dear Sir or Madam,',
    paragraphs: output.body_paragraphs,
    blocks: claimBlocks(inputs, e),
    signOff: 'Yours faithfully,',
    signature: inputs.claimantName,
    footer: FLIGHT_DISCLAIMER,
    appendix: [
      { heading: 'Next steps (for you – not part of the letter)', lines: FLIGHT_NEXT_STEPS },
      { heading: 'How the amount was worked out', lines: e.reasons },
    ],
  };
}

export const flightDelayClaimGenerator: ToolGenerator<FlightDelayClaimInputs, FlightClaimOutput> = {
  inputSchema: flightDelayClaimSchema as never,
  prompt: flightDelayClaimPrompt,
  preCheck: flightNotSellableReason,
  async build(inputs, output) {
    const letter = buildFlightLetter(inputs, output);
    const e = checkEligibility(flightFacts(inputs));
    const title = `Flight claim – ${inputs.flightNumber}`;
    const [pdf, docx] = await Promise.all([
      letterToPdf(letter, title),
      letterToDocx(letter, title),
    ]);
    const display: FlightClaimDisplay = {
      letterText: letterToText(letter),
      claim: {
        perPassenger: money(e.currency, e.perPassenger),
        total: money(e.currency, e.total),
        passengers: inputs.passengers.length,
        expenses: money('£', expensesTotal(inputs.expenses)),
      },
      evidence: output.evidence_to_attach,
      nextSteps: FLIGHT_NEXT_STEPS,
      disclaimer: FLIGHT_DISCLAIMER,
    };
    return {
      display,
      files: [
        {
          filename: 'flight-claim-letter.pdf',
          label: 'Download PDF',
          contentType: 'application/pdf',
          bytes: pdf,
        },
        {
          filename: 'flight-claim-letter.docx',
          label: 'Download Word',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          bytes: docx,
        },
      ],
    };
  },
};
