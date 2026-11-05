import { useMemo, useState } from 'react';
import {
  COMPLAINT_TYPES,
  DATE_LABEL,
  OUTCOMES,
  REFUND_LIMITS as L,
  refundLetterSchema,
  type ComplaintTypeKey,
  type OutcomeKey,
} from '../../../shared/schemas/refund-letter';
import { chooseRight, paymentNote } from '../../../shared/rules/consumer-rights';
import { TOOLS, formatPrice } from '../../../shared/tools';
import {
  BackShortly,
  Button,
  Notice,
  RadioGroup,
  TextArea,
  TextField,
  useAcceptingOrders,
} from '../../components/ui';
import { useCheckout } from '../useCheckout';
import { CheckoutSmallPrint, issuesToFieldErrors } from '../../components/ToolLanding';

const tool = TOOLS['refund-letter'];
export const REFUND_FORM_DISCLAIMER = 'This is a letter-writing tool, not legal advice.';

/** Outcomes offered for each complaint type. */
const OUTCOMES_FOR: Record<ComplaintTypeKey, OutcomeKey[]> = {
  faulty: ['refund', 'repair', 'replacement', 'partial'],
  not_delivered: ['delivery', 'refund'],
  poor_service: ['redo', 'partial', 'refund'],
  energy_bill: ['bill', 'refund'],
};

export function RefundLetterForm() {
  const accepting = useAcceptingOrders();
  const { submit, busy, error, fieldErrors, setFieldErrors } = useCheckout(tool.id);
  const [v, setV] = useState({
    complaintType: '' as '' | ComplaintTypeKey,
    companyName: '',
    companyAddress: '',
    item: '',
    orderRef: '',
    date: '',
    price: '',
    paymentMethod: '' as '' | 'credit' | 'debit' | 'paypal' | 'other',
    boughtOnline: '' as '' | 'yes' | 'no',
    repairAttempted: '' as '' | 'yes' | 'no',
    problem: '',
    contactSoFar: '',
    outcome: '' as '' | OutcomeKey,
    customerName: '',
    customerAddress: '',
  });
  const set =
    <K extends keyof typeof v>(k: K) =>
    (val: (typeof v)[K]) =>
      setV((s) => ({ ...s, [k]: val }));
  const fe = (k: string) => fieldErrors[k]?.[0];
  const payload = {
    ...v,
    complaintType: v.complaintType || undefined,
    paymentMethod: v.paymentMethod || undefined,
    outcome: v.outcome || undefined,
    boughtOnline: v.boughtOnline === 'yes',
    repairAttempted: v.complaintType === 'faulty' && v.repairAttempted === 'yes',
  };

  // Which right applies is worked out in code from the dates, and shown before payment.
  const right = useMemo(
    () =>
      v.complaintType && /^\d{4}-\d{2}-\d{2}$/.test(v.date)
        ? chooseRight({
            type: v.complaintType,
            date: v.date,
            boughtOnline: v.boughtOnline === 'yes',
            repairAttempted: v.repairAttempted === 'yes',
            today: new Date(),
          })
        : null,
    [v.complaintType, v.date, v.boughtOnline, v.repairAttempted],
  );
  const pay =
    v.paymentMethod && v.price ? paymentNote(v.paymentMethod, Number(v.price) || 0) : null;

  if (accepting === false) return <BackShortly />;
  const type = v.complaintType;

  return (
    <form
      noValidate
      className="space-y-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = refundLetterSchema.safeParse(payload);
        if (!parsed.success) {
          setFieldErrors(issuesToFieldErrors(parsed.error.issues));
          return;
        }
        void submit(parsed.data);
      }}
    >
      <Notice>{REFUND_FORM_DISCLAIMER}</Notice>

      <h2 className="text-lg font-bold">1. What went wrong?</h2>
      <RadioGroup
        legend="Choose one"
        value={v.complaintType}
        onChange={(t) => setV((s) => ({ ...s, complaintType: t, outcome: '' }))}
        error={fe('complaintType')}
        options={(Object.keys(COMPLAINT_TYPES) as ComplaintTypeKey[]).map((k) => ({
          value: k,
          label: COMPLAINT_TYPES[k],
        }))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={
            type === 'energy_bill'
              ? 'Account or bill (e.g. “Electricity, account 12345”)'
              : type === 'poor_service'
                ? 'What the service was'
                : 'What you bought'
          }
          value={v.item}
          onChange={set('item')}
          maxLength={L.item}
          error={fe('item')}
        />
        <TextField
          label="Order or account reference (optional)"
          value={v.orderRef}
          onChange={set('orderRef')}
          maxLength={L.ref}
          required={false}
          error={fe('orderRef')}
        />
        <TextField
          label={type ? DATE_LABEL[type] : 'Date'}
          type="date"
          value={v.date}
          onChange={set('date')}
          maxLength={10}
          error={fe('date')}
        />
        <TextField
          label={type === 'energy_bill' ? 'Amount of the bill (£)' : 'Price paid (£)'}
          inputMode="decimal"
          value={v.price}
          onChange={set('price')}
          maxLength={9}
          error={fe('price')}
        />
      </div>
      {type !== 'energy_bill' && (
        <RadioGroup
          legend="Did you buy it online, by phone or by mail order?"
          value={v.boughtOnline}
          onChange={set('boughtOnline')}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No, in person' },
          ]}
        />
      )}
      {type === 'faulty' && (
        <RadioGroup
          legend="Has the company already tried a repair or replacement?"
          value={v.repairAttempted}
          onChange={set('repairAttempted')}
          options={[
            { value: 'yes', label: 'Yes, and it’s still not right' },
            { value: 'no', label: 'No' },
          ]}
        />
      )}
      <RadioGroup
        legend="How did you pay?"
        value={v.paymentMethod}
        onChange={set('paymentMethod')}
        error={fe('paymentMethod')}
        options={[
          { value: 'credit', label: 'Credit card' },
          { value: 'debit', label: 'Debit card' },
          { value: 'paypal', label: 'PayPal' },
          { value: 'other', label: 'Other', hint: 'Cash, bank transfer, Direct Debit' },
        ]}
      />

      {right && (
        <div className="rounded-lg bg-emerald-50 p-4 ring-1 ring-emerald-200" aria-live="polite">
          <p className="font-semibold">Your rights, in one line</p>
          <p className="mt-1">{right.summary}</p>
          {pay && <p className="mt-2 text-sm text-stone-700">{pay}</p>}
        </div>
      )}

      <h2 className="pt-2 text-lg font-bold">2. The details</h2>
      <TextArea
        label="What went wrong?"
        hint="Dates, what you noticed, what it stops you doing. Stick to the facts."
        rows={5}
        value={v.problem}
        onChange={set('problem')}
        maxLength={L.problem}
        error={fe('problem')}
      />
      <TextArea
        label="Contact with the company so far (optional)"
        hint="e.g. “Called on 3 March, told to wait 10 days, no reply since.”"
        rows={3}
        value={v.contactSoFar}
        onChange={set('contactSoFar')}
        maxLength={L.contact}
        required={false}
        error={fe('contactSoFar')}
      />
      {type && (
        <RadioGroup
          legend="What do you want?"
          value={v.outcome}
          onChange={set('outcome')}
          error={fe('outcome')}
          options={OUTCOMES_FOR[type].map((k) => ({ value: k, label: OUTCOMES[k] }))}
        />
      )}

      <h2 className="pt-2 text-lg font-bold">3. Names and addresses</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Company name"
          value={v.companyName}
          onChange={set('companyName')}
          maxLength={L.company}
          error={fe('companyName')}
        />
        <TextField
          label="Your full name"
          autoComplete="name"
          value={v.customerName}
          onChange={set('customerName')}
          maxLength={L.name}
          error={fe('customerName')}
        />
        <TextArea
          label="Company address"
          hint="Check their website or receipt for a complaints address."
          rows={3}
          value={v.companyAddress}
          onChange={set('companyAddress')}
          maxLength={L.address}
          error={fe('companyAddress')}
        />
        <TextArea
          label="Your address"
          autoComplete="street-address"
          rows={3}
          value={v.customerAddress}
          onChange={set('customerAddress')}
          maxLength={L.address}
          error={fe('customerAddress')}
        />
      </div>

      {Object.keys(fieldErrors).length > 0 && (
        <Notice tone="error">Please fix the highlighted fields.</Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      <Button type="submit" busy={busy} className="w-full sm:w-auto">
        {busy
          ? 'Taking you to secure checkout…'
          : `Continue to payment – ${formatPrice(tool.pricePence)}`}
      </Button>
      <CheckoutSmallPrint what="letter" />
    </form>
  );
}
