import { TOOLS, formatPrice } from '../../../shared/tools';
import { Button, Notice } from '../../components/ui';
import { useCheckout } from '../useCheckout';

const tool = TOOLS['listing-writer'];

/** Buys a pack of credits. With topUpToken, the credits are added to that existing link. */
export function BuyButton({ topUpToken, label }: { topUpToken?: string; label?: string }) {
  const { submit, busy, error } = useCheckout(tool.id);
  return (
    <div className="space-y-2">
      <Button
        type="button"
        busy={busy}
        onClick={() => void submit(topUpToken ? { kind: 'pack', topUpToken } : { kind: 'pack' })}
      >
        {busy
          ? 'Taking you to secure checkout…'
          : (label ?? `Buy ${tool.credits} listings – ${formatPrice(tool.pricePence)}`)}
      </Button>
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}

export function PackSmallPrint() {
  return (
    <p className="text-xs text-stone-600">
      Secure payment by Stripe. We email you a private link straight after payment, and your credits
      don’t expire. By paying you agree to our{' '}
      <a href="/terms" className="underline">
        terms
      </a>{' '}
      and to immediate supply, so the 14-day cancellation right no longer applies (
      <a href="/refunds" className="underline">
        refund policy
      </a>
      ). If a listing fails, the credit is returned automatically.
    </p>
  );
}
