import {
  parkingAppealSchema,
  type ParkingAppealInputs,
} from '../../../shared/schemas/parking-appeal.ts';
import {
  PARKING_DISCLAIMER,
  PARKING_NEXT_STEPS,
  parkingAppealPrompt,
  type ParkingAppealOutput,
} from '../../../prompts/parking-appeal.ts';
import { letterToText, ukDate, type Letter } from '../docs/letter.ts';
import { letterToPdf } from '../docs/pdf.ts';
import { letterToDocx } from '../docs/docx.ts';
import type { ToolGenerator } from './types.ts';

/** Shape shown on the done page (see src/tools/parking-appeal/Result.tsx). */
export interface ParkingAppealDisplay {
  letterText: string;
  evidence: string[];
  suggestions: string[];
  nextSteps: string[];
  disclaimer: string;
}

/** Header, addresses and sign-off come from the user's inputs, never from the AI. */
export function buildParkingLetter(
  inputs: ParkingAppealInputs,
  output: ParkingAppealOutput,
  date = new Date(),
): Letter {
  const isCouncil = inputs.ticketType === 'council';
  const [y, m, d] = inputs.ticketDate.split('-').map(Number);
  const ticketDate = ukDate(new Date(Date.UTC(y!, m! - 1, d!, 12)));
  return {
    senderLines: [
      inputs.appellantName,
      ...inputs.appellantAddress.split(/\r?\n|,\s*/).filter(Boolean),
    ],
    dateLine: ukDate(date),
    recipientLines: [
      inputs.issuerName,
      isCouncil ? 'Parking Services – Appeals' : 'Appeals Department',
    ],
    subjectLines: [
      `Re: ${isCouncil ? 'Penalty Charge Notice' : 'Parking Charge Notice'} ${inputs.ticketRef}`,
      `Vehicle registration: ${inputs.vehicleReg.toUpperCase()} · Date: ${ticketDate} · Location: ${inputs.location}`,
    ],
    salutation: 'Dear Sir or Madam,',
    paragraphs: output.body_paragraphs,
    signOff: 'Yours faithfully,',
    signature: inputs.appellantName,
    footer: `${PARKING_DISCLAIMER} Check the deadline printed on your ticket.`,
  };
}

export const parkingAppealGenerator: ToolGenerator<ParkingAppealInputs, ParkingAppealOutput> = {
  inputSchema: parkingAppealSchema as never,
  prompt: parkingAppealPrompt,
  async build(inputs, output) {
    const letter = buildParkingLetter(inputs, output);
    const title = `Appeal – ${inputs.ticketRef}`;
    const [pdf, docx] = await Promise.all([
      letterToPdf(letter, title),
      letterToDocx(letter, title),
    ]);
    const display: ParkingAppealDisplay = {
      letterText: letterToText(letter),
      evidence: output.evidence_to_attach,
      suggestions: output.suggestions,
      nextSteps: PARKING_NEXT_STEPS[inputs.ticketType],
      disclaimer: PARKING_DISCLAIMER,
    };
    return {
      display,
      files: [
        {
          filename: 'appeal-letter.pdf',
          label: 'Download PDF',
          contentType: 'application/pdf',
          bytes: pdf,
        },
        {
          filename: 'appeal-letter.docx',
          label: 'Download Word',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          bytes: docx,
        },
      ],
    };
  },
};
