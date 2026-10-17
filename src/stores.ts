import { GroceryItem } from './types';

export interface StorePrice {
  store: string;
  price: number; // most recent price paid there
  date: string; // when that was, e.g. "Oct 2"
}

function realStore(s: string | undefined) {
  const t = (s || '').trim();
  return t && t !== '—' ? t : '';
}

// Most recent price paid at each store you've actually bought this item from,
// cheapest first. Uses only recorded purchases — no estimated prices.
export function storePrices(item: GroceryItem): StorePrice[] {
  const byStore = new Map<string, StorePrice>();
  // History is chronological, so later entries overwrite earlier ones.
  for (const h of item.hist) {
    const store = realStore(h.store);
    if (store && h.price > 0) byStore.set(store.toLowerCase(), { store, price: h.price, date: h.date });
  }
  const current = realStore(item.store);
  if (current && item.price > 0 && !byStore.has(current.toLowerCase())) {
    byStore.set(current.toLowerCase(), { store: current, price: item.price, date: item.bought });
  }
  return [...byStore.values()].sort((a, b) => a.price - b.price);
}
