import { TOOLS } from '../../../shared/tools';
import { Mascot } from '../../components/Mascot';
import { HowItWorks, type HowStep } from '../../components/HowItWorks';
import { ToolLanding } from '../../components/ToolLanding';
import { MEAL_FAQS } from './content';
import { MealPlannerForm } from './Form';

const STEPS: HowStep[] = [
  {
    t: 'Tell us about your household',
    d: 'Who’s eating, which meals, diet, allergies and dislikes.',
  },
  { t: 'Set your budget and time', d: 'Weekly budget, weekday cooking time, skill and equipment.' },
  { t: 'Pay £2.99', d: 'Secure checkout by Stripe.' },
  {
    t: 'Your week is planned',
    d: 'Checked against your allergies, diet and dislikes, and re-planned if anything slips in.',
  },
  {
    t: 'Print and shop',
    d: 'A 7-day planner, a shopping list by aisle with tick boxes, and a recipe card for every dinner.',
  },
];

export function MealPlannerPage() {
  return (
    <ToolLanding
      tool={TOOLS['meal-planner']}
      h1="Weekly meal plan & shopping list for your family"
      hero={
        <Mascot
          name="meals"
          alt="Cheerful APTO mascot in a chef’s hat stirring a bowl of pasta, with a weekly meal board behind"
        />
      }
      form={<MealPlannerForm />}
      extra={<HowItWorks steps={STEPS} />}
      faqs={MEAL_FAQS}
    />
  );
}
