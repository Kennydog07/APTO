import { useState } from 'react';
import {
  DEPOSIT_LIMITS as L,
  DISPUTE_REASONS,
  EVIDENCE_ITEMS,
  depositReturnSchema,
  depositSums,
  gbp,
  type DisputeReason,
  type EvidenceItem,
} from '../../../shared/schemas/deposit-return';
import { LETTER_TYPE_LABEL, chooseLetterType } from '../../../shared/rules/deposits';
import { TOOLS, formatPrice } from '../../../shared/tools';
import {
  BackShortly,
  Button,
  CheckboxGroup,
  Notice,
  RadioGroup,
  TextArea,
  TextField,
  useAcceptingOrders,
} from '../../components/ui';
import { useCheckout } from '../useCheckout';
import { CheckoutSmallPrint, issuesToFieldErrors } from '../../components/ToolLanding';

const tool = TOOLS['deposit-return'];
export const DEPOSIT_FORM_DISCLAIMER = 'This is a letter-writing tool, not legal advice.';

const inputCls =
  'w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-stone-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/30';

interface Ded {
  item: string;
  amount: string;
  accept: boolean;
  reason: DisputeReason;
  note: string;
}

export function DepositReturnForm() {
  const accepting = useAcceptingOrders();
  const { submit, busy, error, fieldErrors, setFieldErrors } = useCheckout(tool.id);
  const [v, setV] = useState({
    nation: '' as '' | 'england' | 'wales' | 'scotland' | 'ni',
    landlordName: '',
    landlordAddress: '',
    propertyAddress: '',
    tenancyStart: '',
    moveOut: '',
    deposit: '',
    returned: '',
    protectedStatus: '' as '' | 'yes' | 'no' | 'unknown',
    scheme: '',
    timesAsked: '' as '' | 'none' | 'once' | 'twice',
    deductions: [] as Ded[],
    evidence: [] as EvidenceItem[],
    tenantName: '',
    tenantAddress: '',
    extra: '',
  });
  const set =
    <K extends keyof typeof v>(k: K) =>
    (val: (typeof v)[K]) =>
      setV((s) => ({ ...s, [k]: val }));
  const fe = (k: string) => fieldErrors[k]?.[0];
  const payload = {
    ...v,
    nation: v.nation || undefined,
    protectedStatus: v.protectedStatus || undefined,
    timesAsked: v.timesAsked || undefined,
    returned: v.returned || '0',
  };
  const num = (s: string) => Number(s) || 0;
  const sums = depositSums({
    deposit: num(v.deposit),
    returned: num(v.returned),
    deductions: v.deductions.map((d) => ({ ...d, amount: num(d.amount) })),
  });
  const type =
    v.protectedStatus && v.timesAsked
      ? chooseLetterType({
          protectedStatus: v.protectedStatus,
          timesAsked: v.timesAsked,
          deductions: v.deductions,
        })
      : null;

  if (accepting === false) return <BackShortly />;

  return (
    <form
      noValidate
      className="space-y-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = depositReturnSchema.safeParse(payload);
        if (!parsed.success) {
          setFieldErrors(issuesToFieldErrors(parsed.error.issues));
          return;
        }
        void submit(parsed.data);
      }}
    >
      <Notice>{DEPOSIT_FORM_DISCLAIMER}</Notice>

      <h2 className="text-lg font-bold">1. The tenancy</h2>
      <RadioGroup
        legend="Where is the rented home?"
        value={v.nation}
        onChange={set('nation')}
        error={fe('nation')}
        options={[
          { value: 'england', label: 'England' },
          { value: 'wales', label: 'Wales' },
          { value: 'scotland', label: 'Scotland' },
          { value: 'ni', label: 'Northern Ireland' },
        ]}
      />
      <TextArea
        label="Rented property address"
        rows={2}
        value={v.propertyAddress}
        onChange={set('propertyAddress')}
        maxLength={L.address}
        error={fe('propertyAddress')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Tenancy start date"
          type="date"
          value={v.tenancyStart}
          onChange={set('tenancyStart')}
          maxLength={10}
          error={fe('tenancyStart')}
        />
        <TextField
          label="Date you moved out"
          type="date"
          value={v.moveOut}
          onChange={set('moveOut')}
          maxLength={10}
          error={fe('moveOut')}
        />
        <TextField
          label="Deposit you paid (£)"
          inputMode="decimal"
          value={v.deposit}
          onChange={set('deposit')}
          maxLength={9}
          error={fe('deposit')}
        />
        <TextField
          label="Amount already returned (£)"
          hint="0 if nothing yet"
          inputMode="decimal"
          value={v.returned}
          onChange={set('returned')}
          maxLength={9}
          required={false}
          error={fe('returned')}
        />
      </div>
      <RadioGroup
        legend="Was your deposit protected in a scheme?"
        value={v.protectedStatus}
        onChange={set('protectedStatus')}
        error={fe('protectedStatus')}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No', hint: 'I’ve checked with the schemes' },
          { value: 'unknown', label: 'I don’t know' },
        ]}
      />
      {v.protectedStatus === 'yes' && (
        <TextField
          label="Which scheme? (optional)"
          value={v.scheme}
          onChange={set('scheme')}
          maxLength={L.scheme}
          required={false}
          error={fe('scheme')}
        />
      )}
      <RadioGroup
        legend="How many times have you already asked for it back?"
        value={v.timesAsked}
        onChange={set('timesAsked')}
        error={fe('timesAsked')}
        options={[
          { value: 'none', label: 'Not yet' },
          { value: 'once', label: 'Once' },
          { value: 'twice', label: 'Twice or more' },
        ]}
      />

      <h2 className="pt-2 text-lg font-bold">2. Deductions (if any)</h2>
      <p className="text-sm text-stone-600">
        Add each deduction your landlord or agent wants to make. Tick the ones you agree with.
      </p>
      <div className="space-y-3">
        {v.deductions.map((d, i) => {
          const upd = (patch: Partial<Ded>) =>
            set('deductions')(v.deductions.map((y, j) => (j === i ? { ...y, ...patch } : y)));
          return (
            <div
              key={i}
              className="grid gap-2 rounded-md border border-stone-200 p-3 sm:grid-cols-2"
            >
              <input
                aria-label={`Deduction ${i + 1}: what it’s for`}
                placeholder="What it’s for, e.g. carpet cleaning"
                value={d.item}
                maxLength={L.item}
                onChange={(e) => upd({ item: e.target.value })}
                className={inputCls}
              />
              <input
                aria-label={`Deduction ${i + 1} amount in pounds`}
                placeholder="£ amount"
                inputMode="decimal"
                value={d.amount}
                maxLength={9}
                onChange={(e) => upd({ amount: e.target.value })}
                className={inputCls}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={d.accept}
                  onChange={(e) => upd({ accept: e.target.checked })}
                  className="accent-blue-700"
                />
                I agree with this one
              </label>
              {!d.accept && (
                <select
                  aria-label={`Deduction ${i + 1}: why you disagree`}
                  value={d.reason}
                  onChange={(e) => upd({ reason: e.target.value as DisputeReason })}
                  className={inputCls}
                >
                  {(Object.keys(DISPUTE_REASONS) as DisputeReason[]).map((k) => (
                    <option key={k} value={k}>
                      {DISPUTE_REASONS[k]}
                    </option>
                  ))}
                </select>
              )}
              {!d.accept && (
                <input
                  aria-label={`Deduction ${i + 1}: details (optional)`}
                  placeholder="Details (optional)"
                  value={d.note}
                  maxLength={L.note}
                  onChange={(e) => upd({ note: e.target.value })}
                  className={`${inputCls} sm:col-span-2`}
                />
              )}
              <button
                type="button"
                className="justify-self-start text-sm text-stone-700 underline"
                onClick={() => set('deductions')(v.deductions.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
      {v.deductions.length < L.maxDeductions && (
        <button
          type="button"
          className="text-sm font-semibold text-blue-800 underline"
          onClick={() =>
            set('deductions')([
              ...v.deductions,
              { item: '', amount: '', accept: false, reason: 'wear_and_tear', note: '' },
            ])
          }
        >
          + Add deduction
        </button>
      )}
      {Object.keys(fieldErrors).some((k) => k.startsWith('deductions')) && (
        <p className="text-sm font-medium text-red-700">
          Check each deduction has a description and an amount above £0.
        </p>
      )}
      {num(v.deposit) > 0 && (
        <div
          className="rounded-lg bg-stone-50 p-3 text-sm ring-1 ring-stone-200"
          aria-live="polite"
        >
          <p>
            You’ll ask for <strong>{gbp(sums.owed)}</strong>
            {sums.disputed > 0 && <> (including {gbp(sums.disputed)} of disputed deductions)</>}.
          </p>
          {type && (
            <p className="mt-1">
              Letter type: <strong>{LETTER_TYPE_LABEL[type]}</strong>
            </p>
          )}
        </div>
      )}

      <CheckboxGroup
        legend="Which of these do you have?"
        values={v.evidence}
        onChange={set('evidence')}
        options={(Object.keys(EVIDENCE_ITEMS) as EvidenceItem[]).map((k) => ({
          value: k,
          label: EVIDENCE_ITEMS[k],
        }))}
      />

      <h2 className="pt-2 text-lg font-bold">3. Names and addresses</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Landlord or letting agent name"
          value={v.landlordName}
          onChange={set('landlordName')}
          maxLength={L.name}
          error={fe('landlordName')}
        />
        <TextField
          label="Your full name"
          autoComplete="name"
          value={v.tenantName}
          onChange={set('tenantName')}
          maxLength={L.name}
          error={fe('tenantName')}
        />
        <TextArea
          label="Landlord or agent address"
          rows={3}
          value={v.landlordAddress}
          onChange={set('landlordAddress')}
          maxLength={L.address}
          error={fe('landlordAddress')}
        />
        <TextArea
          label="Your current address"
          autoComplete="street-address"
          rows={3}
          value={v.tenantAddress}
          onChange={set('tenantAddress')}
          maxLength={L.address}
          error={fe('tenantAddress')}
        />
      </div>
      <TextArea
        label="Anything else? (optional)"
        hint="What happened at check-out, what you were told, and when. Stick to the facts."
        rows={5}
        value={v.extra}
        onChange={set('extra')}
        maxLength={L.extra}
        required={false}
        error={fe('extra')}
      />

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
