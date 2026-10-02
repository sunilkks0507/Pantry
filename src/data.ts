import { Recipe, ShoppingItem, OnboardingSlide, Tip } from './types';

export const RECIPES: Recipe[] = [
  {
    id: 'salad', name: 'Spinach & Strawberry Salad', emoji: '🥗', time: '15 min', calories: 320, servings: 2,
    uses: ['spinach', 'berries'], expiringUse: 'spinach + berries',
    ingredients: [['Baby spinach', true], ['Strawberries', true], ['Walnuts', false], ['Feta cheese', false], ['Balsamic glaze', true]],
    nutrients: { Protein: '9 g', Carbs: '24 g', Fat: '18 g', Fiber: '6 g' },
    benefits: 'Spinach delivers iron and vitamin K; strawberries add vitamin C and antioxidants that support immunity.',
    steps: ['Rinse spinach and slice strawberries.', 'Toast walnuts in a dry pan for 2 min.', 'Toss greens, berries and feta.', 'Drizzle balsamic glaze and serve.'],
  },
  {
    id: 'creamy', name: 'Creamy Chicken & Spinach', emoji: '🍛', time: '30 min', calories: 480, servings: 3,
    uses: ['chicken', 'spinach', 'milk'], expiringUse: 'chicken + spinach',
    ingredients: [['Chicken thighs', true], ['Baby spinach', true], ['Whole milk', true], ['Garlic', true], ['Parmesan', false]],
    nutrients: { Protein: '38 g', Carbs: '12 g', Fat: '28 g', Fiber: '3 g' },
    benefits: 'High in lean protein for muscle repair; spinach adds folate and the milk contributes calcium for strong bones.',
    steps: ['Sear seasoned chicken until golden.', 'Soften garlic, add milk and simmer.', 'Stir in spinach until wilted.', 'Return chicken, finish with parmesan.'],
  },
  {
    id: 'omelette', name: 'Garden Veggie Omelette', emoji: '🍳', time: '10 min', calories: 290, servings: 1,
    uses: ['eggs', 'tomatoes', 'spinach', 'cheddar'], expiringUse: 'tomatoes + spinach',
    ingredients: [['Eggs', true], ['Roma tomatoes', true], ['Baby spinach', true], ['Cheddar', true], ['Chives', false]],
    nutrients: { Protein: '21 g', Carbs: '6 g', Fat: '20 g', Fiber: '2 g' },
    benefits: 'A protein-rich start to the day; tomatoes provide lycopene and spinach adds iron and fiber.',
    steps: ['Whisk eggs with a pinch of salt.', 'Saute diced tomatoes and spinach.', 'Pour eggs over, cook until set.', 'Add cheddar, fold and serve.'],
  },
  {
    id: 'banana', name: 'Banana Oat Muffins', emoji: '🧁', time: '35 min', calories: 210, servings: 6,
    uses: ['bananas', 'eggs', 'milk'], expiringUse: 'bananas',
    ingredients: [['Ripe bananas', true], ['Eggs', true], ['Whole milk', true], ['Rolled oats', false], ['Cinnamon', true]],
    nutrients: { Protein: '6 g', Carbs: '32 g', Fat: '7 g', Fiber: '4 g' },
    benefits: 'Naturally sweetened by ripe bananas (rich in potassium); oats add slow-release fiber for steady energy.',
    steps: ['Mash bananas, whisk in eggs and milk.', 'Fold in oats and cinnamon.', 'Spoon into muffin tin.', 'Bake at 350°F for 22 min.'],
  },
  {
    id: 'tomato-penne', name: 'Fresh Tomato Penne', emoji: '🍝', time: '25 min', calories: 410, servings: 3,
    uses: ['tomatoes', 'pasta'], expiringUse: 'tomatoes',
    ingredients: [['Roma tomatoes', true], ['Penne pasta', true], ['Garlic', true], ['Basil', false], ['Olive oil', true]],
    nutrients: { Protein: '12 g', Carbs: '68 g', Fat: '9 g', Fiber: '5 g' },
    benefits: 'Comforting complex carbs for energy; fresh tomatoes deliver vitamin C and heart-healthy lycopene.',
    steps: ['Boil penne until al dente.', 'Saute garlic and chopped tomatoes.', 'Toss pasta with the sauce.', 'Finish with basil and olive oil.'],
  },
];

// Starts empty. The shopping list is populated when a pantry item runs out
// (quantity reaches 0), via the "+ Shopping list" action on an item, from a
// recipe's missing ingredients, or by adding an item manually.
export const SHOPPING: ShoppingItem[] = [];

export const ONB: OnboardingSlide[] = [
  { emoji: '🧺', title: 'Everything in your kitchen, in one place', body: 'Track what you have across the fridge, freezer, pantry and counter — so you always know what’s on hand.', cta: 'Next' },
  { emoji: '⏰', title: 'Never waste food again', body: 'Gentle reminders flag items before they expire, and recipes help you use them up first.', cta: 'Next' },
  { emoji: '🧾', title: 'Scan, save & shop smarter', body: 'Snap a receipt or label to add items instantly, track prices across stores, and build smart shopping lists.', cta: 'Get started' },
];

export const TIPS_DATA: Tip[] = [
  { icon: '🧊', bg: '#E4EFF5', title: 'Mind the fridge door', body: 'The door is the warmest zone — keep milk and eggs on inner shelves.' },
  { icon: '🍎', bg: '#FBE6E0', title: 'Separate ethylene producers', body: 'Apples, bananas and tomatoes speed ripening of leafy greens nearby.' },
  { icon: '🌬️', bg: '#EAF4E8', title: 'Let produce breathe', body: 'Use perforated bags so moisture escapes and mold cannot form.' },
  { icon: '❄️', bg: '#E7ECF8', title: 'Freeze before it turns', body: 'Bread, meat and ripe bananas freeze well on day one of the use-soon window.' },
];
