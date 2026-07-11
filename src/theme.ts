// Design tokens ported from the Pantry.jsx prototype.
// GF = "Bricolage Grotesque" (display/heading font), BF = "Plus Jakarta Sans" (body font).
// React Native needs a distinct font-family name per weight (no CSS font-weight
// synthesis across platforms), so each weight is its own named font loaded via expo-font.

export const fonts = {
  display400: 'BricolageGrotesque_400Regular',
  display500: 'BricolageGrotesque_500Medium',
  display600: 'BricolageGrotesque_600SemiBold',
  display700: 'BricolageGrotesque_700Bold',
  display800: 'BricolageGrotesque_800ExtraBold',
  body400: 'PlusJakartaSans_400Regular',
  body500: 'PlusJakartaSans_500Medium',
  body600: 'PlusJakartaSans_600SemiBold',
  body700: 'PlusJakartaSans_700Bold',
  body800: 'PlusJakartaSans_800ExtraBold',
};

export const C = {
  green: '#2C5E3F',
  greenMid: '#3C7A50',
  greenLt: '#4F9D69',
  cream: '#FBF8F1',
  text: '#26331F',
  muted: '#8A937E',
  border: '#EFE7D6',
  amber: '#F5C95B',
  amberBg: '#FBF0D8',
  red: '#C0432B',
  orange: '#E07A5F',
  purple: '#7C5CBF',
  purpleBg: '#F0EBFF',
  white: '#FFFFFF',
};

export type ZoneKey = 'fridge' | 'freezer' | 'pantry' | 'kitchen';

export const ZONES: Record<ZoneKey, { label: string; icon: string; bg: string; color: string }> = {
  fridge: { label: 'Fridge', icon: '🧊', bg: '#E4EFF5', color: '#3E7FA8' },
  freezer: { label: 'Freezer', icon: '❄️', bg: '#E7ECF8', color: '#5566B0' },
  pantry: { label: 'Pantry', icon: '🫙', bg: '#F5EAD6', color: '#B07F3C' },
  kitchen: { label: 'Kitchen', icon: '🍽️', bg: '#EEF0DC', color: '#82883C' },
};

export const STORE_META: Record<string, { dist: string; initial: string; bg: string; color: string }> = {
  'Whole Foods': { dist: '1.2 mi', initial: 'W', bg: '#E4EFF5', color: '#3E7FA8' },
  'Trader Joes': { dist: '0.8 mi', initial: 'T', bg: '#FCE9D9', color: '#C56A3E' },
  Costco: { dist: '4.5 mi', initial: 'C', bg: '#E7ECF8', color: '#5566B0' },
  'Local Market': { dist: '0.4 mi', initial: 'L', bg: '#EAF4E8', color: '#4C8A5A' },
};

export const TILE_BG = ['#FCE9D9', '#EAF4E8', '#FBF0D8', '#E4EFF5', '#F1ECDD'];

export const STORE_PRICE_FACTOR: Record<string, number> = {
  'Trader Joes': 1.0,
  'Whole Foods': 1.12,
  Costco: 0.9,
  'Local Market': 1.05,
};

export const NAV_SCREENS = ['home', 'inventory', 'recipes', 'list'];

// Measuring units for grocery / home items. 'no' = count (number of items).
export const UNITS = ['no', 'kg', 'g', 'L', 'ml', 'dozen', 'pack', 'bag', 'bottle', 'can', 'box', 'loaf', 'meter'];

export function money(n: number) {
  const v = Number(n);
  // Whole rupees render without paise; fractional values (e.g. computed averages)
  // keep two decimals. Grocery-scale amounts never reach lakh grouping.
  return '₹' + (Number.isInteger(v) ? v.toString() : v.toFixed(2));
}

export function expiresText(days: number): string {
  if (days < 0) return Math.abs(days) === 1 ? '1 day ago' : Math.abs(days) + ' days ago';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return 'in ' + days + ' days';
}

export function statusOf(days: number) {
  if (days < 0) return { label: 'Expired', bg: '#FBE6E0', color: '#C0432B', dot: '#D9573F' };
  if (days === 0) return { label: 'Today', bg: '#FBF0D8', color: '#9A6713', dot: '#E8A93C' };
  if (days === 1) return { label: 'Tomorrow', bg: '#FBF0D8', color: '#9A6713', dot: '#E8A93C' };
  if (days <= 3) return { label: days + ' days', bg: '#FBF0D8', color: '#9A6713', dot: '#E8A93C' };
  return { label: days + ' days', bg: '#E8F2E5', color: '#2C6B43', dot: '#5BA86F' };
}
