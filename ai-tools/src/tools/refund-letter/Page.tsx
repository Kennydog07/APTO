import { TOOLS } from '../../../shared/tools';
import { Mascot } from '../../components/Mascot';
import { HowItWorks, type HowStep } from '../../components/HowItWorks';
import { ToolLanding } from '../../components/ToolLanding';
import { REFUND_FAQS } from './content';
import { RefundLetterForm } from './Form';

// No sample letter on this page on purpose: it could simply be copied.
const STEPS: HowStep[] = [
  {
    t: 'Tell us what went wrong',
    d: 'Faulty item, missing order, poor service or a wrong energy bill, with the date and price.',
  },
  {
    t: 'See your rights free',
    d: 'We work out which consumer right applies from your dates, before you pay.',
  },
  { t: 'Pay £2.99', d: 'Secure checkout by Stripe.' },
  {
    t: 'Your letter is written',
    d: 'Firm and polite, using the right that applies and asking for a reply in 14 days.',
  },
  {
    t: 'Send it',
    d: 'PDF + Word + copyable text, what evidence to keep, and what to do if they say no.',
  },
];

export function RefundLetterPage() {
  return (
    <ToolLanding
      tool={TOOLS['refund-letter']}
      h1="Refund & complaint letter: use your consumer rights"
      hero={
        <Mascot
          name="refund"
          alt="Grumpy APTO mascot holding a broken toaster with a spring sticking out, and the receipt"
        />
      }
      form={<RefundLetterForm />}
      extra={<HowItWorks steps={STEPS} />}
      faqs={REFUND_FAQS}
      priceNote="free rights check"
    />
  );
}
