/**
 * UK261 / EU261 flight compensation rules. STATIC CONFIG: these numbers decide what the
 * customer is told before paying, so they live in code and are never written by the AI.
 *
 * Checked 2026-11-02 against the CAA's official pages:
 *   Delays:        https://www.caa.co.uk/passengers-and-public/resolving-travel-problems/delays-and-cancellations/delays/
 *   Cancellations: https://www.caa.co.uk/passengers-and-public/resolving-travel-problems/delays-and-cancellations/cancellations/
 *   Time limits:   https://www.caa.co.uk/publication/download/15108 (6 years E&W/NI, 5 years Scotland)
 * EU amounts (EUR 250/400/600) and the intra-EU distance rule: Regulation (EC) No 261/2004, Article 7,
 *   https://eur-lex.europa.eu/eli/reg/2004/261/oj
 * Re-check every 6 months (see FACTS_TO_VERIFY.md).
 */
import airportsJson from '../data/airports.json';
import { flightFacts, type FlightDelayClaimInputs } from '../schemas/flight-delay-claim.ts';

export const FLIGHT_RULES_CHECKED = '2026-11-02';
export const CAA_DELAYS_URL =
  'https://www.caa.co.uk/passengers-and-public/resolving-travel-problems/delays-and-cancellations/delays/';
export const CAA_CANCELLATIONS_URL =
  'https://www.caa.co.uk/passengers-and-public/resolving-travel-problems/delays-and-cancellations/cancellations/';

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

/** ~750 airports from the public-domain OurAirports dataset (scripts/build-airports.py). */
export const AIRPORTS = airportsJson as Airport[];
const BY_IATA = new Map(AIRPORTS.map((a) => [a.iata, a]));
export const airportByIata = (code: string) => BY_IATA.get(code.trim().toUpperCase());
export const airportLabel = (a: Airport) => `${a.iata} – ${a.name}${a.city ? `, ${a.city}` : ''}`;

const UK = new Set(['GB', 'GG', 'JE', 'IM']);
/** EU member states plus Iceland, Norway, Liechtenstein and Switzerland, where EU261 also applies. */
const EU = new Set(
  'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO CH'.split(
    ' ',
  ),
);

/** Great-circle distance in km (haversine, mean Earth radius 6371 km). */
export function greatCircleKm(a: Pick<Airport, 'lat' | 'lon'>, b: Pick<Airport, 'lat' | 'lon'>) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type Band = 'short' | 'medium' | 'long';
export type Regime = 'UK261' | 'EU261';

/**
 * Distance bands. "1,500 km or less" is short (Art. 7(1)(a)); medium is over 1,500 up to 3,500;
 * long is over 3,500. `halfBelowHours`: a re-routed passenger arriving less than this many hours
 * late gets half (CAA cancellations table). Amounts are per passenger.
 */
export const BANDS: Record<
  Band,
  { maxKm: number; label: string; UK261: number; EU261: number; halfBelowHours: number }
> = {
  short: { maxKm: 1500, label: 'under 1,500 km', UK261: 220, EU261: 250, halfBelowHours: 2 },
  medium: { maxKm: 3500, label: '1,500–3,500 km', UK261: 350, EU261: 400, halfBelowHours: 3 },
  long: { maxKm: Infinity, label: 'over 3,500 km', UK261: 520, EU261: 600, halfBelowHours: 4 },
};

/** Delays: compensation when arriving at the final destination 3 hours or more late. */
export const DELAY_QUALIFY_MINUTES = 180;
/** Long-haul delays of 3 to under 4 hours get half (CAA: £260 rather than £520). */
export const LONG_HAUL_FULL_MINUTES = 240;
/** Cancellations with 14 days' notice or more: no compensation. */
export const CANCELLATION_NOTICE_DAYS = 14;
/** Re-routing that removes compensation, by notice period (CAA cancellations page). */
export const REROUTE_NO_COMP = {
  '7to14': { departEarlyMaxMins: 120, arriveLateUnderMins: 240 },
  lt7: { departEarlyMaxMins: 60, arriveLateUnderMins: 120 },
} as const;

export const CURRENCY: Record<Regime, { symbol: '£' | '€'; code: 'GBP' | 'EUR' }> = {
  UK261: { symbol: '£', code: 'GBP' },
  EU261: { symbol: '€', code: 'EUR' },
};

export function bandFor(km: number): Band {
  if (km <= BANDS.short.maxKm) return 'short';
  if (km <= BANDS.medium.maxKm) return 'medium';
  return 'long';
}

export type Disruption = 'delayed' | 'cancelled' | 'denied';
export type AirlineBase = 'uk' | 'eu' | 'other' | 'unsure';
export type Notice = 'lt7' | '7to14' | '14plus';

export interface FlightFacts {
  from: string;
  to: string;
  airlineBase: AirlineBase;
  what: Disruption;
  /** Arrival delay at the final destination (or of the replacement flight), in minutes. */
  arrivalDelayMins: number;
  notice?: Notice;
  rerouted?: boolean;
  /** How many minutes BEFORE the original departure time the replacement left (0 if later). */
  rerouteDepartedEarlyMins?: number;
  passengers: number;
}

export interface Eligibility {
  /** eligible = the rules point to compensation; maybe = depends on a fact we can't check;
   *  not_eligible = the rules point to no compensation. Never a guarantee. */
  status: 'eligible' | 'maybe' | 'not_eligible';
  regime: Regime | null;
  distanceKm: number | null;
  band: Band | null;
  perPassenger: number;
  total: number;
  currency: '£' | '€';
  halved: boolean;
  /** Plain-English reasons, shown to the user and passed to the letter. */
  reasons: string[];
}

function regimeFor(fromC: string, toC: string, base: AirlineBase): Regime | 'maybe' | null {
  const ukCarrier = base === 'uk';
  const euCarrier = base === 'eu';
  // UK261: departing the UK on any airline; arriving in the UK on a UK or EU airline;
  // arriving in the EU on a UK airline (CAA cancellations page, "Does UK law apply").
  if (UK.has(fromC)) return 'UK261';
  if (UK.has(toC) && (ukCarrier || euCarrier)) return 'UK261';
  if (EU.has(toC) && ukCarrier) return 'UK261';
  // EU261: departing the EU on any airline; arriving in the EU on an EU airline.
  if (EU.has(fromC)) return 'EU261';
  if (EU.has(toC) && euCarrier) return 'EU261';
  if (base === 'unsure' && (UK.has(toC) || EU.has(toC))) return 'maybe';
  return null;
}

const fmt = (n: number) => n.toLocaleString('en-GB');

export function checkEligibility(f: FlightFacts): Eligibility {
  const none = (reasons: string[], extra: Partial<Eligibility> = {}): Eligibility => ({
    status: 'not_eligible',
    regime: null,
    distanceKm: null,
    band: null,
    perPassenger: 0,
    total: 0,
    currency: '£',
    halved: false,
    reasons,
    ...extra,
  });
  const a = airportByIata(f.from);
  const b = airportByIata(f.to);
  if (!a || !b) return none(['Choose both airports from the list.']);
  if (a.iata === b.iata) return none(['The departure and arrival airports are the same.']);

  const km = Math.round(greatCircleKm(a, b));
  const reg = regimeFor(a.country, b.country, f.airlineBase);
  if (reg === null) {
    return none(
      [
        'UK and EU flight compensation rules only cover flights that leave the UK or EU, or that arrive there on a UK or EU airline. This flight doesn’t appear to be covered.',
      ],
      { distanceKm: km },
    );
  }
  const regime: Regime = reg === 'maybe' ? (UK.has(b.country) ? 'UK261' : 'EU261') : reg;
  let band = bandFor(km);
  const reasons: string[] = [];
  // EU261 Art. 7(1)(b): every intra-Community flight over 1,500 km is in the middle band.
  if (regime === 'EU261' && band === 'long' && EU.has(a.country) && EU.has(b.country)) {
    band = 'medium';
    reasons.push('Flights within the EU over 1,500 km are all in the middle band.');
  }
  const cfg = BANDS[band];
  const full = cfg[regime];
  const currency = CURRENCY[regime].symbol;
  const d = f.arrivalDelayMins;
  const base = { regime, distanceKm: km, band, currency } as const;
  reasons.unshift(
    `The flight is about ${fmt(km)} km (${cfg.label}), so it falls under ${regime === 'UK261' ? 'UK261' : 'EU261'}.`,
  );

  let amount: number;
  let halved = false;

  if (f.what === 'delayed') {
    if (d < DELAY_QUALIFY_MINUTES) {
      return none(
        [
          ...reasons,
          'Compensation for a delay starts when you reach your final destination 3 hours or more late. You were under 3 hours late.',
        ],
        base,
      );
    }
    amount = full;
    if (band === 'long' && d < LONG_HAUL_FULL_MINUTES) {
      amount = full / 2;
      halved = true;
      reasons.push('Long-haul flights arriving 3 to 4 hours late get half the full amount.');
    } else reasons.push('You arrived 3 hours or more late.');
  } else if (f.what === 'cancelled') {
    if (f.notice === '14plus') {
      return none(
        [
          ...reasons,
          'You were told about the cancellation 14 days or more before departure, so fixed compensation doesn’t apply. You still have the right to a refund or a replacement flight.',
        ],
        base,
      );
    }
    if (!f.rerouted) {
      amount = full;
      reasons.push('You were told less than 14 days before and were not re-routed.');
    } else {
      const rule = REROUTE_NO_COMP[f.notice === '7to14' ? '7to14' : 'lt7'];
      const early = f.rerouteDepartedEarlyMins ?? 0;
      if (early <= rule.departEarlyMaxMins && d < rule.arriveLateUnderMins) {
        return none(
          [
            ...reasons,
            `Your replacement flight left no more than ${rule.departEarlyMaxMins / 60} hour${rule.departEarlyMaxMins > 60 ? 's' : ''} early and arrived less than ${rule.arriveLateUnderMins / 60} hours late, so fixed compensation doesn’t apply.`,
          ],
          base,
        );
      }
      amount = full;
      if (d < cfg.halfBelowHours * 60) {
        amount = full / 2;
        halved = true;
        reasons.push(
          `Your replacement flight arrived less than ${cfg.halfBelowHours} hours late, so the airline can halve the amount.`,
        );
      } else reasons.push('Your replacement flight changed your journey enough to qualify.');
    }
  } else {
    amount = full;
    if (f.rerouted && d < cfg.halfBelowHours * 60) {
      amount = full / 2;
      halved = true;
      reasons.push(
        `Your replacement flight arrived less than ${cfg.halfBelowHours} hours late, so the airline can halve the amount.`,
      );
    } else reasons.push('You were denied boarding against your will.');
  }

  reasons.push(
    'Airlines don’t have to pay if the disruption was caused by “extraordinary circumstances” (for example severe weather or air traffic control restrictions).',
  );
  if (reg === 'maybe')
    reasons.push('This flight is only covered if the airline is based in the UK or EU.');
  return {
    ...base,
    status: reg === 'maybe' ? 'maybe' : 'eligible',
    perPassenger: amount,
    total: amount * f.passengers,
    halved,
    reasons,
  };
}

export const money = (currency: string, n: number) =>
  `${currency}${n.toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

/** Static next steps (not AI-written). */
export const FLIGHT_NEXT_STEPS = [
  'Claim directly with the airline first. Most airlines have an online claim form: paste this letter into it, or email or post it, and keep a copy.',
  'If the airline refuses, or hasn’t given a final answer after 8 weeks, you can escalate. If the airline belongs to an Alternative Dispute Resolution (ADR) scheme, go there; if not, use the CAA’s Passenger Advice and Complaints Team (PACT).',
  'Time limit: you can bring a claim for flights up to 6 years ago in England, Wales and Northern Ireland, or 5 years ago in Scotland.',
  'Keep receipts for any meals, hotels or transport. Expenses are claimed separately from fixed compensation.',
];

export const FLIGHT_DISCLAIMER =
  'This is a letter-writing tool, not legal advice. Compensation is not guaranteed.';

/**
 * Pre-payment gate (create-job). Returns a message when we should NOT sell a letter: an airport
 * isn't in our list, or no compensation is due under the rules AND there are no expenses to claim.
 */
export function flightNotSellableReason(inputs: FlightDelayClaimInputs): string | null {
  if (!airportByIata(inputs.from) || !airportByIata(inputs.to))
    return 'Choose both airports from the list.';
  const e = checkEligibility(flightFacts(inputs));
  if (e.status !== 'not_eligible' || inputs.expenses.length > 0) return null;
  return (
    e.reasons[e.reasons.length - 1] ?? 'This flight does not appear to qualify for compensation.'
  );
}
