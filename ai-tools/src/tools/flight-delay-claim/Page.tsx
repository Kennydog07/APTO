import { TOOLS } from '../../../shared/tools';
import { Mascot } from '../../components/Mascot';
import { HowItWorks, type HowStep } from '../../components/HowItWorks';
import { ToolLanding } from '../../components/ToolLanding';
import { FLIGHT_FAQS } from './content';
import { FlightDelayClaimForm } from './Form';

// No sample letter on this page on purpose (same as the parking appeal): it could simply be copied.
const STEPS: HowStep[] = [
  {
    t: 'Check for free',
    d: 'Choose your airports and tell us what happened. We work out the distance and what you may be owed.',
  },
  {
    t: 'Add your booking',
    d: 'Flight number, date, passengers, booking reference and any meals, hotel or taxis you paid for.',
  },
  { t: 'Pay £3.99', d: 'Only if your flight appears to qualify. Secure checkout by Stripe.' },
  {
    t: 'Your letter is written',
    d: 'A firm, polite claim citing UK261 or EU261, with the amounts and an expenses table.',
  },
  {
    t: 'Send it to the airline',
    d: 'Get PDF + Word + copyable text for the airline’s claim form, plus what to do if they say no.',
  },
];

export function FlightDelayClaimPage() {
  return (
    <ToolLanding
      tool={TOOLS['flight-delay-claim']}
      h1="Flight delay & cancellation compensation claim letter"
      hero={
        <Mascot
          name="flight"
          alt="APTO mascot slumped on a suitcase at an airport, under a departures board full of delayed flights"
        />
      }
      form={<FlightDelayClaimForm />}
      extra={<HowItWorks steps={STEPS} />}
      faqs={FLIGHT_FAQS}
      priceNote="free eligibility check"
    />
  );
}
