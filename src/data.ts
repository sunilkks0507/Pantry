import { GroceryItem, Recipe, ShoppingItem, OnboardingSlide, Tip } from './types';

export const SEED_ITEMS: GroceryItem[] = [
  { id: 'milk', name: 'Whole Milk', emoji: '🥛', cat: 'Dairy', qty: 1, unit: 'gallon', zone: 'fridge', spot: 'Top shelf', days: 2, bought: 'Jun 23', price: 235, store: 'Whole Foods', loc: 'Downtown', tip: 'Store at the back of the fridge, not the door — the door is the warmest spot and milk spoils faster there.', hist: [{ date: 'Apr 28', store: 'Costco', price: 210 }, { date: 'May 19', store: 'Trader Joes', price: 220 }, { date: 'Jun 23', store: 'Whole Foods', price: 235 }] },
  { id: 'spinach', name: 'Baby Spinach', emoji: '🥬', cat: 'Produce', qty: 1, unit: 'bag', zone: 'fridge', spot: 'Crisper drawer', days: 1, bought: 'Jun 24', price: 45, store: 'Trader Joes', loc: 'Midtown', tip: 'Keep unwashed in a breathable bag with a dry paper towel to absorb moisture. Wash only right before use.', hist: [{ date: 'May 30', store: 'Local Market', price: 55 }, { date: 'Jun 12', store: 'Whole Foods', price: 50 }, { date: 'Jun 24', store: 'Trader Joes', price: 45 }] },
  { id: 'chicken', name: 'Chicken Thighs', emoji: '🍗', cat: 'Meat', qty: 1.5, unit: 'lb', zone: 'fridge', spot: 'Bottom shelf', days: 0, bought: 'Jun 24', price: 320, store: 'Costco', loc: 'Eastside', tip: 'Keep on the bottom shelf in its original packaging so juices can’t drip onto other food. Freeze if not using within 2 days.', hist: [{ date: 'May 10', store: 'Costco', price: 290 }, { date: 'Jun 24', store: 'Costco', price: 320 }] },
  { id: 'eggs', name: 'Eggs', emoji: '🥚', cat: 'Dairy', qty: 12, unit: 'ct', zone: 'fridge', spot: 'Door tray', days: 12, bought: 'Jun 21', price: 90, store: 'Whole Foods', loc: 'Downtown', tip: 'Store in their carton on a shelf (not the door) to keep temperature steady and prevent odor absorption.', hist: [{ date: 'Apr 30', store: 'Trader Joes', price: 75 }, { date: 'May 28', store: 'Costco', price: 82 }, { date: 'Jun 21', store: 'Whole Foods', price: 90 }] },
  { id: 'yogurt', name: 'Greek Yogurt', emoji: '🍶', cat: 'Dairy', qty: 4, unit: 'cups', zone: 'fridge', spot: 'Middle shelf', days: 5, bought: 'Jun 22', price: 190, store: 'Trader Joes', loc: 'Midtown', tip: 'Keep sealed and upright. A thin layer of liquid on top is normal — stir it back in for creaminess.', hist: [{ date: 'Jun 1', store: 'Whole Foods', price: 210 }, { date: 'Jun 22', store: 'Trader Joes', price: 190 }] },
  { id: 'berries', name: 'Strawberries', emoji: '🍓', cat: 'Produce', qty: 1, unit: 'lb', zone: 'fridge', spot: 'Crisper drawer', days: -1, bought: 'Jun 20', price: 120, store: 'Local Market', loc: 'Riverside', tip: 'Don’t wash until ready to eat. Store in a single layer lined with paper towel; remove any moldy berries immediately.', hist: [{ date: 'Jun 6', store: 'Costco', price: 140 }, { date: 'Jun 20', store: 'Local Market', price: 120 }] },
  { id: 'bananas', name: 'Bananas', emoji: '🍌', cat: 'Produce', qty: 6, unit: 'ct', zone: 'kitchen', spot: 'Counter bowl', days: 2, bought: 'Jun 23', price: 48, store: 'Costco', loc: 'Eastside', tip: 'Keep on the counter away from other fruit. Wrapping the stems in foil slows ripening by a few days.', hist: [{ date: 'Jun 9', store: 'Whole Foods', price: 55 }, { date: 'Jun 23', store: 'Costco', price: 48 }] },
  { id: 'bread', name: 'Sourdough Loaf', emoji: '🍞', cat: 'Bakery', qty: 1, unit: 'loaf', zone: 'pantry', spot: 'Bread box', days: 4, bought: 'Jun 22', price: 95, store: 'Trader Joes', loc: 'Midtown', tip: 'Store cut-side down in a bread box at room temp. Freeze slices for longer life — never refrigerate, it dries out.', hist: [{ date: 'Jun 8', store: 'Local Market', price: 110 }, { date: 'Jun 22', store: 'Trader Joes', price: 95 }] },
  { id: 'tomatoes', name: 'Roma Tomatoes', emoji: '🍅', cat: 'Produce', qty: 5, unit: 'ct', zone: 'kitchen', spot: 'Counter bowl', days: 3, bought: 'Jun 23', price: 40, store: 'Local Market', loc: 'Riverside', tip: 'Keep at room temperature, stem-side down. Refrigeration kills their flavor and makes them mealy.', hist: [{ date: 'Jun 10', store: 'Whole Foods', price: 48 }, { date: 'Jun 23', store: 'Local Market', price: 40 }] },
  { id: 'cheddar', name: 'Cheddar Block', emoji: '🧀', cat: 'Dairy', qty: 1, unit: 'block', zone: 'fridge', spot: 'Deli drawer', days: 9, bought: 'Jun 19', price: 275, store: 'Trader Joes', loc: 'Midtown', tip: 'Wrap in parchment, then loosely in foil — it needs to breathe. Plastic wrap traps moisture and causes mold.', hist: [{ date: 'May 25', store: 'Costco', price: 260 }, { date: 'Jun 19', store: 'Trader Joes', price: 275 }] },
  { id: 'carrots', name: 'Carrots', emoji: '🥕', cat: 'Produce', qty: 2, unit: 'lb', zone: 'fridge', spot: 'Crisper drawer', days: 7, bought: 'Jun 21', price: 42, store: 'Local Market', loc: 'Riverside', tip: 'Remove green tops, then store in a container of water in the fridge — they stay crisp for weeks.', hist: [{ date: 'Jun 7', store: 'Costco', price: 50 }, { date: 'Jun 21', store: 'Local Market', price: 42 }] },
  { id: 'salmon', name: 'Salmon Fillet', emoji: '🐟', cat: 'Seafood', qty: 1, unit: 'lb', zone: 'freezer', spot: 'Top drawer', days: 48, bought: 'Jun 15', price: 640, store: 'Whole Foods', loc: 'Downtown', tip: 'Freeze in a vacuum-sealed bag to prevent freezer burn. Thaw overnight in the fridge, never on the counter.', hist: [{ date: 'May 18', store: 'Costco', price: 580 }, { date: 'Jun 15', store: 'Whole Foods', price: 640 }] },
  { id: 'peas', name: 'Frozen Peas', emoji: '🫛', cat: 'Frozen', qty: 1, unit: 'bag', zone: 'freezer', spot: 'Side bin', days: 160, bought: 'Jun 5', price: 85, store: 'Whole Foods', loc: 'Downtown', tip: 'Keep the bag tightly sealed and squeeze out air. Don’t refreeze after thawing — texture turns mushy.', hist: [{ date: 'Apr 20', store: 'Trader Joes', price: 95 }, { date: 'Jun 5', store: 'Whole Foods', price: 85 }] },
  { id: 'pasta', name: 'Penne Pasta', emoji: '🍝', cat: 'Dry Goods', qty: 2, unit: 'boxes', zone: 'pantry', spot: 'Top shelf', days: 320, bought: 'Jun 5', price: 110, store: 'Costco', loc: 'Eastside', tip: 'Keep in an airtight container away from heat and light. Dry pasta lasts well past its date if kept sealed.', hist: [{ date: 'Mar 2', store: 'Costco', price: 130 }, { date: 'Jun 5', store: 'Costco', price: 110 }] },
  { id: 'oj', name: 'Orange Juice', emoji: '🧃', cat: 'Beverage', qty: 1, unit: 'carton', zone: 'fridge', spot: 'Door tray', days: 6, bought: 'Jun 22', price: 150, store: 'Whole Foods', loc: 'Downtown', tip: 'Keep cold and sealed. Once opened, drink within 7–10 days for the freshest taste.', hist: [{ date: 'Jun 8', store: 'Costco', price: 165 }, { date: 'Jun 22', store: 'Whole Foods', price: 150 }] },
  { id: 'apples', name: 'Honeycrisp Apples', emoji: '🍎', cat: 'Produce', qty: 6, unit: 'ct', zone: 'fridge', spot: 'Crisper drawer', days: 14, bought: 'Jun 18', price: 180, store: 'Costco', loc: 'Eastside', tip: 'Store in the crisper away from other produce — apples release ethylene gas that ripens everything nearby.', hist: [{ date: 'May 30', store: 'Whole Foods', price: 200 }, { date: 'Jun 18', store: 'Costco', price: 180 }] },
];

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

export const SHOPPING: ShoppingItem[] = [
  { id: 'sh1', name: 'Whole Milk', emoji: '🥛', note: 'Running low', lastPrice: 235, lastStore: 'Whole Foods' },
  { id: 'sh2', name: 'Baby Spinach', emoji: '🥬', note: 'Expired', lastPrice: 45, lastStore: 'Trader Joes' },
  { id: 'sh3', name: 'Chicken Thighs', emoji: '🍗', note: 'Used up', lastPrice: 320, lastStore: 'Costco' },
  { id: 'sh4', name: 'Greek Yogurt', emoji: '🍶', note: 'Almost out', lastPrice: 190, lastStore: 'Trader Joes' },
  { id: 'sh5', name: 'Walnuts', emoji: '🌰', note: 'Need for recipe', lastPrice: 480, lastStore: 'Whole Foods' },
];

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
