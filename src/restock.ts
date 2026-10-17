import { addDays, daysBetween, formatShortDate, todayISO } from './dates';
import { withLiveDates } from './items';
import { GroceryItem, ShoppingItem } from './types';

export interface Purchase {
  item: ShoppingItem;
  price: number; // what was paid for this line; 0 = not recorded
}

const DEFAULT_SHELF_LIFE = 7;
const MAX_HISTORY = 12;

function sameName(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function findPantryMatch(items: GroceryItem[], s: ShoppingItem) {
  return (s.itemId && items.find((i) => i.id === s.itemId)) || items.find((i) => sameName(i.name, s.name));
}

// Puts bought shopping-list items into the pantry: tops up the matching
// pantry item (fresh purchase/expiry dates, price history) or adds a new one.
export function restock(
  items: GroceryItem[],
  purchases: Purchase[],
  store: string,
  today: string = todayISO(),
): GroceryItem[] {
  let next = [...items];
  const storeName = store.trim();
  const dateLabel = formatShortDate(today, today);
  purchases.forEach(({ item: s, price }, idx) => {
    const qty = s.qty ?? 1;
    const unit = s.unit ?? 'no';
    const paid = price > 0 ? price : 0;
    const match = findPantryMatch(next, s);

    if (match) {
      // Keep the item's usual shelf life (from its last purchase) for the new batch.
      const span = daysBetween(match.boughtOn, match.expiresOn);
      const shelfLife = span > 0 ? span : DEFAULT_SHELF_LIFE;
      const store = storeName || match.store;
      // Items added before history was tracked still know their last purchase.
      const prior = match.hist.length === 0 && match.price > 0
        ? [{ date: formatShortDate(match.boughtOn, today), store: match.store, price: match.price }]
        : match.hist;
      const hist = paid > 0
        ? [...prior, { date: dateLabel, store, price: paid }].slice(-MAX_HISTORY)
        : match.hist;
      const updated = withLiveDates({
        ...match,
        // Same unit: add on top of what's left. Different unit: the new pack replaces it.
        qty: match.unit === unit ? Math.round((match.qty + qty) * 100) / 100 : qty,
        unit,
        boughtOn: today,
        expiresOn: addDays(today, shelfLife),
        price: paid || match.price,
        store,
        hist,
      }, today);
      next = next.map((i) => (i.id === match.id ? updated : i));
    } else {
      const store = storeName || '—';
      next.push(withLiveDates({
        id: s.name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() + '-' + idx,
        name: s.name.trim(),
        emoji: s.emoji && s.emoji !== '🛒' ? s.emoji : '🛍️',
        cat: 'Other',
        qty,
        unit,
        zone: 'pantry',
        spot: 'Pantry shelf',
        boughtOn: today,
        expiresOn: addDays(today, DEFAULT_SHELF_LIFE),
        price: paid,
        store,
        loc: '',
        tip: '',
        hist: paid > 0 ? [{ date: dateLabel, store, price: paid }] : [],
      }, today));
    }
  });
  return next;
}
