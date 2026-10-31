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
  'bedtime-story': {
    childName: 'Maya',
    ageBand: '5-7',
    favourites: ['rockets', 'the moon', 'her dog Biscuit'],
    theme: 'kindness',
    length: 'short',
  },
  'speech-writer': {
    speechType: 'best_man',
    speakerName: 'Jordan',
    relationship: "Groom's best friend since school",
    subjectNames: 'Sam and Priya',
    anecdotes: [
      'Sam and I met on the first day of secondary school when he walked into the wrong classroom and stayed for the whole lesson.',
      'Their first date was a walk along the river that was supposed to take an hour and took five.',
      "When Sam's dad was unwell last year, Priya was there every weekend without being asked.",
    ],
    tone: 'balanced',
    minutes: 3,
    avoid: 'No jokes about exes or drinking.',
  },
  // Credit pack purchase (what create-job receives). Listings are written later from photos.
  'listing-writer': { kind: 'pack' },
} as const;

/** A 96x96 plain red JPEG, used by the e2e test to exercise the listing writer end to end. */
export const SAMPLE_PHOTO_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQAAAAAAAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABgAGADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAYH/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AlAE608AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/9k=';
