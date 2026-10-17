import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bestRecipe, withPantryState } from '../src/recipeMatch';
import { storePrices } from '../src/stores';
import { withLiveDates } from '../src/items';
import { RECIPES } from '../src/data';
import { GroceryItem, Recipe } from '../src/types';

const TODAY = '2026-10-02';
const item = (name: string, expiresOn: string, over: Partial<GroceryItem> = {}): GroceryItem => withLiveDates({
  id: name.toLowerCase() + '-id', name, emoji: '🛒', cat: 'Other', qty: 1, unit: 'no', zone: 'fridge', spot: '',
  boughtOn: '2026-09-28', expiresOn, price: 0, store: '—', loc: '', tip: '', hist: [], ...over,
}, TODAY);

const byName = (n: string) => RECIPES.find((r) => r.name.includes(n)) as Recipe;

test('built-in recipes are re-checked against the real pantry', () => {
  const pantry = [item('Spinach', '2026-10-03'), item('Eggs', '2026-10-20')];
  const omelette = withPantryState(byName('Omelette'), pantry);
  assert.deepEqual(omelette.ingredients.filter(([, have]) => have).map(([n]) => n), ['Eggs', 'Baby spinach']);
  assert.deepEqual(omelette.uses, ['spinach-id', 'eggs-id']);
  assert.equal(omelette.expiringUse, 'spinach');
});

test('nothing in stock: no ingredients ticked, nothing "expiring"', () => {
  const r = withPantryState(byName('Omelette'), [item('Eggs', '2026-10-20', { qty: 0 })]);
  assert.equal(r.ingredients.some(([, have]) => have), false);
  assert.equal(r.expiringUse, '');
});

test('best recipe uses the item that expires soonest', () => {
  const pantry = [item('Bananas', '2026-10-03'), item('Penne pasta', '2026-12-01'), item('Roma tomatoes', '2026-10-09')];
  const pool = RECIPES.map((r) => withPantryState(r, pantry));
  assert.equal(bestRecipe(pool, pantry)?.name, 'Banana Oat Muffins');
});

test('no recipe is suggested when none uses anything you have', () => {
  const pantry = [item('Atta', '2026-12-01')];
  assert.equal(bestRecipe(RECIPES.map((r) => withPantryState(r, pantry)), pantry), null);
});

test('recipe for a specific expiring item', () => {
  const pantry = [item('Bananas', '2026-10-03'), item('Chicken thighs', '2026-10-04')];
  const pool = RECIPES.map((r) => withPantryState(r, pantry));
  assert.equal(bestRecipe(pool, pantry, pantry[1])?.name, 'Creamy Chicken & Spinach');
});

test('store comparison only uses recorded purchases, latest price per store', () => {
  const ghee = item('Ghee', '2027-01-01', {
    price: 560, store: 'DMart',
    hist: [
      { date: 'Aug 1', store: 'Kirana', price: 600 },
      { date: 'Sep 1', store: 'DMart', price: 540 },
      { date: 'Oct 1', store: 'DMart', price: 560 },
      { date: 'Sep 15', store: '—', price: 500 },
    ],
  });
  assert.deepEqual(storePrices(ghee), [
    { store: 'DMart', price: 560, date: 'Oct 1' },
    { store: 'Kirana', price: 600, date: 'Aug 1' },
  ]);
});

test('store comparison falls back to the current purchase and skips unknown stores', () => {
  assert.deepEqual(storePrices(item('Salt', '2027-01-01', { price: 25, store: 'BigBasket' })),
    [{ store: 'BigBasket', price: 25, date: 'Sep 28' }]);
  assert.deepEqual(storePrices(item('Salt', '2027-01-01', { price: 25 })), []);
});
