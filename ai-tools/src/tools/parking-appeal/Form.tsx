import { useState } from 'react';
import {
  PARKING_GROUNDS,
  LIMITS,
  parkingAppealSchema,
  type ParkingGround,
} from '../../../shared/schemas/parking-appeal';
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

const tool = TOOLS['parking-appeal'];

export function ParkingAppealForm() {
  const accepting = useAcceptingOrders();
  const { submit, busy, error, fieldErrors, setFieldErrors } = useCheckout(tool.id);
  const [v, setV] = useState({
    ticketType: '' as '' | 'council' | 'private',
    issuerName: '',
    ticketRef: '',
    ticketDate: '',
    location: '',
    vehicleReg: '',
    whatHappened: '',
    grounds: [] as ParkingGround[],
    otherGround: '',
    appellantName: '',
    appellantAddress: '',
  });
  const set =
    <K extends keyof typeof v>(k: K) =>
    (val: (typeof v)[K]) =>
      setV((s) => ({ ...s, [k]: val }));
  const fe = (k: string) => fieldErrors[k]?.[0];

  if (accepting === false) return <BackShortly />;

  return (
    <form
      noValidate
      className="space-y-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = parkingAppealSchema.safeParse(v);
        if (!parsed.success) {
          setFieldErrors(issuesToFieldErrors(parsed.error.issues));
          return;
        }
        void submit(parsed.data);
      }}
    >
      <Notice>This is a letter-writing tool, not legal advice.</Notice>

      <RadioGroup
        legend="What kind of ticket is it?"
        value={v.ticketType}
        onChange={set('ticketType')}
        error={fe('ticketType')}
        options={[
          {
            value: 'council',
            label: 'Council PCN',
            hint: 'Penalty Charge Notice from a local council',
          },
          { value: 'private', label: 'Private parking charge', hint: 'From a car park operator' },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Who issued it?"
          hint="Council or company name"
          value={v.issuerName}
          onChange={set('issuerName')}
          maxLength={LIMITS.issuerName}
          error={fe('issuerName')}
        />
        <TextField
          label="Ticket reference"
          value={v.ticketRef}
          onChange={set('ticketRef')}
          maxLength={LIMITS.ticketRef}
          error={fe('ticketRef')}
        />
        <TextField
          label="Date of ticket"
          type="date"
          value={v.ticketDate}
          onChange={set('ticketDate')}
          maxLength={10}
          error={fe('ticketDate')}
        />
        <TextField
          label="Vehicle registration"
          value={v.vehicleReg}
          onChange={set('vehicleReg')}
          maxLength={LIMITS.vehicleReg}
          error={fe('vehicleReg')}
        />
      </div>
      <TextField
        label="Location"
        hint="Street or car park name"
        value={v.location}
        onChange={set('location')}
        maxLength={LIMITS.location}
        error={fe('location')}
      />

      <CheckboxGroup
        legend="Your grounds for appeal (tick all that apply)"
        values={v.grounds}
        onChange={set('grounds')}
        error={fe('grounds')}
        options={(Object.keys(PARKING_GROUNDS) as ParkingGround[]).map((k) => ({
          value: k,
          label: PARKING_GROUNDS[k],
        }))}
      />
      {v.grounds.includes('other') && (
        <TextField
          label="Your other ground"
          value={v.otherGround}
          onChange={set('otherGround')}
          maxLength={LIMITS.otherGround}
          error={fe('otherGround')}
        />
      )}

      <TextArea
        label="What happened?"
        hint="Stick to the facts. We only use what you tell us."
        rows={6}
        value={v.whatHappened}
        onChange={set('whatHappened')}
        maxLength={LIMITS.whatHappened}
        error={fe('whatHappened')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Your full name"
          autoComplete="name"
          value={v.appellantName}
          onChange={set('appellantName')}
          maxLength={LIMITS.appellantName}
          error={fe('appellantName')}
        />
        <TextArea
          label="Your address"
          autoComplete="street-address"
          rows={3}
          value={v.appellantAddress}
          onChange={set('appellantAddress')}
          maxLength={LIMITS.appellantAddress}
          error={fe('appellantAddress')}
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
