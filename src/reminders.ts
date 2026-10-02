import { addDays, toISODate } from './dates';
import { GroceryItem } from './types';

// Pure planning for expiry reminders: which days get a notification and what
// it says. Kept free of expo imports so it can be unit-tested.

export interface PlannedReminder {
  at: Date; // local fire time
  title: string;
  body: string;
}

export const REMINDER_HOUR = 9; // 9:00 local time
export const REMINDER_DAYS = 14; // how far ahead to schedule

function names(list: GroceryItem[]): string {
  const n = list.map((i) => i.name);
  if (n.length <= 2) return n.join(' and ');
  if (n.length === 3) return `${n[0]}, ${n[1]} and ${n[2]}`;
  return `${n[0]}, ${n[1]} and ${n.length - 2} more`;
}

function plural(count: number) {
  return count === 1 ? '1 item expires' : `${count} items expire`;
}

export function reminderText(today: GroceryItem[], tomorrow: GroceryItem[]): { title: string; body: string } {
  let title: string;
  if (today.length && tomorrow.length) title = `${today.length} expiring today, ${tomorrow.length} tomorrow`;
  else if (today.length) title = today.length === 1 ? `${today[0].name} expires today` : `${plural(today.length)} today`;
  else title = tomorrow.length === 1 ? `${tomorrow[0].name} expires tomorrow` : `${plural(tomorrow.length)} tomorrow`;

  const parts: string[] = [];
  if (today.length && (today.length > 1 || tomorrow.length)) parts.push(`Today: ${names(today)}.`);
  if (tomorrow.length && (tomorrow.length > 1 || today.length)) parts.push(`Tomorrow: ${names(tomorrow)}.`);
  parts.push('Tap for recipes that use them up.');
  return { title, body: parts.join(' ') };
}

// One reminder per day (at REMINDER_HOUR) for the next `days` days, on days
// when something in stock expires that day or the next. Today is included
// only if the reminder time hasn't passed yet.
export function planReminders(
  items: GroceryItem[],
  now: Date = new Date(),
  days: number = REMINDER_DAYS,
  hour: number = REMINDER_HOUR,
): PlannedReminder[] {
  const inStock = items.filter((i) => i.qty > 0);
  const today = toISODate(now);
  const out: PlannedReminder[] = [];
  for (let d = 0; d < days; d++) {
    const day = addDays(today, d);
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, hour, 0, 0, 0);
    if (at.getTime() <= now.getTime()) continue;
    const next = addDays(day, 1);
    const expToday = inStock.filter((i) => i.expiresOn === day);
    const expTomorrow = inStock.filter((i) => i.expiresOn === next);
    if (expToday.length === 0 && expTomorrow.length === 0) continue;
    out.push({ at, ...reminderText(expToday, expTomorrow) });
  }
  return out;
}
