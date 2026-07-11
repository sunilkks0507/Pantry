import { ZoneKey } from '../theme';
import { GroceryItem, Recipe } from '../types';

// Google Gemini (Google AI Studio) — free-tier API. Get a key at
// https://aistudio.google.com/app/apikey (looks like "AIza...").
const MODEL = 'gemini-3.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type GeminiPart = { text: string } | { inline_data: { mime_type: string; data: string } };

export interface ParsedItem {
  name: string;
  emoji: string;
  qty: number;
  unit: string;
  days: number;
  cat: string;
  zone: ZoneKey;
  spot: string;
  tip: string;
  price?: number;
  store?: string;
  date?: string;
}

const ITEM_SCHEMA = `For each item return:
- name: item name (string)
- emoji: a relevant food emoji (string)
- qty: numeric quantity, default 1 (number)
- unit: unit like ct, lb, kg, bag, box, bottle, can (string)
- days: estimated days until expiry — milk 7, bread 5, eggs 21, fresh produce 5-10, canned 365, frozen 180 (number)
- cat: one of Produce, Dairy, Meat, Seafood, Bakery, Dry Goods, Frozen, Beverages, Other (string)
- zone: one of "fridge", "freezer", "pantry", "kitchen" (string)
- spot: specific storage spot e.g. "Top shelf", "Crisper drawer", "Pantry shelf", "Counter bowl" (string)
- tip: one-sentence storage tip (string)
- price: price paid if visible on a receipt, else 0 (number)
- store: store name if visible on a receipt, else "" (string)
- date: purchase date if visible on a receipt formatted like "Jun 23", else "" (string)

Return ONLY a valid JSON array. If no food items found, return [].`;

async function callGemini(apiKey: string, parts: GeminiPart[], maxTokens = 1024): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { maxOutputTokens: maxTokens, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  const out = (data?.candidates?.[0]?.content?.parts || [])
    .map((p: any) => p?.text || '')
    .join('');
  return out as string;
}

function parseJSON(text: string): ParsedItem[] {
  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}

export async function parseItemsFromImage(
  base64: string,
  mimeType: string,
  apiKey: string,
  mode: 'receipt' | 'label' = 'receipt'
): Promise<ParsedItem[]> {
  const modeHint = mode === 'receipt'
    ? 'This is a store receipt. Extract every purchased grocery/food line item, along with its price and the store name/date if printed on the receipt.'
    : 'This is a photo of a food item or its packaging label. Extract the food item(s) shown.';
  const text = await callGemini(apiKey, [
    { text: `You are a pantry tracker. ${modeHint}\n\n${ITEM_SCHEMA}` },
    { inline_data: { mime_type: mimeType, data: base64 } },
  ]);
  return parseJSON(text);
}

export async function parseItemsFromTranscript(
  transcript: string,
  apiKey: string
): Promise<ParsedItem[]> {
  const text = await callGemini(apiKey, [
    { text: `You are a pantry tracker. The user said: "${transcript}"\n\nExtract any grocery/food items mentioned.\n\n${ITEM_SCHEMA}` },
  ]);
  return parseJSON(text);
}

// ---- AI recipe suggestions from the pantry ----

interface RawRecipe {
  name?: string;
  emoji?: string;
  time?: string;
  calories?: number;
  servings?: number;
  expiringUse?: string;
  ingredients?: (string | { name?: string })[];
  nutrients?: Record<string, string>;
  benefits?: string;
  steps?: string[];
}

function nameMatches(a: string, b: string) {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
}

function toRecipe(r: RawRecipe, idx: number, items: GroceryItem[]): Recipe {
  const ingNames = (r.ingredients || [])
    .map((i) => (typeof i === 'string' ? i : i?.name))
    .filter((n): n is string => !!n && n.trim().length > 0);
  // Compute "have" against the real pantry rather than trusting the model,
  // so "You have N/M" and "add missing to shopping list" stay accurate.
  const ingredients: [string, boolean][] = ingNames.map((n) => [n, items.some((it) => nameMatches(n, it.name))]);
  const uses = items.filter((it) => ingNames.some((n) => nameMatches(n, it.name))).map((it) => it.id);
  return {
    id: 'ai-' + Date.now() + '-' + idx,
    name: r.name || 'Recipe',
    emoji: r.emoji || '🍽️',
    time: r.time || '—',
    calories: typeof r.calories === 'number' ? r.calories : 0,
    servings: typeof r.servings === 'number' ? r.servings : 1,
    uses,
    expiringUse: r.expiringUse || '',
    ingredients,
    nutrients: r.nutrients || {},
    benefits: r.benefits || '',
    steps: Array.isArray(r.steps) ? r.steps : [],
  };
}

export async function suggestRecipesFromPantry(items: GroceryItem[], apiKey: string): Promise<Recipe[]> {
  const pantryList = items
    .map((i) => `${i.name} (${i.cat}, ${i.days < 0 ? 'expired' : i.days + ' days left'})`)
    .join('; ');

  const prompt = `You are a home cooking assistant. The user's pantry contains: ${pantryList}.

Suggest 5 recipes they can realistically cook using mostly these items. Prioritise recipes that use the items expiring soonest (fewest days left) to reduce food waste. It's fine if a recipe also needs a few common staples the user may not have.

For each recipe return an object with these exact fields:
- name: recipe name (string)
- emoji: one relevant food emoji (string)
- time: total time e.g. "20 min" (string)
- calories: calories per serving (number)
- servings: number of servings (number)
- expiringUse: short phrase naming the soon-to-expire pantry items it uses, e.g. "spinach + tomatoes" (string)
- ingredients: array of ingredient name strings covering everything the recipe needs
- nutrients: object with keys Protein, Carbs, Fat, Fiber, each a string like "12 g"
- benefits: one short sentence on why it's nutritious (string)
- steps: array of 3-6 short instruction strings

Return ONLY a valid JSON array of the recipe objects, no prose.`;

  const text = await callGemini(apiKey, [{ text: prompt }], 3072);
  let raw: RawRecipe[] = [];
  try {
    const m = text.match(/\[[\s\S]*\]/);
    raw = m ? JSON.parse(m[0]) : [];
  } catch {
    raw = [];
  }
  return raw.map((r, idx) => toRecipe(r, idx, items));
}
