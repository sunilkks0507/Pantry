import { GroceryItem, Recipe } from './types';

// Loose name match: "Baby spinach" ~ "Spinach", "Eggs" ~ "Egg".
export function nameMatches(a: string, b: string) {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
}

function ingredientNames(r: Recipe) {
  return r.ingredients.map(([name]) => name);
}

// In-stock pantry items a recipe would use, soonest-expiring first.
export function pantryItemsUsed(r: Recipe, items: GroceryItem[]): GroceryItem[] {
  const names = ingredientNames(r);
  return items
    .filter((it) => it.qty > 0 && names.some((n) => nameMatches(n, it.name)))
    .sort((a, b) => a.days - b.days);
}

// Re-derives a recipe's pantry-dependent fields (which ingredients you have,
// which items it uses, what's expiring) from the real pantry, so built-in
// recipes don't carry stale sample-data answers.
export function withPantryState(r: Recipe, items: GroceryItem[]): Recipe {
  const used = pantryItemsUsed(r, items);
  const expiring = used.filter((i) => i.days >= 0 && i.days <= 3).slice(0, 2);
  return {
    ...r,
    ingredients: r.ingredients.map(([name]) => [name, items.some((it) => it.qty > 0 && nameMatches(name, it.name))]),
    uses: used.map((i) => i.id),
    expiringUse: expiring.map((i) => i.name.toLowerCase()).join(' + '),
  };
}

// Best recipe for using up what's about to spoil: prefers recipes that use the
// soonest-expiring (not yet expired) items, then the most pantry items.
// Returns null when no recipe uses anything in the pantry.
export function bestRecipe(recipes: Recipe[], items: GroceryItem[], forItem?: GroceryItem): Recipe | null {
  let best: { r: Recipe; soonest: number; count: number } | null = null;
  for (const r of recipes) {
    const used = pantryItemsUsed(r, items);
    if (forItem && !used.some((i) => i.id === forItem.id)) continue;
    if (used.length === 0) continue;
    const fresh = used.filter((i) => i.days >= 0);
    const soonest = fresh.length ? fresh[0].days : Infinity;
    if (!best || soonest < best.soonest || (soonest === best.soonest && used.length > best.count)) {
      best = { r, soonest, count: used.length };
    }
  }
  return best ? best.r : null;
}
