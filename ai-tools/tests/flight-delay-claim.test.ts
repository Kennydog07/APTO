import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
  AIRPORTS,
  BANDS,
  airportByIata,
  bandFor,
  checkEligibility,
  flightNotSellableReason,
  greatCircleKm,
  type FlightFacts,
} from '../shared/rules/flight-compensation.ts';
import { flightDelayClaimSchema, flightFacts } from '../shared/schemas/flight-delay-claim.ts';
import { flightDelayClaimPrompt, flightProblems } from '../prompts/flight-delay-claim.ts';
import { OutputParseError } from '../prompts/types.ts';
import {
  buildFlightLetter,
  flightDelayClaimGenerator,
} from '../netlify/lib/generators/flight-delay-claim.ts';
import { GENERATORS } from '../netlify/lib/generators/index.ts';
import { letterToText } from '../netlify/lib/docs/letter.ts';
import { SAMPLE_INPUTS } from '../scripts/sample-inputs.ts';
import sample from '../src/samples/flight-delay-claim.json';

const inputs = flightDelayClaimSchema.parse(SAMPLE_INPUTS['flight-delay-claim']);
const base: FlightFacts = {
  from: 'EMA',
  to: 'RAK',
  airlineBase: 'uk',
  what: 'delayed',
  arrivalDelayMins: 200,
  passengers: 1,
};
const elig = (o: Partial<FlightFacts>) => checkEligibility({ ...base, ...o });

describe('airport data', () => {
  it('has about 500–800 airports with unique IATA codes and all main UK airports', () => {
    expect(AIRPORTS.length).toBeGreaterThan(450);
    expect(AIRPORTS.length).toBeLessThan(900);
    expect(new Set(AIRPORTS.map((a) => a.iata)).size).toBe(AIRPORTS.length);
    for (const c of 'LHR LGW MAN STN LTN EDI GLA BHX BRS BFS EMA NCL LPL ABZ JER'.split(' '))
      expect(airportByIata(c), c).toBeTruthy();
    expect(airportByIata('lhr')?.iata).toBe('LHR');
  });
});

describe('great-circle distance and bands', () => {
  it('matches known distances (CAA examples)', () => {
    const km = (a: string, b: string) => greatCircleKm(airportByIata(a)!, airportByIata(b)!);
    expect(km('GLA', 'AMS')).toBeGreaterThan(650);
    expect(km('GLA', 'AMS')).toBeLessThan(1500); // CAA: short-haul example
    expect(km('EMA', 'RAK')).toBeGreaterThan(1500);
    expect(km('EMA', 'RAK')).toBeLessThan(3500); // CAA: medium example
    expect(km('LHR', 'JFK')).toBeGreaterThan(5500); // CAA: long-haul example
  });
  it('puts exactly 1,500 km in the short band and exactly 3,500 km in the medium band', () => {
    expect(bandFor(1499)).toBe('short');
    expect(bandFor(1500)).toBe('short');
    expect(bandFor(1500.01)).toBe('medium');
    expect(bandFor(3500)).toBe('medium');
    expect(bandFor(3500.01)).toBe('long');
  });
  it('has the CAA-verified amounts', () => {
    expect([BANDS.short.UK261, BANDS.medium.UK261, BANDS.long.UK261]).toEqual([220, 350, 520]);
    expect([BANDS.short.EU261, BANDS.medium.EU261, BANDS.long.EU261]).toEqual([250, 400, 600]);
  });
});

describe('delays', () => {
  it('exactly 3 hours qualifies; 2h59 does not', () => {
    expect(elig({ arrivalDelayMins: 180 })).toMatchObject({
      status: 'eligible',
      perPassenger: 350,
    });
    expect(elig({ arrivalDelayMins: 179 })).toMatchObject({ status: 'not_eligible', total: 0 });
  });
  it('pays each band', () => {
    expect(elig({ from: 'GLA', to: 'AMS' }).perPassenger).toBe(220);
    expect(elig({}).perPassenger).toBe(350);
    expect(elig({ from: 'LHR', to: 'JFK', arrivalDelayMins: 240 }).perPassenger).toBe(520);
  });
  it('halves long-haul delays of 3 to under 4 hours', () => {
    const e = elig({ from: 'LHR', to: 'JFK', arrivalDelayMins: 239 });
    expect(e).toMatchObject({ perPassenger: 260, halved: true });
  });
  it('multiplies by passengers', () => {
    expect(elig({ passengers: 3 }).total).toBe(1050);
  });
  it('always mentions extraordinary circumstances when eligible', () => {
    expect(elig({}).reasons.join(' ')).toMatch(/extraordinary circumstances/);
  });
});

describe('cancellations', () => {
  const c = (o: Partial<FlightFacts>) => elig({ what: 'cancelled', ...o });
  it('14 days notice or more: no compensation', () => {
    expect(c({ notice: '14plus' }).status).toBe('not_eligible');
  });
  it('less than 14 days, not re-routed: full amount', () => {
    expect(c({ notice: 'lt7', rerouted: false, arrivalDelayMins: 0 }).perPassenger).toBe(350);
    expect(c({ notice: '7to14', rerouted: false, arrivalDelayMins: 0 }).perPassenger).toBe(350);
  });
  it('7–14 days, re-routed within 2h early / under 4h late: nothing', () => {
    expect(
      c({ notice: '7to14', rerouted: true, rerouteDepartedEarlyMins: 120, arrivalDelayMins: 239 })
        .status,
    ).toBe('not_eligible');
  });
  it('7–14 days, re-routed and 4h+ late: full amount', () => {
    expect(c({ notice: '7to14', rerouted: true, arrivalDelayMins: 240 }).perPassenger).toBe(350);
  });
  it('7–14 days, re-routed leaving over 2h early and under 3h late (medium): halved', () => {
    expect(
      c({ notice: '7to14', rerouted: true, rerouteDepartedEarlyMins: 150, arrivalDelayMins: 60 }),
    ).toMatchObject({ perPassenger: 175, halved: true });
  });
  it('under 7 days, re-routed within 1h early / under 2h late: nothing', () => {
    expect(
      c({ notice: 'lt7', rerouted: true, rerouteDepartedEarlyMins: 60, arrivalDelayMins: 119 })
        .status,
    ).toBe('not_eligible');
  });
  it('under 7 days, re-routed 2h late on short-haul: full £220', () => {
    expect(
      c({ from: 'GLA', to: 'AMS', notice: 'lt7', rerouted: true, arrivalDelayMins: 120 })
        .perPassenger,
    ).toBe(220);
  });
  it('under 7 days, re-routed 3h late on long-haul: halved to £260', () => {
    expect(
      c({ from: 'LHR', to: 'JFK', notice: 'lt7', rerouted: true, arrivalDelayMins: 180 }),
    ).toMatchObject({ perPassenger: 260, halved: true });
  });
});

describe('denied boarding', () => {
  it('pays in full, or half if re-routed and arriving under the band threshold', () => {
    expect(elig({ what: 'denied', rerouted: false, arrivalDelayMins: 0 }).perPassenger).toBe(350);
    expect(elig({ what: 'denied', rerouted: true, arrivalDelayMins: 60 }).perPassenger).toBe(175);
  });
});

describe('which rules apply', () => {
  it('UK departures are UK261 in £, whatever the airline', () => {
    expect(elig({ airlineBase: 'other' })).toMatchObject({ regime: 'UK261', currency: '£' });
  });
  it('into the UK only on a UK/EU airline', () => {
    expect(elig({ from: 'JFK', to: 'LHR', airlineBase: 'other' }).status).toBe('not_eligible');
    expect(elig({ from: 'JFK', to: 'LHR', airlineBase: 'uk' }).regime).toBe('UK261');
    expect(elig({ from: 'JFK', to: 'LHR', airlineBase: 'unsure' }).status).toBe('maybe');
  });
  it('EU departures are EU261 in €, and intra-EU long flights cap at the middle band', () => {
    expect(elig({ from: 'CDG', to: 'FCO', airlineBase: 'other' })).toMatchObject({
      regime: 'EU261',
      currency: '€',
      perPassenger: 250,
    });
    expect(
      elig({ from: 'CDG', to: 'JFK', airlineBase: 'other', arrivalDelayMins: 300 }).perPassenger,
    ).toBe(600);
    // Helsinki to Gran Canaria is over 3,500 km but within the EU: middle band, EUR 400.
    expect(
      elig({ from: 'HEL', to: 'LPA', airlineBase: 'other', arrivalDelayMins: 300 }),
    ).toMatchObject({ band: 'medium', perPassenger: 400 });
  });
  it('rejects unknown or identical airports', () => {
    expect(elig({ from: 'ZZZ' }).status).toBe('not_eligible');
    expect(elig({ to: 'EMA' }).status).toBe('not_eligible');
  });
});

describe('pre-payment gate', () => {
  it('sells when eligible, refuses when not eligible with no expenses', () => {
    expect(flightNotSellableReason(inputs)).toBeNull();
    const short = { ...inputs, delayHours: 2, delayMinutes: 0, expenses: [] };
    expect(flightNotSellableReason(short)).toMatch(/under 3 hours/);
    expect(flightNotSellableReason({ ...short, expenses: inputs.expenses })).toBeNull();
    expect(flightNotSellableReason({ ...inputs, from: 'QQQ' })).toMatch(/airports/);
    expect(flightDelayClaimGenerator.preCheck).toBe(flightNotSellableReason);
  });
});

describe('flight claim input schema', () => {
  it('accepts the sample and normalises codes', () => {
    const r = flightDelayClaimSchema.parse({ ...SAMPLE_INPUTS['flight-delay-claim'], from: 'ema' });
    expect(r.from).toBe('EMA');
    expect(flightFacts(r).arrivalDelayMins).toBe(260);
  });
  it('needs notice for cancellations, different airports, 1–9 passengers, a valid email', () => {
    const s = SAMPLE_INPUTS['flight-delay-claim'];
    expect(flightDelayClaimSchema.safeParse({ ...s, what: 'cancelled' }).success).toBe(false);
    expect(flightDelayClaimSchema.safeParse({ ...s, to: 'EMA' }).success).toBe(false);
    expect(flightDelayClaimSchema.safeParse({ ...s, passengers: [] }).success).toBe(false);
    expect(
      flightDelayClaimSchema.safeParse({ ...s, passengers: Array(10).fill('A B') }).success,
    ).toBe(false);
    expect(flightDelayClaimSchema.safeParse({ ...s, claimantEmail: 'nope' }).success).toBe(false);
    expect(flightDelayClaimSchema.safeParse({ ...s, extra: 'x'.repeat(1001) }).success).toBe(false);
  });
});

describe('flight claim prompt', () => {
  it('passes code-calculated amounts and forbids case law', () => {
    const sys = flightDelayClaimPrompt.buildSystemPrompt();
    expect(sys).toMatch(/NO case law/);
    expect(sys).toMatch(/extraordinary circumstances/);
    const user = flightDelayClaimPrompt.buildUserPrompt(inputs) as string;
    expect(user).toContain('£350 per passenger, £700 in total');
    expect(user).toContain('<user_account>');
    expect(flightDelayClaimPrompt.max_tokens).toBe(2000);
  });
  it('parses valid output and rejects banned phrases', () => {
    expect(flightDelayClaimPrompt.parseOutput(JSON.stringify(sample)).body_paragraphs).toHaveLength(
      5,
    );
    const bad = {
      ...sample,
      body_paragraphs: [...sample.body_paragraphs, 'As in Sturgeon v Condor.'],
    };
    expect(() => flightDelayClaimPrompt.parseOutput(JSON.stringify(bad))).toThrow(OutputParseError);
    expect(
      flightProblems({
        ...sample,
        body_paragraphs: ['There were no extraordinary circumstances.'],
      }),
    ).not.toHaveLength(0);
    expect(() => flightDelayClaimPrompt.parseOutput('nope')).toThrow(OutputParseError);
  });
});

describe('flight claim documents', () => {
  it('builds the letter with amounts, expenses table and disclaimer from code', () => {
    const l = buildFlightLetter(inputs, sample, new Date(Date.UTC(2026, 10, 5, 12)));
    const t = letterToText(l);
    expect(t).toContain('Sam Example: £350');
    expect(t).toContain('Total compensation: £700');
    expect(t).toContain('Total expenses: £38.50');
    expect(l.footer).toBe(
      'This is a letter-writing tool, not legal advice. Compensation is not guaranteed.',
    );
    expect(l.appendix?.[0]?.lines?.join(' ')).toMatch(/8 weeks.*ADR|6 years/s);
  });
  it('generates a PDF and Word file and is registered', async () => {
    expect(GENERATORS['flight-delay-claim']).toBe(flightDelayClaimGenerator);
    const out = await flightDelayClaimGenerator.build(inputs, sample);
    expect(out.files.map((f) => f.filename)).toEqual([
      'flight-claim-letter.pdf',
      'flight-claim-letter.docx',
    ]);
    const pdf = await PDFDocument.load(out.files[0]!.bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(2);
    expect((out.display as { claim: { total: string } }).claim.total).toBe('£700');
  });
});
