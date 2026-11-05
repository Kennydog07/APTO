/** What the done page shows for a meal plan (jobs.result.display). */
export interface MealDisplay {
  subtitle: string;
  columns: ('breakfast' | 'lunch' | 'dinner')[];
  days: { day: string; breakfast?: string; lunch?: string; dinner: string }[];
  shopping: { aisle: string; items: { item: string; quantity: string; cost: number }[] }[];
  shoppingText: string;
  total: number;
  budget: number;
  people: number;
  recipes: {
    name: string;
    serves: number;
    minutes: number;
    ingredients: string[];
    steps: string[];
  }[];
  tips: string[];
  notice: string;
}
