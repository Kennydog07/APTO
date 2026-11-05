import { TOOLS } from '../../../shared/tools';
import { Mascot } from '../../components/Mascot';
import { HowItWorks, type HowStep } from '../../components/HowItWorks';
import { ToolLanding } from '../../components/ToolLanding';
import { DEPOSIT_FAQS } from './content';
import { DepositReturnForm } from './Form';

// No sample letter on this page on purpose: it could simply be copied.
const STEPS: HowStep[] = [
  {
    t: 'Tell us about the tenancy',
    d: 'Where the home is, the deposit, whether it was protected, and how often you’ve asked.',
  },
  {
    t: 'List any deductions',
    d: 'Tick the ones you accept and say why you dispute the rest. We work out what to ask for.',
  },
  { t: 'Pay £3.99', d: 'Secure checkout by Stripe.' },
  {
    t: 'We pick the right letter',
    d: 'A request, a dispute of deductions, or a letter before action, chosen from your answers.',
  },
  {
    t: 'Send it',
    d: 'PDF + Word + copyable text, an evidence checklist and next steps for your part of the UK.',
  },
];

export function DepositReturnPage() {
  return (
    <ToolLanding
      tool={TOOLS['deposit-return']}
      h1="Get your tenancy deposit back: letter to your landlord"
      hero={
        <Mascot
          name="deposit"
          alt="Grumpy APTO mascot holding a moving box and the keys at the door of a rented home, waiting for the deposit back"
        />
      }
      form={<DepositReturnForm />}
      extra={<HowItWorks steps={STEPS} />}
      faqs={DEPOSIT_FAQS}
    />
  );
}
