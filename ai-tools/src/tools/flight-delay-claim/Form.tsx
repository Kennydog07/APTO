import { useEffect, useId, useMemo, useState } from 'react';
import {
  EXPENSE_TYPES,
  LIMITS,
  flightDelayClaimSchema,
  flightFacts,
  type ExpenseType,
} from '../../../shared/schemas/flight-delay-claim';
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
import { EligibilityBox } from './Eligibility';

const tool = TOOLS['flight-delay-claim'];
export const FLIGHT_FORM_DISCLAIMER =
  'This is a letter-writing tool, not legal advice. Compensation is not guaranteed.';

/** The rules module carries the ~90 KB airport list, so it is loaded only on this page, after render. */
type Rules = typeof import('../../../shared/rules/flight-compensation');
function useRules(): Rules | null {
  const [rules, setRules] = useState<Rules | null>(null);
  useEffect(() => {
    let live = true;
    void import('../../../shared/rules/flight-compensation').then((m) => live && setRules(m));
    return () => {
      live = false;
    };
  }, []);
  return rules;
}

const inputCls =
  'w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-stone-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/30 aria-[invalid=true]:border-red-700';

function AirportField(p: {
  label: string;
  value: string;
  onChange: (code: string, text: string) => void;
  text: string;
  listId: string;
  error?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block font-medium text-stone-800">
        {p.label}
      </label>
      <p id={`${id}-hint`} className="text-sm text-stone-600">
        Type a city, airport or 3-letter code
      </p>
      <input
        id={id}
        list={p.listId}
        value={p.text}
        autoComplete="off"
        maxLength={120}
        aria-invalid={Boolean(p.error)}
        aria-describedby={`${id}-hint${p.error ? ` ${id}-err` : ''}`}
        onChange={(e) => {
          const t = e.target.value;
          const m = /^([A-Za-z]{3})(\s|$|–)/.exec(t.trim());
          p.onChange(m ? m[1]!.toUpperCase() : '', t);
        }}
        className={`mt-1 ${inputCls}`}
      />
      {p.error && (
        <p id={`${id}-err`} className="mt-1 text-sm font-medium text-red-700">
          {p.error}
        </p>
      )}
    </div>
  );
}

interface Expense {
  type: ExpenseType;
  description: string;
  amount: string;
  receipt: boolean;
}

export function FlightDelayClaimForm() {
  const accepting = useAcceptingOrders();
  const rules = useRules();
  const listId = useId();
  const { submit, busy, error, fieldErrors, setFieldErrors } = useCheckout(tool.id);
  const [v, setV] = useState({
    airline: '',
    airlineBase: '' as '' | 'uk' | 'eu' | 'other' | 'unsure',
    flightNumber: '',
    flightDate: '',
    from: '',
    fromText: '',
    to: '',
    toText: '',
    what: '' as '' | 'delayed' | 'cancelled' | 'denied',
    delayHours: '',
    delayMinutes: '',
    notice: '' as '' | 'lt7' | '7to14' | '14plus',
    rerouted: '' as '' | 'yes' | 'no',
    rerouteDepartedEarlyMins: '',
    reasonGiven: '',
    passengers: [''],
    bookingRef: '',
    expenses: [] as Expense[],
    claimantName: '',
    claimantAddress: '',
    claimantEmail: '',
    extra: '',
  });
  const set =
    <K extends keyof typeof v>(k: K) =>
    (val: (typeof v)[K]) =>
      setV((s) => ({ ...s, [k]: val }));
  const fe = (k: string) => fieldErrors[k]?.[0];

  const payload = {
    airline: v.airline,
    airlineBase: v.airlineBase || undefined,
    flightNumber: v.flightNumber,
    flightDate: v.flightDate,
    from: v.from,
    to: v.to,
    what: v.what || undefined,
    delayHours: v.delayHours || '0',
    delayMinutes: v.delayMinutes || '0',
    notice: v.what === 'cancelled' ? v.notice || undefined : undefined,
    rerouted: v.what !== 'delayed' && v.rerouted === 'yes',
    rerouteDepartedEarlyMins: v.rerouteDepartedEarlyMins || '0',
    reasonGiven: v.reasonGiven,
    passengers: v.passengers.map((p) => p.trim()).filter(Boolean),
    bookingRef: v.bookingRef,
    expenses: v.expenses.map((e) => ({ ...e, amount: e.amount })),
    claimantName: v.claimantName,
    claimantAddress: v.claimantAddress,
    claimantEmail: v.claimantEmail,
    extra: v.extra,
  };

  // Free eligibility check, shown before payment. Calculated in code from static rules.
  const ready =
    rules &&
    v.from &&
    v.to &&
    v.airlineBase &&
    v.what &&
    (v.what === 'delayed' ? v.delayHours !== '' : v.rerouted !== '') &&
    (v.what !== 'cancelled' || v.notice);
  const elig = useMemo(
    () =>
      ready
        ? rules.checkEligibility(
            flightFacts({
              from: v.from,
              to: v.to,
              airlineBase: v.airlineBase as 'uk',
              what: v.what as 'delayed',
              delayHours: Number(v.delayHours || 0),
              delayMinutes: Number(v.delayMinutes || 0),
              notice: (v.notice || undefined) as 'lt7' | undefined,
              rerouted: v.rerouted === 'yes',
              rerouteDepartedEarlyMins: Number(v.rerouteDepartedEarlyMins || 0),
              passengers: payload.passengers.length ? payload.passengers : [''],
            }),
          )
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, rules, v, payload.passengers.length],
  );
  const blocked = elig?.status === 'not_eligible' && v.expenses.length === 0;

  if (accepting === false) return <BackShortly />;

  const delayLabel =
    v.what === 'delayed'
      ? 'How late did you reach your final destination?'
      : 'How late did the replacement flight arrive, compared with your original arrival time?';

  return (
    <form
      noValidate
      className="space-y-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = flightDelayClaimSchema.safeParse(payload);
        if (!parsed.success) {
          setFieldErrors(issuesToFieldErrors(parsed.error.issues));
          return;
        }
        if (blocked) return;
        void submit(parsed.data);
      }}
    >
      <Notice>{FLIGHT_FORM_DISCLAIMER}</Notice>

      <datalist id={listId}>
        {rules?.AIRPORTS.map((a) => (
          <option key={a.iata} value={rules.airportLabel(a)} />
        ))}
      </datalist>

      <h2 className="text-lg font-bold">1. Your flight – free check</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <AirportField
          label="Departure airport"
          value={v.from}
          text={v.fromText}
          listId={listId}
          onChange={(code, text) => setV((s) => ({ ...s, from: code, fromText: text }))}
          error={fe('from')}
        />
        <AirportField
          label="Final destination airport"
          value={v.to}
          text={v.toText}
          listId={listId}
          onChange={(code, text) => setV((s) => ({ ...s, to: code, toText: text }))}
          error={fe('to')}
        />
      </div>
      <RadioGroup
        legend="Where is the airline based?"
        value={v.airlineBase}
        onChange={set('airlineBase')}
        error={fe('airlineBase')}
        options={[
          { value: 'uk', label: 'UK', hint: 'e.g. British Airways, easyJet, Jet2' },
          { value: 'eu', label: 'EU, Iceland, Norway or Switzerland', hint: 'e.g. Ryanair, KLM' },
          { value: 'other', label: 'Elsewhere', hint: 'e.g. Emirates, Delta' },
          { value: 'unsure', label: 'Not sure' },
        ]}
      />
      <RadioGroup
        legend="What happened?"
        value={v.what}
        onChange={set('what')}
        error={fe('what')}
        options={[
          { value: 'delayed', label: 'Delayed' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'denied', label: 'Denied boarding', hint: 'Bumped, and you didn’t volunteer' },
        ]}
      />
      {v.what === 'cancelled' && (
        <RadioGroup
          legend="When were you told about the cancellation?"
          value={v.notice}
          onChange={set('notice')}
          error={fe('notice')}
          options={[
            { value: 'lt7', label: 'Less than 7 days before' },
            { value: '7to14', label: '7 to 14 days before' },
            { value: '14plus', label: '14 days or more before' },
          ]}
        />
      )}
      {(v.what === 'cancelled' || v.what === 'denied') && (
        <RadioGroup
          legend="Did you take a replacement flight?"
          value={v.rerouted}
          onChange={set('rerouted')}
          error={fe('rerouted')}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No', hint: 'Or I took a refund instead' },
          ]}
        />
      )}
      {(v.what === 'delayed' || v.rerouted === 'yes') && (
        <fieldset>
          <legend className="font-medium text-stone-800">{delayLabel}</legend>
          <div className="mt-2 grid max-w-sm grid-cols-2 gap-3">
            <TextField
              label="Hours"
              type="number"
              value={v.delayHours}
              onChange={set('delayHours')}
              maxLength={2}
              error={fe('delayHours')}
            />
            <TextField
              label="Minutes"
              type="number"
              value={v.delayMinutes}
              onChange={set('delayMinutes')}
              maxLength={2}
              error={fe('delayMinutes')}
            />
          </div>
        </fieldset>
      )}
      {v.rerouted === 'yes' && v.what === 'cancelled' && (
        <TextField
          label="Did the replacement leave EARLIER than your original flight? By how many minutes?"
          hint="Enter 0 if it left at the same time or later"
          type="number"
          value={v.rerouteDepartedEarlyMins}
          onChange={set('rerouteDepartedEarlyMins')}
          maxLength={4}
          required={false}
          error={fe('rerouteDepartedEarlyMins')}
        />
      )}

      <EligibilityBox
        e={elig}
        passengers={payload.passengers.length || 1}
        hasExpenses={v.expenses.length > 0}
      />

      <h2 className="pt-2 text-lg font-bold">2. Booking details</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Airline"
          value={v.airline}
          onChange={set('airline')}
          maxLength={LIMITS.airline}
          error={fe('airline')}
        />
        <TextField
          label="Flight number"
          hint="e.g. BA 1476"
          value={v.flightNumber}
          onChange={set('flightNumber')}
          maxLength={LIMITS.flightNumber}
          error={fe('flightNumber')}
        />
        <TextField
          label="Date of flight"
          type="date"
          value={v.flightDate}
          onChange={set('flightDate')}
          maxLength={10}
          error={fe('flightDate')}
        />
        <TextField
          label="Booking reference"
          value={v.bookingRef}
          onChange={set('bookingRef')}
          maxLength={LIMITS.bookingRef}
          error={fe('bookingRef')}
        />
      </div>
      <TextField
        label="Reason the airline gave (if any)"
        value={v.reasonGiven}
        onChange={set('reasonGiven')}
        maxLength={LIMITS.reason}
        required={false}
        error={fe('reasonGiven')}
      />

      <fieldset>
        <legend className="font-medium text-stone-800">Passengers on the booking</legend>
        <div className="mt-2 space-y-2">
          {v.passengers.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input
                aria-label={`Passenger ${i + 1} full name`}
                value={p}
                maxLength={LIMITS.passengerName}
                onChange={(e) =>
                  set('passengers')(v.passengers.map((x, j) => (j === i ? e.target.value : x)))
                }
                className={inputCls}
              />
              {v.passengers.length > 1 && (
                <button
                  type="button"
                  className="rounded-md px-3 text-sm text-stone-700 ring-1 ring-stone-300"
                  onClick={() => set('passengers')(v.passengers.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        {v.passengers.length < LIMITS.maxPassengers && (
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-blue-800 underline"
            onClick={() => set('passengers')([...v.passengers, ''])}
          >
            + Add passenger
          </button>
        )}
        {fe('passengers') && (
          <p className="mt-1 text-sm font-medium text-red-700">{fe('passengers')}</p>
        )}
      </fieldset>

      <fieldset>
        <legend className="font-medium text-stone-800">Expenses (optional)</legend>
        <p className="text-sm text-stone-600">Meals, a hotel or transport you paid for yourself.</p>
        <div className="mt-2 space-y-3">
          {v.expenses.map((x, i) => {
            const upd = (patch: Partial<Expense>) =>
              set('expenses')(v.expenses.map((y, j) => (j === i ? { ...y, ...patch } : y)));
            return (
              <div
                key={i}
                className="grid gap-2 rounded-md border border-stone-200 p-3 sm:grid-cols-4"
              >
                <select
                  aria-label={`Expense ${i + 1} type`}
                  value={x.type}
                  onChange={(e) => upd({ type: e.target.value as ExpenseType })}
                  className={inputCls}
                >
                  {(Object.keys(EXPENSE_TYPES) as ExpenseType[]).map((k) => (
                    <option key={k} value={k}>
                      {EXPENSE_TYPES[k]}
                    </option>
                  ))}
                </select>
                <input
                  aria-label={`Expense ${i + 1} description`}
                  placeholder="What it was"
                  value={x.description}
                  maxLength={LIMITS.expenseDesc}
                  onChange={(e) => upd({ description: e.target.value })}
                  className={inputCls}
                />
                <input
                  aria-label={`Expense ${i + 1} amount in pounds`}
                  placeholder="£ amount"
                  inputMode="decimal"
                  value={x.amount}
                  maxLength={8}
                  onChange={(e) => upd({ amount: e.target.value })}
                  className={inputCls}
                />
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={x.receipt}
                      onChange={(e) => upd({ receipt: e.target.checked })}
                      className="accent-blue-700"
                    />
                    Receipt
                  </label>
                  <button
                    type="button"
                    className="text-sm text-stone-700 underline"
                    onClick={() => set('expenses')(v.expenses.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {v.expenses.length < LIMITS.maxExpenses && (
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-blue-800 underline"
            onClick={() =>
              set('expenses')([
                ...v.expenses,
                { type: 'meals', description: '', amount: '', receipt: true },
              ])
            }
          >
            + Add expense
          </button>
        )}
        {Object.keys(fieldErrors).some((k) => k.startsWith('expenses')) && (
          <p className="mt-1 text-sm font-medium text-red-700">
            Check each expense has an amount above £0.
          </p>
        )}
      </fieldset>

      <h2 className="pt-2 text-lg font-bold">3. Your details</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Your full name"
          autoComplete="name"
          value={v.claimantName}
          onChange={set('claimantName')}
          maxLength={LIMITS.name}
          error={fe('claimantName')}
        />
        <TextField
          label="Your email"
          type="email"
          autoComplete="email"
          value={v.claimantEmail}
          onChange={set('claimantEmail')}
          maxLength={LIMITS.email}
          error={fe('claimantEmail')}
        />
      </div>
      <TextArea
        label="Your address"
        autoComplete="street-address"
        rows={3}
        value={v.claimantAddress}
        onChange={set('claimantAddress')}
        maxLength={LIMITS.address}
        error={fe('claimantAddress')}
      />
      <TextArea
        label="Anything else the airline should know? (optional)"
        hint="Stick to the facts. We only use what you tell us."
        rows={4}
        value={v.extra}
        onChange={set('extra')}
        maxLength={LIMITS.extra}
        required={false}
        error={fe('extra')}
      />

      {Object.keys(fieldErrors).length > 0 && (
        <Notice tone="error">Please fix the highlighted fields.</Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}

      <Button type="submit" busy={busy} disabled={blocked} className="w-full sm:w-auto">
        {busy
          ? 'Taking you to secure checkout…'
          : `Continue to payment – ${formatPrice(tool.pricePence)}`}
      </Button>
      {blocked && (
        <p className="text-sm text-stone-700">
          We won’t sell you a letter for a flight that doesn’t appear to qualify.
        </p>
      )}
      <CheckoutSmallPrint what="letter" />
    </form>
  );
}
