/** Made-up inputs used by the seed script and the e2e test. Never use real people's details. */
export const SAMPLE_INPUTS = {
  'parking-appeal': {
    ticketType: 'council',
    issuerName: 'Exampletown Borough Council',
    ticketRef: 'EX12345678',
    ticketDate: '2026-02-28',
    location: 'Market Street car park',
    vehicleReg: 'AB12 CDE',
    whatHappened:
      "I arrived at 10:05 and went to the only pay-and-display machine. Its screen was blank and it would not take coins or my card. I couldn't see any sign explaining another way to pay. I took a photo of the blank machine.",
    grounds: ['machine_broken'],
    otherGround: '',
    appellantName: 'Alex Example',
    appellantAddress: '12 Sample Street\nExampletown\nEX1 2MP',
  },
} as const;
