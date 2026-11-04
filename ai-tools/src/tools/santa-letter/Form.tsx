import { useState } from 'react';
import {
  AGE_BANDS,
  SANTA_LIMITS,
  SANTA_TONES,
  santaLetterSchema,
  type AgeBand,
  type SantaTone,
} from '../../../shared/schemas/santa-letter';
import { TOOLS, formatPrice } from '../../../shared/tools';
import {
  BackShortly,
  Button,
  Notice,
  RadioGroup,
  TextField,
  useAcceptingOrders,
} from '../../components/ui';
import { CheckoutSmallPrint, issuesToFieldErrors } from '../../components/ToolLanding';
import { useInSeason } from '../../lib/season';
import { useCheckout } from '../useCheckout';

const tool = TOOLS['santa-letter'];

export function BackNextChristmas() {
  return (
    <Notice tone="warn">
      <strong>Back next Christmas.</strong> {tool.season?.offSeasonNote}
    </Notice>
  );
}

export function SantaLetterForm() {
  const accepting = useAcceptingOrders();
  const inSeason = useInSeason(tool.id);
  const { submit, busy, error, fieldErrors, setFieldErrors } = useCheckout(tool.id);
  const [childName, setChildName] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand | ''>('');
  const [goodThings, setGoodThings] = useState(['', '', '']);
  const [encouragement, setEncouragement] = useState('');
  const [siblingName, setSiblingName] = useState('');
  const [petName, setPetName] = useState('');
  const [presentHint, setPresentHint] = useState('');
  const [tone, setTone] = useState<SantaTone | ''>('');
  const fe = (k: string) => fieldErrors[k]?.[0];

  if (inSeason === false) return <BackNextChristmas />;
  if (accepting === false) return <BackShortly />;

  return (
    <form
      noValidate
      className="space-y-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = santaLetterSchema.safeParse({
          childName,
          ageBand,
          goodThings,
          encouragement,
          siblingName,
          petName,
          presentHint,
          tone,
        });
        if (!parsed.success) return setFieldErrors(issuesToFieldErrors(parsed.error.issues));
        void submit(parsed.data);
      }}
    >
      <TextField
        label="Your child’s first name"
        hint="First name only – no surname or address needed."
        autoComplete="off"
        value={childName}
        onChange={setChildName}
        maxLength={SANTA_LIMITS.name}
        error={fe('childName')}
      />
      <RadioGroup
        legend="Age"
        value={ageBand}
        onChange={setAgeBand}
        error={fe('ageBand')}
        options={(Object.keys(AGE_BANDS) as AgeBand[]).map((k) => ({
          value: k,
          label: AGE_BANDS[k],
        }))}
      />
      <fieldset className="space-y-3">
        <legend className="font-medium text-stone-800">
          Good things they did this year (1 to 3)
        </legend>
        <p className="text-sm text-stone-600">
          For example: learned to ride a bike, helped Grandma in the garden, was brave at the
          dentist.
        </p>
        {goodThings.map((g, i) => (
          <TextField
            key={i}
            label={i === 0 ? 'Good thing 1' : `Good thing ${i + 1} (optional)`}
            required={i === 0}
            value={g}
            maxLength={SANTA_LIMITS.goodThing}
            onChange={(v) => setGoodThings((arr) => arr.map((x, j) => (j === i ? v : x)))}
          />
        ))}
        {fe('goodThings') && <p className="text-sm font-medium text-red-700">{fe('goodThings')}</p>}
      </fieldset>
      <TextField
        label="A gentle encouragement (optional)"
        hint="For example: keep being kind to your little brother."
        value={encouragement}
        onChange={setEncouragement}
        maxLength={SANTA_LIMITS.encouragement}
        error={fe('encouragement')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Sibling’s first name (optional)"
          autoComplete="off"
          value={siblingName}
          onChange={setSiblingName}
          maxLength={SANTA_LIMITS.name}
          error={fe('siblingName')}
        />
        <TextField
          label="Pet’s name (optional)"
          autoComplete="off"
          value={petName}
          onChange={setPetName}
          maxLength={SANTA_LIMITS.name}
          error={fe('petName')}
        />
      </div>
      <TextField
        label="Present hint (optional)"
        hint="Kept vague – Father Christmas never promises a present."
        value={presentHint}
        onChange={setPresentHint}
        maxLength={SANTA_LIMITS.presentHint}
        error={fe('presentHint')}
      />
      <RadioGroup
        legend="Tone"
        value={tone}
        onChange={setTone}
        error={fe('tone')}
        options={(Object.keys(SANTA_TONES) as SantaTone[]).map((k) => ({
          value: k,
          label: SANTA_TONES[k],
        }))}
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
