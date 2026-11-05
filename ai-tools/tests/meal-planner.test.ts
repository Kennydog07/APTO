import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
  ALLERGENS,
  ALLERGEN_SYNONYMS,
  findBanned,
  keywords,
  type Allergen,
  type Diet,
} from '../shared/rules/allergens.ts';
import { mealPlannerSchema } from '../shared/schemas/meal-planner.ts';
import { mealPlannerPrompt, planProblems, planTotal } from '../prompts/meal-planner.ts';
import { OutputParseError } from '../prompts/types.ts';
import { mealPlannerGenerator, shoppingText } from '../netlify/lib/generators/meal-planner.ts';
import { GENERATORS } from '../netlify/lib/generators/index.ts';
import { SAMPLE_INPUTS } from '../scripts/sample-inputs.ts';
import sample from '../src/samples/meal-planner.json';

const inputs = mealPlannerSchema.parse(SAMPLE_INPUTS['meal-planner']);
const check = (
  text: string,
  o: { allergens?: Allergen[]; diets?: Diet[]; extra?: string; dislikes?: string } = {},
) =>
  findBanned([['x', text]], {
    allergens: o.allergens ?? [],
    diets: o.diets ?? [],
    extraKeywords: keywords(o.extra ?? ''),
    dislikes: keywords(o.dislikes ?? ''),
  }).map((h) => h.word);
const clone = () => JSON.parse(JSON.stringify(sample)) as typeof sample;

describe('allergen table', () => {
  it('covers all 14 UK major allergens', () => {
    expect(Object.keys(ALLERGENS)).toHaveLength(14);
    for (const a of Object.keys(ALLERGENS) as Allergen[])
      expect(ALLERGEN_SYNONYMS[a].length).toBeGreaterThan(0);
  });
  it('catches allergens hidden in everyday ingredients', () => {
    expect(check('Pesto pasta', { allergens: ['tree_nuts'] })).toContain('pesto');
    expect(check('Chicken satay skewers', { allergens: ['peanuts'] })).toContain('satay');
    expect(check('Houmous and carrot sticks', { allergens: ['sesame'] })).toContain('houmous');
    expect(check('Stir fry with soy sauce', { allergens: ['gluten'] })).toContain('soy sauce');
    expect(check('Stir fry with soy sauce', { allergens: ['soya'] })).toContain('soy sauce');
    expect(check('2 tbsp mayo', { allergens: ['eggs'] })).toContain('mayo');
    expect(check('Grated Parmesan', { allergens: ['milk'] })).toContain('parmesan');
    expect(check('Garlic prawns', { allergens: ['crustaceans'] })).toContain('prawns');
    expect(check('Dash of Worcestershire sauce', { allergens: ['fish'] })).toContain(
      'worcestershire sauce',
    );
    expect(check('1 tsp Dijon', { allergens: ['mustard'] })).toContain('dijon');
    expect(check('Celeriac mash', { allergens: ['celery'] })).toContain('celeriac');
    expect(check('Squid rings', { allergens: ['molluscs'] })).toContain('squid');
    expect(check('Dried apricots', { allergens: ['sulphites'] })).toContain('dried apricots');
    expect(check('Lupin flour', { allergens: ['lupin'] })).toContain('lupin');
  });
  it('is case- and plural-insensitive', () => {
    expect(check('ALMONDS, toasted', { allergens: ['tree_nuts'] })).toContain('almonds');
    expect(check('Two Eggs', { allergens: ['eggs'] })).toContain('eggs');
  });
  it('does not flag look-alike words', () => {
    const all = Object.keys(ALLERGENS) as Allergen[];
    expect(check('Butternut squash soup with nutmeg', { allergens: all })).toEqual([]);
    expect(check('Butter bean stew', { allergens: ['milk'] })).toEqual([]);
    expect(check('Coconut milk curry', { allergens: ['milk', 'tree_nuts'] })).toEqual([]);
    expect(check('Rice noodles with cornflour', { allergens: ['gluten'] })).toEqual([]);
    expect(check('Gram flour pancakes', { allergens: ['gluten'] })).toEqual([]);
    expect(check('Gluten-free pasta', { allergens: ['gluten'] })).toEqual([]);
    expect(check('Cream of tartar', { allergens: ['milk'] })).toEqual([]);
  });
  it('a free-from swap is safe only for its own allergen', () => {
    expect(check('Almond milk', { allergens: ['milk'] })).toEqual([]);
    expect(check('Almond milk', { allergens: ['tree_nuts'] })).toContain('almond');
    expect(check('Oat milk porridge', { allergens: ['gluten'] })).toContain('oat');
    expect(check('Soya yoghurt', { allergens: ['soya'] })).toContain('soya');
  });
});

describe('diets, other allergies and dislikes', () => {
  it('vegetarian and vegan', () => {
    expect(check('Chicken pie', { diets: ['vegetarian'] })).toContain('chicken');
    expect(check('Veggie sausages and mash', { diets: ['vegetarian'] })).toEqual([]);
    expect(check('Quorn mince bolognese', { diets: ['vegetarian'] })).toEqual([]);
    expect(check('Cheese omelette', { diets: ['vegan'] })).toEqual(
      expect.arrayContaining(['cheese', 'omelette']),
    );
    expect(check('Vegan cheese toastie', { diets: ['vegan'] })).toEqual([]);
    expect(check('Honey glazed carrots', { diets: ['vegan'] })).toContain('honey');
  });
  it('pescatarian allows fish but not meat; halal rules out pork and alcohol', () => {
    expect(check('Salmon traybake', { diets: ['pescatarian'] })).toEqual([]);
    expect(check('Beef stew', { diets: ['pescatarian'] })).toContain('beef');
    expect(check('Bacon and pea risotto with white wine', { diets: ['halal'] })).toEqual(
      expect.arrayContaining(['bacon', 'white wine']),
    );
  });
  it('gluten-free and dairy-free reuse the allergen lists', () => {
    expect(check('Spaghetti bolognese', { diets: ['gluten_free'] })).toContain('spaghetti');
    expect(check('Gluten-free spaghetti', { diets: ['gluten_free'] })).toEqual([]);
    expect(check('Butter chicken', { diets: ['dairy_free'] })).toContain('butter');
  });
  it('free-text allergies and dislikes become keywords', () => {
    expect(keywords('No mushrooms, olives and coriander')).toEqual([
      'mushroom',
      'olive',
      'coriander',
    ]);
    expect(check('Kiwi fruit salad', { extra: 'kiwi' })).toContain('kiwi');
    expect(check('Mushroom stroganoff', { dislikes: 'mushrooms' })).toContain('mushroom');
    expect(check('Cherry tomatoes', { dislikes: 'tomatoes' })).toContain('tomato');
    // Disliking olives doesn't rule out olive oil.
    expect(check('2 tbsp olive oil', { dislikes: 'olives' })).toEqual([]);
  });
});

describe('meal planner output check', () => {
  it('the sample plan passes every check', () => {
    expect(planProblems(sample as never, inputs)).toEqual([]);
    expect(() => mealPlannerPrompt.parseOutput(JSON.stringify(sample), inputs)).not.toThrow();
  });
  it('rejects (so it retries) a plan containing an allergen the family ticked', () => {
    const bad = clone();
    bad.recipes[0]!.ingredients.push('50g cashews');
    expect(() => mealPlannerPrompt.parseOutput(JSON.stringify(bad), inputs)).toThrow(
      OutputParseError,
    );
    expect(planProblems(bad as never, inputs)[0]).toMatch(/cashews.*Tree nuts/);
  });
  it('rejects a disliked food in the shopping list', () => {
    const bad = clone();
    bad.shopping.push({
      aisle: 'fruit_veg',
      item: 'Chestnut mushrooms',
      quantity: '250g',
      cost: 1,
    });
    expect(planProblems(bad as never, inputs).join()).toMatch(/mushroom/);
  });
  it('rejects a plan more than 25% over budget, missing meals or missing recipe cards', () => {
    const over = clone();
    over.shopping[0]!.cost = 60;
    expect(planTotal(over as never)).toBeGreaterThan(inputs.budget * 1.25);
    expect(planProblems(over as never, inputs).join()).toMatch(/over the budget/);
    const noLunch = clone();
    delete (noLunch.days[2] as { lunch?: string }).lunch;
    expect(planProblems(noLunch as never, inputs).join()).toMatch(/requested meals/);
    const noCard = clone();
    noCard.days[0]!.dinner = 'Fish pie';
    expect(planProblems(noCard as never, inputs).join()).toMatch(/no recipe card/);
  });
  it('needs the inputs to check against', () => {
    expect(() => mealPlannerPrompt.parseOutput(JSON.stringify(sample))).toThrow(OutputParseError);
  });
  it('prompt carries the allergies and fences the free text', () => {
    const u = mealPlannerPrompt.buildUserPrompt(inputs);
    expect(u).toContain('Peanuts');
    expect(u).toContain('Tree nuts');
    expect(u).toMatch(/<user_account>[\s\S]*mushrooms, olives[\s\S]*<\/user_account>/);
    expect(mealPlannerPrompt.max_tokens).toBe(4000);
  });
});

describe('meal planner schema and build', () => {
  it('needs at least one person and some equipment', () => {
    expect(
      mealPlannerSchema.safeParse({ ...SAMPLE_INPUTS['meal-planner'], adults: 0, children: [] })
        .success,
    ).toBe(false);
    expect(
      mealPlannerSchema.safeParse({ ...SAMPLE_INPUTS['meal-planner'], equipment: [] }).success,
    ).toBe(false);
    expect(
      mealPlannerSchema.safeParse({ ...SAMPLE_INPUTS['meal-planner'], weekdayMinutes: 20 }).success,
    ).toBe(false);
  });
  it('is registered and builds a PDF with the notice and a copyable shopping list', async () => {
    expect(GENERATORS['meal-planner']).toBe(mealPlannerGenerator);
    const out = await mealPlannerGenerator.build(inputs, sample as never);
    expect(out.files.map((f) => f.filename)).toEqual(['meal-plan.pdf']);
    const pdf = await PDFDocument.load(out.files[0]!.bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(3);
    const d = out.display as { notice: string; shoppingText: string; total: number };
    expect(d.notice).toMatch(/Always check ingredient labels/);
    expect(d.shoppingText).toMatch(/^FRUIT & VEG\n\[ \] Onions – 1kg bag/);
    expect(shoppingText(sample as never)).toContain('FROZEN');
    expect(d.total).toBeCloseTo(59.35);
  });
});
