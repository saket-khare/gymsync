/**
 * Built-in meal plan templates. Each can be assigned to a member (goal/diet matched).
 */
import type { MealPlanDay } from '@/types';

const defaultDay = (dayName: string): MealPlanDay => ({
  day: dayName,
  breakfast: {
    name: 'Oatmeal with fruits',
    description: 'Whole oats with banana and honey',
    portionSize: '1 bowl',
    prepTimeMinutes: 10,
  },
  lunch: {
    name: 'Grilled chicken salad',
    description: 'Mixed greens with grilled chicken, olive oil dressing',
    portionSize: '1 large bowl',
    prepTimeMinutes: 20,
  },
  dinner: {
    name: 'Fish with vegetables',
    description: 'Baked fish with steamed broccoli and quinoa',
    portionSize: '1 plate',
    prepTimeMinutes: 30,
  },
  calories: 1800,
  proteinG: 120,
  carbsG: 180,
  fatsG: 60,
  waterLitres: 2.5,
});

export interface BuiltInTemplate {
  id: string;
  name: string;
  goal: string;
  dietType: string;
  weeklyCalorieTarget: number;
  generalGuidelines: string[];
  foodsToAvoid: string[];
  days: MealPlanDay[];
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    id: 'veg-weight-loss',
    name: 'Vegetarian Weight Loss',
    goal: 'weight_loss',
    dietType: 'vegetarian',
    weeklyCalorieTarget: 14000,
    generalGuidelines: [
      'Eat a protein-rich breakfast to curb midday hunger.',
      'Include fibre-rich vegetables at every meal.',
      'Limit added sugars and refined carbs.',
    ],
    foodsToAvoid: ['Fried foods', 'Sugary drinks', 'White bread', 'Full-fat dairy in excess'],
    days: DAY_NAMES.map((d) => defaultDay(d)),
  },
  {
    id: 'nonveg-muscle',
    name: 'Non-Veg Muscle Gain',
    goal: 'muscle_gain',
    dietType: 'non_vegetarian',
    weeklyCalorieTarget: 17500,
    generalGuidelines: [
      'Eat 1.6–2.2 g protein per kg body weight daily.',
      'Spread protein across meals (20–40 g per meal).',
      'Time carbs around training when possible.',
    ],
    foodsToAvoid: ['Alcohol', 'Highly processed snacks', 'Excess added sugar'],
    days: DAY_NAMES.map((d) => defaultDay(d)),
  },
  {
    id: 'veg-general',
    name: 'Vegetarian General Fitness',
    goal: 'general_fitness',
    dietType: 'vegetarian',
    weeklyCalorieTarget: 15400,
    generalGuidelines: [
      'Balanced plates: half vegetables, quarter protein, quarter carbs.',
      'Stay hydrated; aim for 2–3 L per day.',
      'Eat whole foods most of the time.',
    ],
    foodsToAvoid: ['Excess fried food', 'Sugary drinks'],
    days: DAY_NAMES.map((d) => defaultDay(d)),
  },
  {
    id: 'keto-weight-loss',
    name: 'Keto Weight Loss',
    goal: 'weight_loss',
    dietType: 'keto',
    weeklyCalorieTarget: 12600,
    generalGuidelines: [
      'Keep net carbs under 20–50 g per day.',
      'Prioritise healthy fats (avocado, nuts, olive oil).',
      'Moderate protein to support ketosis.',
    ],
    foodsToAvoid: ['Grains', 'Legumes', 'Sugars', 'Starchy vegetables'],
    days: DAY_NAMES.map((d) => defaultDay(d)),
  },
  {
    id: 'vegan-general',
    name: 'Vegan General Fitness',
    goal: 'general_fitness',
    dietType: 'vegan',
    weeklyCalorieTarget: 15400,
    generalGuidelines: [
      'Combine grains and legumes for complete protein.',
      'Include B12-fortified foods or supplement.',
      'Eat a variety of vegetables and fruits.',
    ],
    foodsToAvoid: ['Animal products', 'Excess processed vegan junk food'],
    days: DAY_NAMES.map((d) => defaultDay(d)),
  },
];

export function getTemplatesForMember(goal: string, dietType: string): BuiltInTemplate[] {
  return BUILT_IN_TEMPLATES.filter(
    (t) => t.goal === goal && t.dietType === dietType
  );
}

export function getTemplateById(id: string): BuiltInTemplate | undefined {
  return BUILT_IN_TEMPLATES.find((t) => t.id === id);
}
