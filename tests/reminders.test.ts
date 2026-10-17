import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planReminders, reminderText } from '../src/reminders';
import { withLiveDates } from '../src/items';
import { GroceryItem } from '../src/types';

const item = (name: string, expiresOn: string, qty = 1): GroceryItem => withLiveDates({
  id: name, name, emoji: '🛒', cat: 'Other', qty, unit: 'no', zone: 'fridge', spot: '',
  boughtOn: '2026-09-28', expiresOn, price: 0, store: '', loc: '', tip: '', hist: [],
}, '2026-10-02');

// 2 Oct 2026, 8:00 local — before the 9:00 reminder.
const morning = new Date(2026, 9, 2, 8, 0);

test('reminds the day before and the day of expiry, at 9:00', () => {
  const plan = planReminders([item('Milk', '2026-10-05')], morning);
  assert.deepEqual(plan.map((r) => [r.at.getDate(), r.at.getHours(), r.title]), [
    [4, 9, 'Milk expires tomorrow'],
    [5, 9, 'Milk expires today'],
  ]);
});

test("skips today's reminder once 9:00 has passed", () => {
  const evening = new Date(2026, 9, 2, 20, 0);
  const plan = planReminders([item('Milk', '2026-10-02'), item('Bread', '2026-10-03')], evening);
  assert.deepEqual(plan.map((r) => r.at.getDate()), [3]);
  assert.equal(plan[0].title, 'Bread expires today');
});

test('groups several items into one notification per day', () => {
  const plan = planReminders([item('Milk', '2026-10-02'), item('Spinach', '2026-10-02'), item('Bread', '2026-10-03')], morning);
  assert.equal(plan[0].title, '2 expiring today, 1 tomorrow');
  assert.match(plan[0].body, /Today: Milk and Spinach\. Tomorrow: Bread\./);
});

test('ignores used-up items, past expiries and anything beyond the window', () => {
  const plan = planReminders([
    item('Eggs', '2026-10-03', 0),
    item('Old', '2026-09-20'),
    item('Rice', '2027-03-01'),
  ], morning);
  assert.equal(plan.length, 0);
});

test('long lists are shortened', () => {
  const many = ['A', 'B', 'C', 'D', 'E'].map((n) => item(n, '2026-10-03'));
  const { title, body } = reminderText([], many);
  assert.equal(title, '5 items expire tomorrow');
  assert.match(body, /Tomorrow: A, B and 3 more\./);
});
