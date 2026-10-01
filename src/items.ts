import { addDays, daysBetween, formatShortDate, isISODate, monthDayToPastISO, todayISO } from './dates';
import { GroceryItem } from './types';

// An item as created or stored — the derived fields may be absent or stale.
export type ItemInput = Omit<GroceryItem, 'days' | 'bought'> & Partial<Pick<GroceryItem, 'days' | 'bought'>>;

// Recomputes the derived `days` / `bought` fields from the stored dates.
export function withLiveDates(item: ItemInput, today: string = todayISO()): GroceryItem {
  return {
    ...item,
    days: daysBetween(today, item.expiresOn),
    bought: formatShortDate(item.boughtOn, today),
  };
}

// Items saved before dates were stored only have a frozen `days` count and a
// year-less `bought` label ("Jun 23"). The count was computed around the
// purchase, so the best available estimate is expiry = purchase + days.
export function migrateItem(raw: any, today: string = todayISO()): GroceryItem {
  const boughtOn = isISODate(raw?.boughtOn)
    ? raw.boughtOn
    : monthDayToPastISO(String(raw?.bought ?? ''), today) ?? today;
  const days = Number.isFinite(raw?.days) ? Number(raw.days) : 7;
  const expiresOn = isISODate(raw?.expiresOn) ? raw.expiresOn : addDays(boughtOn, days);
  return withLiveDates({ ...raw, boughtOn, expiresOn }, today);
}
