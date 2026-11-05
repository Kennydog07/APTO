import {
  AISLES,
  CHILD_BANDS,
  MEAL_CHOICES,
  mealPlannerSchema,
  householdSize,
  type Aisle,
  type MealPlannerInputs,
} from '../../../shared/schemas/meal-planner.ts';
import { ALLERGENS, DIETS, MEAL_NOTICE } from '../../../shared/rules/allergens.ts';
import { mealPlannerPrompt, planTotal, type MealOutput } from '../../../prompts/meal-planner.ts';
import { mealPlanToPdf, type MealDoc } from '../docs/meal-pdf.ts';
import type { MealDisplay } from '../../../shared/meal-display.ts';
import type { ToolGenerator } from './types.ts';

export function columnsFor(meals: MealPlannerInputs['meals']): MealDoc['columns'] {
  return meals === 'all'
    ? ['breakfast', 'lunch', 'dinner']
    : meals === 'lunch_dinner'
      ? ['lunch', 'dinner']
      : ['dinner'];
}

export function groupShopping(o: MealOutput) {
  return (Object.keys(AISLES) as Aisle[])
    .map((a) => ({
      aisle: AISLES[a],
      items: o.shopping
        .filter((s) => s.aisle === a)
        .map(({ item, quantity, cost }) => ({ item, quantity, cost })),
    }))
    .filter((g) => g.items.length);
}

export function shoppingText(o: MealOutput): string {
  return groupShopping(o)
    .map((g) =>
      [g.aisle.toUpperCase(), ...g.items.map((i) => `[ ] ${i.item} – ${i.quantity}`)].join('\n'),
    )
    .join('\n\n');
}

export function avoidSummary(inputs: MealPlannerInputs): string[] {
  return [
    ...inputs.diets.map((d) => DIETS[d]),
    ...inputs.allergens.map((a) => `No ${ALLERGENS[a].replace(/ \(.*\)$/, '').toLowerCase()}`),
    ...(inputs.otherAllergies ? [`No ${inputs.otherAllergies}`] : []),
  ];
}

export function mealSubtitle(inputs: MealPlannerInputs): string {
  const kids = inputs.children.length
    ? ` + ${inputs.children.length} child${inputs.children.length > 1 ? 'ren' : ''} (${inputs.children.map((c) => CHILD_BANDS[c]).join(', ')})`
    : '';
  const avoid = avoidSummary(inputs);
  return `${inputs.adults} adult${inputs.adults === 1 ? '' : 's'}${kids} · ${MEAL_CHOICES[inputs.meals]} · up to ${inputs.weekdayMinutes} min on weekdays${avoid.length ? ` · ${avoid.join(', ')}` : ''}`;
}

export const mealPlannerGenerator: ToolGenerator<MealPlannerInputs, MealOutput> = {
  inputSchema: mealPlannerSchema as never,
  prompt: mealPlannerPrompt,
  async build(inputs, output) {
    const total = planTotal(output);
    const doc: MealDoc = {
      title: 'Your week of meals',
      subtitle: mealSubtitle(inputs),
      columns: columnsFor(inputs.meals),
      days: output.days,
      shopping: groupShopping(output),
      total,
      budget: inputs.budget,
      recipes: output.recipes,
      tips: output.tips,
      notice: MEAL_NOTICE,
    };
    const pdf = await mealPlanToPdf(doc);
    const display: MealDisplay = {
      subtitle: doc.subtitle,
      columns: doc.columns,
      days: output.days,
      shopping: doc.shopping,
      shoppingText: shoppingText(output),
      total,
      budget: inputs.budget,
      people: householdSize(inputs),
      recipes: output.recipes,
      tips: output.tips,
      notice: MEAL_NOTICE,
    };
    return {
      display,
      files: [
        {
          filename: 'meal-plan.pdf',
          label: 'Download PDF',
          contentType: 'application/pdf',
          bytes: pdf,
        },
      ],
    };
  },
};
