import { ZoneKey } from './theme';

export interface PriceHistoryEntry {
  date: string;
  store: string;
  price: number;
}

export interface GroceryItem {
  id: string;
  name: string;
  emoji: string;
  cat: string;
  qty: number;
  unit: string;
  zone: ZoneKey;
  spot: string;
  days: number; // days until expiry (negative = already expired)
  bought: string;
  price: number;
  store: string;
  loc: string;
  tip: string;
  hist: PriceHistoryEntry[];
  threshold?: number; // low-stock level; below this the item is added to the shopping list (default 1)
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  time: string;
  calories: number;
  servings: number;
  uses: string[];
  expiringUse: string;
  ingredients: [string, boolean][];
  nutrients: Record<string, string>;
  benefits: string;
  steps: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  emoji: string;
  note: string;
  lastPrice: number;
  lastStore: string;
  qty?: number; // how many to buy (default 1)
  unit?: string; // measuring unit, e.g. kg, g, no (default 'no')
}

export interface OnboardingSlide {
  emoji: string;
  title: string;
  body: string;
  cta: string;
}

export interface Tip {
  icon: string;
  bg: string;
  title: string;
  body: string;
}

export type Screen =
  | 'onboarding'
  | 'home'
  | 'inventory'
  | 'item'
  | 'expiry'
  | 'recipes'
  | 'recipeDetail'
  | 'list'
  | 'add'
  | 'scan'
  | 'voice'
  | 'price'
  | 'store'
  | 'tips';
