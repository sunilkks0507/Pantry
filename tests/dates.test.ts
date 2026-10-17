import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, daysBetween, formatShortDate, monthDayToPastISO } from '../src/dates';
import { migrateItem, withLiveDates } from '../src/items';

const base = {
  id: 'milk', name: 'Milk', emoji: '🥛', cat: 'Dairy', qty: 1, unit: 'L', zone: 'fridge' as const,
  spot: 'Top shelf', price: 60, store: '—', loc: '', tip: '', hist: [],
};

test('days left counts down as today advances', () => {
  const item = { ...base, boughtOn: '2026-09-28', expiresOn: '2026-10-05' };
  assert.equal(withLiveDates(item, '2026-09-28').days, 7);
  assert.equal(withLiveDates(item, '2026-10-04').days, 1);
  assert.equal(withLiveDates(item, '2026-10-05').days, 0);
  assert.equal(withLiveDates(item, '2026-10-08').days, -3);
});

test('date math crosses month, year and DST boundaries', () => {
  assert.equal(addDays('2026-12-30', 3), '2027-01-02');
  assert.equal(daysBetween('2026-12-30', '2027-01-02'), 3);
  assert.equal(daysBetween('2026-03-01', '2026-04-01'), 31);
  assert.equal(daysBetween('2026-10-05', '2026-10-01'), -4);
});

test('an already-expired date stays in the past', () => {
  const item = { ...base, boughtOn: '2026-09-20', expiresOn: '2026-09-25' };
  assert.equal(withLiveDates(item, '2026-10-01').days, -6);
});

test('year-less purchase labels resolve to the most recent past date', () => {
  assert.equal(monthDayToPastISO('Sep 20', '2026-10-01'), '2026-09-20');
  assert.equal(monthDayToPastISO('Dec 28', '2026-01-03'), '2025-12-28');
  assert.equal(monthDayToPastISO('Oct 1', '2026-10-01'), '2026-10-01');
  assert.equal(monthDayToPastISO('garbage', '2026-10-01'), null);
});

test('bought label shows the year only when it differs', () => {
  assert.equal(formatShortDate('2026-06-23', '2026-10-01'), 'Jun 23');
  assert.equal(formatShortDate('2025-12-28', '2026-01-03'), 'Dec 28, 2025');
});

test('legacy items are migrated to real dates', () => {
  const legacy = { ...base, days: 5, bought: 'Sep 20' };
  const m = migrateItem(legacy, '2026-10-01');
  assert.equal(m.boughtOn, '2026-09-20');
  assert.equal(m.expiresOn, '2026-09-25');
  assert.equal(m.days, -6);
  // Already-migrated items are left alone.
  assert.equal(migrateItem(m, '2026-10-01').expiresOn, '2026-09-25');
});
