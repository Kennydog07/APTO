import { useState } from 'react';
import {
  AGE_BANDS,
  STORY_LENGTHS,
  STORY_LIMITS,
  STORY_THEMES,
  bedtimeStorySchema,
  type AgeBand,
  type StoryLength,
  type StoryTheme,
} from '../../../shared/schemas/bedtime-story';
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
import { useCheckout } from '../useCheckout';

const tool = TOOLS['bedtime-story'];

export function BedtimeStoryForm() {
  const accepting = useAcceptingOrders();
  const { submit, busy, error, fieldErrors, setFieldErrors } = useCheckout(tool.id);
  const [childName, setChildName] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand | ''>('');
  const [favourites, setFavourites] = useState(['', '', '']);
  const [theme, setTheme] = useState<StoryTheme | ''>('');
  const [length, setLength] = useState<StoryLength | ''>('');
  const fe = (k: string) => fieldErrors[k]?.[0];

  if (accepting === false) return <BackShortly />;

  return (
    <form
      noValidate
      className="space-y-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = bedtimeStorySchema.safeParse({
          childName,
          ageBand,
          favourites,
          theme,
          length,
        });
        if (!parsed.success) return setFieldErrors(issuesToFieldErrors(parsed.error.issues));
        void submit(parsed.data);
      }}
    >
      <TextField
        label="Your child’s first name"
        hint="First name only – no surname needed."
        autoComplete="off"
        value={childName}
        onChange={setChildName}
        maxLength={STORY_LIMITS.childName}
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
        <legend className="font-medium text-stone-800">Favourite things (1 to 3)</legend>
        <p className="text-sm text-stone-600">
          For example: dinosaurs, space, or their dog’s name.
        </p>
        {favourites.map((f, i) => (
          <TextField
            key={i}
            label={i === 0 ? 'Favourite thing 1' : `Favourite thing ${i + 1} (optional)`}
            required={i === 0}
            value={f}
            maxLength={STORY_LIMITS.favourite}
            onChange={(v) => setFavourites((arr) => arr.map((x, j) => (j === i ? v : x)))}
          />
        ))}
        {fe('favourites') && <p className="text-sm font-medium text-red-700">{fe('favourites')}</p>}
      </fieldset>
      <RadioGroup
        legend="Theme (optional)"
        value={theme}
        onChange={setTheme}
        options={[
          { value: '' as StoryTheme | '', label: 'No theme – surprise me' },
          ...(Object.keys(STORY_THEMES) as StoryTheme[]).map((k) => ({
            value: k,
            label: STORY_THEMES[k],
          })),
        ]}
      />
      <RadioGroup
        legend="Story length"
        value={length}
        onChange={setLength}
        error={fe('length')}
        options={(Object.keys(STORY_LENGTHS) as StoryLength[]).map((k) => ({
          value: k,
          label: STORY_LENGTHS[k],
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
      <CheckoutSmallPrint what="story" />
    </form>
  );
}
