/**
 * The 14 UK major allergens and a keyword table used to CHECK the AI's meal plan in code.
 * List checked 2026-11-05 against https://www.gov.uk/food-allergies/information-businesses-provide
 * (FSA: celery, cereals containing gluten, crustaceans, eggs, fish, lupin, milk, molluscs, mustard,
 * tree nuts, peanuts, sesame, soybeans, sulphur dioxide and sulphites).
 *
 * The synonym table is deliberately broad: a false alarm only causes a retry, a miss could hurt someone.
 * It can never be complete, which is why every output carries MEAL_NOTICE.
 */
export const ALLERGENS_CHECKED = '2026-11-05';

export const MEAL_NOTICE =
  'Always check ingredient labels for allergens. This is not medical or nutritional advice.';

export const ALLERGENS = {
  celery: 'Celery',
  gluten: 'Cereals containing gluten (wheat, rye, barley, oats)',
  crustaceans: 'Crustaceans (e.g. prawns, crab)',
  eggs: 'Eggs',
  fish: 'Fish',
  lupin: 'Lupin',
  milk: 'Milk',
  molluscs: 'Molluscs (e.g. mussels, squid)',
  mustard: 'Mustard',
  tree_nuts: 'Tree nuts (e.g. almonds, walnuts)',
  peanuts: 'Peanuts',
  sesame: 'Sesame',
  soya: 'Soya',
  sulphites: 'Sulphur dioxide / sulphites',
} as const;
export type Allergen = keyof typeof ALLERGENS;

/** Words that mean the allergen is (or may be) present. Matched as whole words, plural-tolerant. */
export const ALLERGEN_SYNONYMS: Record<Allergen, string[]> = {
  celery: ['celery', 'celeriac', 'celery salt', 'celery seed'],
  gluten: [
    'wheat',
    'flour',
    'plain flour',
    'self-raising flour',
    'bread',
    'breadcrumbs',
    'panko',
    'pasta',
    'spaghetti',
    'penne',
    'fusilli',
    'macaroni',
    'lasagne',
    'linguine',
    'tagliatelle',
    'noodles',
    'couscous',
    'bulgur',
    'bulgar',
    'barley',
    'pearl barley',
    'rye',
    'oats',
    'oat',
    'porridge',
    'granola',
    'muesli',
    'semolina',
    'spelt',
    'tortilla',
    'tortillas',
    'wrap',
    'wraps',
    'pitta',
    'naan',
    'chapati',
    'roti',
    'pastry',
    'puff pastry',
    'filo',
    'pizza',
    'bagel',
    'crumpet',
    'muffin',
    'croutons',
    'cracker',
    'crackers',
    'biscuit',
    'biscuits',
    'cake',
    'soy sauce',
    'beer',
    'seitan',
    'gnocchi',
    'dumplings',
    'yorkshire pudding',
    'stuffing',
    'brioche',
    'baguette',
    'sourdough',
    'roll',
    'rolls',
    'bun',
    'buns',
    'toast',
    'cereal',
    'weetabix',
    'gravy granules',
  ],
  crustaceans: [
    'prawn',
    'prawns',
    'shrimp',
    'crab',
    'lobster',
    'langoustine',
    'crayfish',
    'scampi',
  ],
  eggs: [
    'egg',
    'eggs',
    'mayonnaise',
    'mayo',
    'meringue',
    'egg noodles',
    'quiche',
    'frittata',
    'omelette',
    'fresh pasta',
    'aioli',
    'hollandaise',
    'custard',
    'brioche',
    'yorkshire pudding',
    'pancake',
    'pancakes',
  ],
  fish: [
    'fish',
    'salmon',
    'cod',
    'tuna',
    'haddock',
    'mackerel',
    'sardine',
    'sardines',
    'anchovy',
    'anchovies',
    'pollock',
    'trout',
    'basa',
    'hake',
    'plaice',
    'sea bass',
    'kipper',
    'kippers',
    'fish sauce',
    'worcestershire sauce',
    'fish fingers',
    'fishcakes',
  ],
  lupin: ['lupin', 'lupini'],
  milk: [
    'milk',
    'butter',
    'cheese',
    'cheddar',
    'mozzarella',
    'parmesan',
    'feta',
    'halloumi',
    'paneer',
    'ricotta',
    'mascarpone',
    'cream cheese',
    'cream',
    'soured cream',
    'double cream',
    'single cream',
    'yoghurt',
    'yogurt',
    'ghee',
    'creme fraiche',
    'crème fraîche',
    'custard',
    'whey',
    'fromage frais',
    'quark',
    'buttermilk',
    'brie',
    'stilton',
    'gouda',
    'emmental',
    'gruyere',
    'cottage cheese',
    'kefir',
    'lassi',
    'raita',
    'tzatziki',
    'ice cream',
    'white sauce',
    'bechamel',
    'béchamel',
    'parmigiano',
  ],
  molluscs: [
    'mussel',
    'mussels',
    'clam',
    'clams',
    'oyster',
    'oysters',
    'squid',
    'calamari',
    'octopus',
    'scallop',
    'scallops',
    'cockle',
    'cockles',
    'whelk',
    'whelks',
    'oyster sauce',
  ],
  mustard: ['mustard', 'dijon', 'wholegrain mustard', 'mustard seeds', 'english mustard'],
  tree_nuts: [
    'nuts',
    'mixed nuts',
    'almond',
    'almonds',
    'ground almonds',
    'cashew',
    'cashews',
    'walnut',
    'walnuts',
    'pecan',
    'pecans',
    'hazelnut',
    'hazelnuts',
    'pistachio',
    'pistachios',
    'brazil nut',
    'brazil nuts',
    'macadamia',
    'pine nuts',
    'praline',
    'marzipan',
    'pesto',
    'nutella',
    'frangipane',
  ],
  peanuts: [
    'peanut',
    'peanuts',
    'peanut butter',
    'groundnut',
    'groundnuts',
    'satay',
    'monkey nuts',
  ],
  sesame: [
    'sesame',
    'sesame oil',
    'sesame seeds',
    'tahini',
    'hummus',
    'houmous',
    'halva',
    'za’atar',
    "za'atar",
  ],
  soya: ['soy', 'soya', 'soy sauce', 'tofu', 'edamame', 'tempeh', 'miso', 'tamari', 'soya mince'],
  sulphites: [
    'wine',
    'red wine',
    'white wine',
    'cider',
    'beer',
    'sulphite',
    'sulphites',
    'dried apricots',
    'dried fruit',
    'raisins',
    'sultanas',
    'sausage',
    'sausages',
    'balsamic',
    'vinegar',
    'prosecco',
  ],
};

/**
 * Look-alike words removed BEFORE any check ("butternut squash" is not a nut, "nutmeg" is a seed,
 * "cream of tartar" is not dairy).
 */
export const LOOKALIKES: RegExp[] = [
  /\bbutter ?beans?\b/gi,
  /\bbutternut( squash)?\b/gi,
  /\bcream of tartar\b/gi,
  /\b(cocoa|shea) butter\b/gi,
  /\b(ground )?nutmeg\b/gi,
  /\beggplant\b/gi,
  /\bcornflour\b/gi,
];

const freeFrom = (names: string) => new RegExp(`\\b(${names})[- ]free [\\w-]+(?: [\\w-]+)?`, 'gi');

/**
 * Phrases that are safe for ONE allergen only, removed just for that allergen's check.
 * ("almond milk" is fine for a milk allergy but not for a tree-nut allergy.)
 */
export const SAFE_FOR: Partial<Record<Allergen, RegExp[]>> = {
  milk: [
    /\b(coconut|oat|almond|soya|soy|rice|cashew|hazelnut|hemp|pea) (milk|cream|yoghurt|yogurt|drink)\b/gi,
    /\b(vegan|plant[- ]based|dairy[- ]free) [\w-]+(?: [\w-]+)?/gi,
    freeFrom('dairy|milk|lactose'),
    /\bpeanut butter\b/gi,
    /\bnut butter\b/gi,
  ],
  gluten: [
    freeFrom('gluten|wheat'),
    /\b(corn|rice|gram|chickpea|buckwheat|tapioca|potato) (flour|noodles|tortillas?|wraps?|cakes?|crackers?|pasta)\b/gi,
  ],
  eggs: [freeFrom('egg'), /\b(vegan|plant[- ]based) [\w-]+(?: [\w-]+)?/gi],
  tree_nuts: [freeFrom('nut')],
  peanuts: [freeFrom('nut|peanut')],
  soya: [freeFrom('soya|soy')],
  sesame: [freeFrom('sesame')],
  mustard: [freeFrom('mustard')],
  celery: [freeFrom('celery')],
  sulphites: [freeFrom('sulphite')],
};

/** Diet rules: the same keyword approach. Allergy-based diets reuse the allergen lists. */
const MEAT = [
  'chicken',
  'beef',
  'pork',
  'lamb',
  'mutton',
  'bacon',
  'ham',
  'gammon',
  'turkey',
  'duck',
  'goose',
  'venison',
  'veal',
  'chorizo',
  'salami',
  'pepperoni',
  'prosciutto',
  'pancetta',
  'mince',
  'steak',
  'sausage',
  'sausages',
  'meatballs',
  'burger',
  'burgers',
  'lard',
  'suet',
  'gelatine',
  'gelatin',
  'black pudding',
  'liver',
  'kidney',
  'oxtail',
  'brisket',
  'stock cube',
  'chicken stock',
  'beef stock',
];
const PORK_ALCOHOL = [
  'pork',
  'bacon',
  'ham',
  'gammon',
  'chorizo',
  'salami',
  'pepperoni',
  'prosciutto',
  'pancetta',
  'lard',
  'gelatine',
  'gelatin',
  'wine',
  'red wine',
  'white wine',
  'beer',
  'cider',
  'sherry',
  'brandy',
  'rum',
  'pork sausages',
];
const SEAFOOD = [
  ...ALLERGEN_SYNONYMS.fish,
  ...ALLERGEN_SYNONYMS.crustaceans,
  ...ALLERGEN_SYNONYMS.molluscs,
];

export const DIETS = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  pescatarian: 'Pescatarian',
  halal: 'Halal',
  gluten_free: 'Gluten-free',
  dairy_free: 'Dairy-free',
} as const;
export type Diet = keyof typeof DIETS;

export const DIET_BANNED: Record<Diet, string[]> = {
  vegetarian: [...MEAT, ...SEAFOOD],
  vegan: [...MEAT, ...SEAFOOD, ...ALLERGEN_SYNONYMS.milk, ...ALLERGEN_SYNONYMS.eggs, 'honey'],
  pescatarian: MEAT,
  halal: PORK_ALCOHOL,
  gluten_free: ALLERGEN_SYNONYMS.gluten,
  dairy_free: ALLERGEN_SYNONYMS.milk,
};

/** Meat-free versions that are fine for vegetarian/vegan/halal diets ("veggie sausages", "Quorn mince"). */
const MEAT_FREE =
  /\b(veggie|vegetarian|vegan|meat[- ]free|plant[- ]based|quorn|soya|soy|halal|lentil|bean|mushroom|chickpea|vegetable|veg) [\w-]+(?: [\w-]+)?/gi;

export function normalise(s: string): string {
  return ` ${s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^a-z0-9'àâçéèêëîïôûùüÿñæœ\s-]/g, ' ')
    .replace(/\s+/g, ' ')} `;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Whole-word (or whole-phrase) match, tolerating a plural "s"/"es". */
function hasWord(text: string, word: string): boolean {
  const w = normalise(word).trim();
  if (w.length < 2) return false;
  return new RegExp(`(^|[^a-z])${escape(w)}(s|es)?([^a-z]|$)`, 'i').test(text);
}

function strip(text: string, patterns: RegExp[] = []): string {
  let t = text;
  for (const r of patterns) t = t.replace(r, ' ');
  return t;
}

/** Split free text ("mushrooms, olives and coriander") into keywords. */
export function keywords(free: string): string[] {
  return (
    free
      .split(/,|;|\/|\n|\band\b|\bor\b|&/i)
      .map((s) =>
        s
          .trim()
          .toLowerCase()
          .replace(/^(no|not|any|i hate|hate|dislike)\s+/, ''),
      )
      .filter((s) => s.length >= 3 && s.length <= 40)
      // "mushrooms" should also catch "mushroom", "tomatoes" -> "tomato".
      .map((s) =>
        s.length > 4
          ? s.replace(/(oes|ies|s)$/, (m) => (m === 'ies' ? 'y' : m === 'oes' ? 'o' : ''))
          : s,
      )
  );
}

export interface Hit {
  rule: string;
  word: string;
  where: string;
}

/**
 * Check every piece of text in a plan. Returns each banned word found, with where it was found.
 * `texts` is a list of [where, text] pairs (meal names, ingredients, shopping items...).
 */
export function findBanned(
  texts: [string, string][],
  rules: { allergens: Allergen[]; diets: Diet[]; extraKeywords: string[]; dislikes: string[] },
): Hit[] {
  const hits: Hit[] = [];
  for (const [where, raw] of texts) {
    const base = normalise(raw);
    const t = strip(base, LOOKALIKES);
    for (const a of rules.allergens) {
      const ta = strip(t, SAFE_FOR[a]);
      for (const w of ALLERGEN_SYNONYMS[a])
        if (hasWord(ta, w)) hits.push({ rule: ALLERGENS[a], word: w, where });
    }
    for (const d of rules.diets) {
      const safe =
        d === 'gluten_free'
          ? SAFE_FOR.gluten!
          : d === 'dairy_free'
            ? SAFE_FOR.milk!
            : d === 'vegan'
              ? [MEAT_FREE, ...SAFE_FOR.milk!, ...SAFE_FOR.eggs!]
              : [MEAT_FREE];
      const td = strip(t, safe);
      for (const w of DIET_BANNED[d])
        if (hasWord(td, w)) hits.push({ rule: DIETS[d], word: w, where });
    }
    // Free-text allergies and dislikes are matched against the raw text (no safe-phrase removal).
    for (const w of rules.extraKeywords)
      if (hasWord(base, w)) hits.push({ rule: 'Allergy', word: w, where });
    // A dislike of olives is not a dislike of olive oil.
    const td = base.replace(/\b[a-z]+ oil\b/g, ' ');
    for (const w of rules.dislikes)
      if (hasWord(td, w)) hits.push({ rule: 'Dislike', word: w, where });
  }
  return hits;
}
