import { test } from 'node:test';
import assert from 'node:assert/strict';
import { restock } from '../src/restock';
import { withLiveDates } from '../src/items';
import { GroceryItem, ShoppingItem } from '../src/types';

const TODAY = '2026-10-02';

const milk: GroceryItem = withLiveDates({
  id: 'milk-1', name: 'Milk', emoji: '🥛', cat: 'Dairy', qty: 0.5, unit: 'L', zone: 'fridge',
  spot: 'Top shelf', boughtOn: '2026-09-20', expiresOn: '2026-09-25', price: 30, store: 'DMart',
  loc: '', tip: 'Keep cold', hist: [{ date: 'Sep 20', store: 'DMart', price: 30 }], threshold: 1,
}, TODAY);

const listItem = (over: Partial<ShoppingItem> = {}): ShoppingItem => ({
  id: 'sh-1', name: 'Milk', emoji: '🥛', note: 'Running low', lastPrice: 30, lastStore: 'DMart',
  qty: 1, unit: 'L', itemId: 'milk-1', ...over,
});

test('restocking tops up the pantry item with fresh dates', () => {
  const [m] = restock([milk], [{ item: listItem(), price: 32 }], 'Reliance Fresh', TODAY);
  assert.equal(m.qty, 1.5);
  assert.equal(m.boughtOn, TODAY);
  // Same 5-day shelf life as the previous batch.
  assert.equal(m.expiresOn, '2026-10-07');
  assert.equal(m.days, 5);
  assert.equal(m.price, 32);
  assert.equal(m.store, 'Reliance Fresh');
});

test('the price paid is appended to the price history', () => {
  const [m] = restock([milk], [{ item: listItem(), price: 32 }], 'Reliance Fresh', TODAY);
  assert.deepEqual(m.hist, [
    { date: 'Sep 20', store: 'DMart', price: 30 },
    { date: 'Oct 2', store: 'Reliance Fresh', price: 32 },
  ]);
});

test('no price entered: dates still refresh, history untouched', () => {
  const [m] = restock([milk], [{ item: listItem(), price: 0 }], '', TODAY);
  assert.equal(m.hist.length, 1);
  assert.equal(m.price, 30);
  assert.equal(m.store, 'DMart');
  assert.equal(m.boughtOn, TODAY);
});

test('older items without history keep their previous purchase as the first point', () => {
  const bare = { ...milk, hist: [] };
  const [m] = restock([bare], [{ item: listItem(), price: 32 }], 'DMart', TODAY);
  assert.deepEqual(m.hist.map((h) => h.price), [30, 32]);
});

test('matches by name when the list item was added manually', () => {
  const out = restock([milk], [{ item: listItem({ itemId: undefined, name: ' milk ' }), price: 0 }], '', TODAY);
  assert.equal(out.length, 1);
  assert.equal(out[0].qty, 1.5);
});

test('a different unit replaces the quantity instead of adding', () => {
  const [m] = restock([milk], [{ item: listItem({ qty: 2, unit: 'no' }), price: 0 }], '', TODAY);
  assert.equal(m.qty, 2);
  assert.equal(m.unit, 'no');
});

test('items not in the pantry are added as new items', () => {
  const out = restock([milk], [{ item: listItem({ id: 'sh-2', name: 'Atta', emoji: '🛒', itemId: undefined, qty: 5, unit: 'kg' }), price: 260 }], 'DMart', TODAY);
  assert.equal(out.length, 2);
  const atta = out[1];
  assert.equal(atta.name, 'Atta');
  assert.equal(atta.qty, 5);
  assert.equal(atta.boughtOn, TODAY);
  assert.equal(atta.days, 7);
  assert.deepEqual(atta.hist, [{ date: 'Oct 2', store: 'DMart', price: 260 }]);
});
