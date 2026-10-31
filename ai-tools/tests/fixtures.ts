import type { ParkingAppealInputs } from '../shared/schemas/parking-appeal.ts';
import type { ParkingAppealOutput } from '../prompts/parking-appeal.ts';

export const parkingInputs: ParkingAppealInputs = {
  ticketType: 'council',
  issuerName: 'Exampletown Borough Council',
  ticketRef: 'EX12345678',
  ticketDate: '2026-02-28',
  location: 'Market Street car park',
  vehicleReg: 'ab12 cde',
  whatHappened: 'The only pay machine had a blank screen and would not take coins or cards.',
  grounds: ['machine_broken', 'other'],
  otherGround: 'No alternative payment method was signposted',
  appellantName: 'Alex Example',
  appellantAddress: '12 Sample Street\nExampletown\nEX1 2MP',
};

export const parkingOutput: ParkingAppealOutput = {
  body_paragraphs: [
    'I am writing to challenge the PCN.',
    'The machine was broken.',
    'Please cancel it.',
  ],
  evidence_to_attach: ['If you have it: a photo of the machine.'],
  suggestions: [],
};
