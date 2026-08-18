import { addDaysStr, todayStr, weekStart } from './dates';
import { computeDay, type Streak, computeStreak } from './score';
import type { AppState } from '../store/useStore';
import type { DayComputed, DayFlags } from '../types';

/** Compute a full day from raw store state. */
export function day(state: AppState, date: string): DayComputed {
  return computeDay({
    tasks: Object.values(state.tasks).filter((t) => t.date === date),
    date,
    session: state.sessions[date],
    books: state.books.filter((b) => b.date === date),
    dsa: state.dsa.filter((d) => d.date === date),
    roadmapTopics: state.roadmap.topics,
    settings: state.settings,
    applicationsToday: Object.values(state.jobs).filter((j) => j.dateApplied === date).length,
  });
}

export { summarizeWeek } from './score';

/** First date with any recorded activity (streak history starts here). */
export function firstActivityDate(state: AppState): string | null {
  const candidates: string[] = [
    ...Object.keys(state.sessions),
    ...Object.values(state.tasks).map((t) => t.date),
    ...state.books.map((b) => b.date),
    ...state.dsa.map((d) => d.date),
  ];
  return candidates.length ? candidates.sort()[0] : null;
}

function datesSince(state: AppState): string[] {
  const first = firstActivityDate(state);
  if (!first) return [];
  const out: string[] = [];
  let d = first;
  const today = todayStr();
  while (d <= today) {
    out.push(d);
    d = addDaysStr(d, 1);
  }
  return out.slice(-400); // cap history
}

const flagKey: Record<string, keyof DayFlags> = {
  learning: 'learned',
  revision: 'revised',
  reading: 'read',
  dsa: 'dsa',
  routine: 'routine',
  overall: 'overall',
};

export function streaks(state: AppState): Record<string, Streak & { label: string }> {
  const dates = datesSince(state);
  const cache = new Map<string, DayComputed>();
  const get = (d: string) => {
    if (!cache.has(d)) cache.set(d, day(state, d));
    return cache.get(d)!;
  };
  const out: Record<string, Streak & { label: string }> = {};
  for (const [name, key] of Object.entries(flagKey)) {
    out[name] = {
      label: { learning: 'AI/ML learning', revision: 'Revision', reading: 'Reading', dsa: 'DSA', routine: 'Daily routine', overall: 'Overall consistency' }[name]!,
      ...computeStreak(dates, (d) => Boolean(get(d).flags[key])),
    };
  }
  return out;
}

/** Days of a given week (Mon..Sun). */
export function weekDates(weekStartDate: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysStr(weekStartDate, i));
}

export function currentWeekDates(): string[] {
  return weekDates(weekStart(todayStr()));
}

export function applicationsThisWeek(state: AppState): number {
  const ws = weekStart(todayStr());
  return Object.values(state.jobs).filter((j) => j.dateApplied >= ws && j.dateApplied <= todayStr()).length;
}

export function interviewsCount(state: AppState): number {
  const live = ['assessment', 'interview', 'technical', 'hr', 'offer'];
  return Object.values(state.jobs).filter((j) => live.includes(j.status)).length;
}

export function activeApplications(state: AppState): number {
  const live = ['to_apply', 'applied', 'assessment', 'interview', 'technical', 'hr', 'offer'];
  return Object.values(state.jobs).filter((j) => live.includes(j.status)).length;
}
