import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';

/** Local YYYY-MM-DD for a Date. */
export function dateStr(d: Date = new Date()): string {
  return format(d, 'yyyy-MM-dd');
}

export function todayStr(): string {
  return dateStr(new Date());
}

export function strToDate(s: string): Date {
  return parseISO(`${s}T00:00:00`);
}

export function addDaysStr(s: string, days: number): string {
  return dateStr(addDays(strToDate(s), days));
}

export function prettyDate(s: string): string {
  return format(strToDate(s), 'EEE, MMM d');
}

export function prettyDateLong(s: string): string {
  return format(strToDate(s), 'EEEE, MMMM d');
}

export function isSunday(s: string): boolean {
  return strToDate(s).getDay() === 0;
}

/** 0=Sun … 6=Sat */
export function dayOfWeek(s: string): number {
  return strToDate(s).getDay();
}

/** Monday of the week containing s. */
export function weekStart(s: string): string {
  return dateStr(startOfWeek(strToDate(s), { weekStartsOn: 1 }));
}

export function isToday(s: string): boolean {
  return isSameDay(strToDate(s), new Date());
}

export function daysBetween(a: string, b: string): number {
  const ms = strToDate(b).getTime() - strToDate(a).getTime();
  return Math.round(ms / 86400000);
}

export function greeting(name: string): string {
  const h = new Date().getHours();
  const g = h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 22 ? 'Good evening' : 'Late night';
  return name ? `${g}, ${name}` : g;
}
