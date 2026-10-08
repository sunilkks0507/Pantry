import { ZoneKey } from '../theme';
import { GroceryItem, Recipe } from '../types';
import { nameMatches } from '../recipeMatch';

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

// Newer Gemini Flash models "think" before answering and those thinking
// tokens count against maxOutputTokens, so the cap must leave plenty of room
// for the actual JSON (a long receipt alone can need a few thousand tokens).
const MAX_OUTPUT_TOKENS = 8192;

async function callGemini(apiKey: string, parts: GeminiPart[], maxTokens = MAX_OUTPUT_TOKENS): Promise<string> {
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
  return textFromResponse(await res.json());
}

// Pulls the answer text out of a generateContent response, turning the ways
// it can come back empty into readable errors instead of "no items".
export function textFromResponse(data: any): string {
  const blocked = data?.promptFeedback?.blockReason;
  if (blocked) throw new Error(`Gemini refused this request (${blocked}). Try a different photo.`);
  const cand = data?.candidates?.[0];
  const out = (cand?.content?.parts || [])
    .filter((p: any) => !p?.thought)
    .map((p: any) => p?.text || '')
    .join('');
  const reason = cand?.finishReason;
  if (!out.trim()) {
    if (reason === 'MAX_TOKENS') throw new Error('Gemini ran out of room before answering. Try a photo with fewer items.');
    if (reason && reason !== 'STOP') throw new Error(`Gemini returned no answer (${reason}).`);
  }
  if (reason === 'MAX_TOKENS') {
    try { extractJSONArray(out); } catch { throw new Error('Gemini\'s answer was cut off. Try a photo with fewer items.'); }
  }
  return out;
}

// Finds the JSON array in a reply. Accepts a bare array or an object that
// wraps one (e.g. {"items": [...]}). Empty text means "nothing found";
// anything else that isn't valid JSON is an error, not an empty result.
export function extractJSONArray(text: string): any[] {
  const t = text.trim();
  if (!t) return [];
  const tryParse = (s: string) => { try { return JSON.parse(s); } catch { return undefined; } };
  let v = tryParse(t);
  if (v === undefined) {
    const m = t.match(/\[[\s\S]*\]/);
    v = m ? tryParse(m[0]) : undefined;
  }
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object') {
    const inner = Object.values(v).find(Array.isArray);
    if (inner) return inner as any[];
  }
  throw new Error(`Couldn't read Gemini's answer: ${t.slice(0, 120)}`);
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v);
}

const ZONE_KEYS: ZoneKey[] = ['fridge', 'freezer', 'pantry', 'kitchen'];

// Coerces one model-produced item into the expected shape (numbers may come
// back as strings like "₹45" or "7 days"); drops entries with no name.
export function normalizeParsedItem(raw: any): ParsedItem | null {
  const name = str(raw?.name);
  if (!name) return null;
  const zone = str(raw?.zone).toLowerCase() as ZoneKey;
  return {
    name,
    emoji: str(raw?.emoji),
    qty: Math.max(0, num(raw?.qty, 1)) || 1,
    unit: str(raw?.unit),
    days: Math.round(num(raw?.days, 7)),
    cat: str(raw?.cat),
    zone: ZONE_KEYS.includes(zone) ? zone : 'pantry',
    spot: str(raw?.spot),
    tip: str(raw?.tip),
    price: Math.max(0, num(raw?.price, 0)),
    store: str(raw?.store),
    date: str(raw?.date),
  };
}

function parseJSON(text: string): ParsedItem[] {
  return extractJSONArray(text)
    .map(normalizeParsedItem)
    .filter((p): p is ParsedItem => p !== null);
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

  const text = await callGemini(apiKey, [{ text: prompt }]);
  const raw: RawRecipe[] = extractJSONArray(text);
  return raw.map((r, idx) => toRecipe(r, idx, items));
}
