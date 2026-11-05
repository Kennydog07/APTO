import { useState } from 'react';
import {
  CHILD_BANDS,
  EQUIPMENT,
  MEAL_CHOICES,
  MEAL_LIMITS as L,
  SKILLS,
  mealPlannerSchema,
  type ChildBand,
  type Equipment,
  type MealChoice,
  type Skill,
} from '../../../shared/schemas/meal-planner';
import {
  ALLERGENS,
  DIETS,
  MEAL_NOTICE,
  type Allergen,
  type Diet,
} from '../../../shared/rules/allergens';
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

const tool = TOOLS['meal-planner'];

export function MealPlannerForm() {
  const accepting = useAcceptingOrders();
  const { submit, busy, error, fieldErrors, setFieldErrors } = useCheckout(tool.id);
  const [v, setV] = useState({
    adults: '2',
    kids: { under5: '0', '5to11': '0', '12to17': '0' } as Record<ChildBand, string>,
    meals: '' as '' | MealChoice,
    diets: [] as Diet[],
    allergens: [] as Allergen[],
    otherAllergies: '',
    dislikes: '',
    budget: '',
    weekdayMinutes: '' as '' | '15' | '30' | '45',
    skill: '' as '' | Skill,
    batch: '' as '' | 'yes' | 'no',
    equipment: ['oven', 'hob'] as Equipment[],
    useUp: '',
  });
  const set =
    <K extends keyof typeof v>(k: K) =>
    (val: (typeof v)[K]) =>
      setV((s) => ({ ...s, [k]: val }));
  const fe = (k: string) => fieldErrors[k]?.[0];
  const children = (Object.keys(CHILD_BANDS) as ChildBand[]).flatMap((b) =>
    Array.from({ length: Math.min(8, Math.max(0, Number(v.kids[b]) || 0)) }, () => b),
  );
  const payload = {
    ...v,
    kids: undefined,
    children,
    meals: v.meals || undefined,
    skill: v.skill || undefined,
    weekdayMinutes: v.weekdayMinutes || undefined,
    budget: v.budget === '' ? undefined : v.budget,
    batch: v.batch === 'yes',
  };

  if (accepting === false) return <BackShortly />;

  return (
    <form
      noValidate
      className="space-y-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = mealPlannerSchema.safeParse(payload);
        if (!parsed.success) {
          setFieldErrors(issuesToFieldErrors(parsed.error.issues));
          return;
        }
        void submit(parsed.data);
      }}
    >
      <Notice>{MEAL_NOTICE}</Notice>

      <h2 className="text-lg font-bold">1. Who’s eating?</h2>
      <div className="grid gap-4 sm:grid-cols-4">
        <TextField
          label="Adults"
          inputMode="numeric"
          value={v.adults}
          onChange={set('adults')}
          maxLength={1}
          error={fe('adults')}
        />
        {(Object.keys(CHILD_BANDS) as ChildBand[]).map((b) => (
          <TextField
            key={b}
            label={`Children ${CHILD_BANDS[b]}`}
            inputMode="numeric"
            value={v.kids[b]}
            onChange={(x) => setV((s) => ({ ...s, kids: { ...s.kids, [b]: x } }))}
            maxLength={1}
            required={false}
          />
        ))}
      </div>
      <RadioGroup
        legend="Which meals should we plan?"
        value={v.meals}
        onChange={set('meals')}
        error={fe('meals')}
        options={(Object.keys(MEAL_CHOICES) as MealChoice[]).map((k) => ({
          value: k,
          label: MEAL_CHOICES[k],
        }))}
      />

      <h2 className="pt-2 text-lg font-bold">2. Diet and allergies</h2>
      <CheckboxGroup
        legend="Diet (optional)"
        values={v.diets}
        onChange={set('diets')}
        error={fe('diets')}
        options={(Object.keys(DIETS) as Diet[]).map((k) => ({ value: k, label: DIETS[k] }))}
      />
      <CheckboxGroup
        legend="Allergies – tick any that must be left out"
        values={v.allergens}
        onChange={set('allergens')}
        options={(Object.keys(ALLERGENS) as Allergen[]).map((k) => ({
          value: k,
          label: ALLERGENS[k],
        }))}
      />
      <TextField
        label="Any other allergies (optional)"
        value={v.otherAllergies}
        onChange={set('otherAllergies')}
        maxLength={L.otherAllergies}
        required={false}
        error={fe('otherAllergies')}
      />
      <TextField
        label="Foods you don’t like (optional)"
        value={v.dislikes}
        onChange={set('dislikes')}
        maxLength={L.dislikes}
        required={false}
        error={fe('dislikes')}
      />
      <p className="text-sm text-stone-600">
        We check the plan word by word against your allergies, diet and dislikes and redo it if
        anything slips in – but always check the labels when you shop.
      </p>

      <h2 className="pt-2 text-lg font-bold">3. Budget and kitchen</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Weekly food budget (£)"
          inputMode="decimal"
          value={v.budget}
          onChange={set('budget')}
          maxLength={6}
          error={fe('budget')}
        />
      </div>
      <RadioGroup
        legend="Weekday cooking time"
        value={v.weekdayMinutes}
        onChange={set('weekdayMinutes')}
        error={fe('weekdayMinutes')}
        options={[
          { value: '15', label: '15 minutes' },
          { value: '30', label: '30 minutes' },
          { value: '45', label: '45 minutes' },
        ]}
      />
      <RadioGroup
        legend="Cooking skill"
        value={v.skill}
        onChange={set('skill')}
        error={fe('skill')}
        options={(Object.keys(SKILLS) as Skill[]).map((k) => ({ value: k, label: SKILLS[k] }))}
      />
      <RadioGroup
        legend="Batch cooking and planned leftovers?"
        value={v.batch}
        onChange={set('batch')}
        options={[
          { value: 'yes', label: 'Yes – cook once, eat twice' },
          { value: 'no', label: 'No – something different each night' },
        ]}
      />
      <CheckboxGroup
        legend="Equipment you have"
        values={v.equipment}
        onChange={set('equipment')}
        error={fe('equipment')}
        options={(Object.keys(EQUIPMENT) as Equipment[]).map((k) => ({
          value: k,
          label: EQUIPMENT[k],
        }))}
      />
      <TextArea
        label="Anything to use up? (optional)"
        hint="e.g. “half a bag of spinach, a tub of yoghurt”."
        rows={2}
        value={v.useUp}
        onChange={set('useUp')}
        maxLength={L.useUp}
        required={false}
        error={fe('useUp')}
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
      <CheckoutSmallPrint what="meal plan" />
    </form>
  );
}
