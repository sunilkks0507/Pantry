import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backTarget, navReducer, NavState } from '../src/navigation';

const start: NavState = { screen: 'home', history: [] };

test('Back retraces pushed screens in order', () => {
  let s = navReducer(start, { type: 'go', screen: 'inventory' });
  s = navReducer(s, { type: 'push', screen: 'item' });
  s = navReducer(s, { type: 'push', screen: 'price' });
  s = navReducer(s, { type: 'push', screen: 'store' });
  assert.deepEqual(s.history, ['inventory', 'item', 'price']);
  s = navReducer(s, { type: 'back' });
  assert.equal(s.screen, 'price');
  s = navReducer(s, { type: 'back' });
  assert.equal(s.screen, 'item');
  s = navReducer(s, { type: 'back' });
  assert.equal(s.screen, 'inventory');
});

test('Back from another tab goes Home; Back on Home leaves the app', () => {
  const list: NavState = { screen: 'list', history: [] };
  assert.deepEqual(backTarget(list), { screen: 'home', history: [] });
  assert.equal(backTarget(start), null);
  assert.equal(backTarget({ screen: 'onboarding', history: [] }), null);
});

test('switching tabs clears history', () => {
  let s = navReducer(start, { type: 'push', screen: 'expiry' });
  s = navReducer(s, { type: 'go', screen: 'recipes' });
  assert.deepEqual(s, { screen: 'recipes', history: [] });
});

test('pushing the current screen again does not stack a duplicate', () => {
  const s = navReducer({ screen: 'scan', history: ['home'] }, { type: 'push', screen: 'scan' });
  assert.deepEqual(s.history, ['home']);
});

test('in-app back button never strands the user', () => {
  assert.deepEqual(navReducer(start, { type: 'back' }), start);
  // A detail screen reached with no history falls back to Home.
  assert.deepEqual(navReducer({ screen: 'item', history: [] }, { type: 'back' }), start);
});
