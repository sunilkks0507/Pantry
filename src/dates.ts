// Calendar-date helpers. Dates are stored as local "YYYY-MM-DD" strings so
// "days left" can be recomputed against today instead of frozen at add time.

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAY_MS = 86400000;

function pad(n: number) {
  return (n < 10 ? '0' : '') + n;
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d);
}

export function isISODate(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

export function addDays(iso: string, n: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

// Whole calendar days from `from` to `to` (negative when `to` is earlier).
// Uses UTC so daylight-saving shifts never produce off-by-one results.
export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map((n) => parseInt(n, 10));
  const [ty, tm, td] = to.split('-').map((n) => parseInt(n, 10));
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS);
}

// "Jun 23", or "Jun 23, 2025" when the date is not in the current year.
export function formatShortDate(iso: string, today: string = todayISO()): string {
  const d = fromISODate(iso);
  const label = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  return iso.slice(0, 4) === today.slice(0, 4) ? label : `${label}, ${d.getFullYear()}`;
}

// Resolves a year-less label like "Jun 23" to the most recent such date on or
// before `today` (purchase dates are never in the future). Returns null when
// the label can't be parsed.
export function monthDayToPastISO(label: string, today: string = todayISO()): string | null {
  const m = /^\s*([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})\b/.exec(label || '');
  if (!m) return null;
  const month = MONTHS.findIndex((x) => x.toLowerCase() === m[1].toLowerCase());
  const day = parseInt(m[2], 10);
  if (month < 0 || day < 1 || day > 31) return null;
  const year = parseInt(today.slice(0, 4), 10);
  const candidate = toISODate(new Date(year, month, day));
  return candidate <= today ? candidate : toISODate(new Date(year - 1, month, day));
}
