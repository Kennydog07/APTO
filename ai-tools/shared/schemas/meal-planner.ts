import { z } from 'zod';
import { ALLERGENS, DIETS, type Allergen, type Diet } from '../rules/allergens.ts';

/** Form inputs for the weekly meal planner. Validated in the browser AND in create-job. */

export const CHILD_BANDS = { under5: 'Under 5', '5to11': '5–11', '12to17': '12–17' } as const;
export type ChildBand = keyof typeof CHILD_BANDS;

export const MEAL_CHOICES = {
  dinners: 'Dinners only',
  lunch_dinner: 'Lunches and dinners',
  all: 'Breakfast, lunch and dinner',
} as const;
export type MealChoice = keyof typeof MEAL_CHOICES;

export const SKILLS = {
  beginner: 'Beginner – keep it simple',
  confident: 'Confident home cook',
  keen: 'Keen cook – happy to try new things',
} as const;
export type Skill = keyof typeof SKILLS;

export const EQUIPMENT = {
  oven: 'Oven',
  hob: 'Hob',
  slow_cooker: 'Slow cooker',
  air_fryer: 'Air fryer',
  microwave: 'Microwave',
} as const;
export type Equipment = keyof typeof EQUIPMENT;

export const AISLES = {
  fruit_veg: 'Fruit & veg',
  meat_fish: 'Meat & fish',
  dairy: 'Dairy & eggs',
  cupboard: 'Cupboard',
  frozen: 'Frozen',
  bakery: 'Bakery',
  other: 'Other',
} as const;
export type Aisle = keyof typeof AISLES;

export const MEAL_LIMITS = {
  maxAdults: 8,
  maxChildren: 8,
  otherAllergies: 200,
  dislikes: 300,
  useUp: 300,
} as const;

export const mealPlannerSchema = z
  .object({
    adults: z.coerce.number().int().min(0).max(MEAL_LIMITS.maxAdults),
    children: z
      .array(z.enum(Object.keys(CHILD_BANDS) as [ChildBand, ...ChildBand[]]))
      .max(MEAL_LIMITS.maxChildren)
      .default([]),
    meals: z.enum(Object.keys(MEAL_CHOICES) as [MealChoice, ...MealChoice[]], {
      message: 'Choose which meals',
    }),
    diets: z.array(z.enum(Object.keys(DIETS) as [Diet, ...Diet[]])).default([]),
    allergens: z.array(z.enum(Object.keys(ALLERGENS) as [Allergen, ...Allergen[]])).default([]),
    otherAllergies: z.string().trim().max(MEAL_LIMITS.otherAllergies).optional().default(''),
    dislikes: z.string().trim().max(MEAL_LIMITS.dislikes).optional().default(''),
    budget: z.coerce
      .number({ message: 'Enter a weekly budget' })
      .min(15, 'Enter a budget of at least £15')
      .max(500, 'Enter a budget of £500 or less'),
    weekdayMinutes: z.coerce
      .number()
      .refine((n) => [15, 30, 45].includes(n), 'Choose a cooking time'),
    skill: z.enum(Object.keys(SKILLS) as [Skill, ...Skill[]], {
      message: 'Choose your cooking skill',
    }),
    batch: z.boolean().default(false),
    equipment: z
      .array(z.enum(Object.keys(EQUIPMENT) as [Equipment, ...Equipment[]]))
      .min(1, 'Choose at least one'),
    useUp: z.string().trim().max(MEAL_LIMITS.useUp).optional().default(''),
  })
  .refine((v) => v.adults + v.children.length >= 1, {
    path: ['adults'],
    message: 'Add at least one person',
  })
  .refine((v) => !(v.diets.includes('vegan') && v.diets.includes('pescatarian')), {
    path: ['diets'],
    message: 'Choose vegan or pescatarian, not both',
  });

export type MealPlannerInputs = z.infer<typeof mealPlannerSchema>;

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const householdSize = (v: Pick<MealPlannerInputs, 'adults' | 'children'>) =>
  v.adults + v.children.length;
