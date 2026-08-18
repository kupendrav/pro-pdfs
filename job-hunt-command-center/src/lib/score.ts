import type {
  BookEntry,
  DayComputed,
  DayFlags,
  DaySession,
  DsaEntry,
  RoadmapTopic,
  ScoreComponent,
  Settings,
  Task,
} from '../types';
import { blockMinutes, clamp, toMin } from './time';
import { isSunday } from './dates';

export interface ScoreData {
  tasks: Task[]; // tasks for ONE date
  date: string;
  session?: DaySession;
  books: BookEntry[];
  dsa: DsaEntry[];
  roadmapTopics: RoadmapTopic[];
  settings: Settings;
  /** job applications whose dateApplied === date */
  applicationsToday: number;
}

const HOUR = 3600;

/** Per-task credit: 1 done (0.6 partial), else focus vs planned time. */
function taskCredit(t: Task): number {
  if (t.status === 'done') return t.partial ? 0.6 : 1;
  const estSec = Math.max(blockMinutes(t.start, t.end), 15) * 60;
  return clamp(t.focusSec / estSec, 0, 1);
}

function categoryValue(tasks: Task[], cats: string[]): { value: number; done: number; total: number; focus: number } {
  const ts = tasks.filter((t) => cats.includes(t.category) && t.status !== 'moved');
  if (ts.length === 0) return { value: 0, done: 0, total: 0, focus: 0 };
  const done = ts.filter((t) => t.status === 'done').length;
  const focus = ts.reduce((s, t) => s + t.focusSec, 0);
  return { value: ts.reduce((s, t) => s + taskCredit(t), 0) / ts.length, done, total: ts.length, focus };
}

/**
 * Transparent daily productivity score. Weights favor learning over everything
 * else and cap at 100 — overworking never adds score, consistency does.
 */
export function computeDay(data: ScoreData): DayComputed {
  const { tasks, date, session, books, dsa, roadmapTopics, settings } = data;
  const sunday = isSunday(date);
  const scored = tasks.filter((t) => t.category !== 'break' && t.status !== 'moved');

  const aiml = categoryValue(tasks, ['aiml']);
  const build = categoryValue(tasks, ['build']);
  const rev = categoryValue(tasks, ['revision']);
  const read = categoryValue(tasks, ['book']);
  const dsaT = categoryValue(tasks, ['dsa']);
  const jobT = categoryValue(tasks, ['job']);
  const adminT = categoryValue(tasks, ['admin', 'personal', 'packing']);

  const bookCount = books.length;
  const dsaCount = dsa.length;
  const readValue = Math.max(read.value, clamp(bookCount / Math.max(1, settings.targets.bookTopics), 0, 1));
  const dsaValue = Math.max(dsaT.value, clamp(dsaCount / Math.max(1, settings.targets.dsaCount), 0, 1));
  // Quality over quantity: applications never score above the daily target.
  const jobValue = Math.max(jobT.value, clamp(data.applicationsToday / Math.max(1, settings.targets.applications), 0, 1));
  const scheduleDone = scored.filter((t) => t.status === 'done' || t.status === 'skipped').length;
  const scheduleValue = scored.length > 0 ? scheduleDone / scored.length : 0;

  let breakdown: ScoreComponent[];
  if (sunday) {
    breakdown = [
      { key: 'review', label: 'Review & Planning', weight: 0.4, value: adminT.value, detail: `${adminT.done}/${adminT.total} done` },
      { key: 'revision', label: 'Revision', weight: 0.25, value: rev.value, detail: `${rev.done}/${rev.total} done` },
      { key: 'reading', label: 'Reading', weight: 0.15, value: readValue, detail: bookCount > 0 ? `${bookCount} topic${bookCount > 1 ? 's' : ''} read` : 'no reading yet' },
      { key: 'aiml', label: 'Learning (light)', weight: 0.1, value: aiml.value, detail: `${aiml.done}/${aiml.total} done` },
      { key: 'schedule', label: 'Schedule Discipline', weight: 0.1, value: scheduleValue, detail: `${scheduleDone}/${scored.length} handled` },
    ];
  } else {
    breakdown = [
      { key: 'aiml', label: 'AI/ML Learning', weight: 0.25, value: aiml.value, detail: `${aiml.done}/${aiml.total} done · ${Math.round(aiml.focus / 60)}m focus` },
      { key: 'build', label: 'Building', weight: 0.2, value: build.value, detail: `${build.done}/${build.total} done` },
      { key: 'revision', label: 'Revision', weight: 0.15, value: rev.value, detail: `${rev.done}/${rev.total} done` },
      { key: 'reading', label: 'Reading', weight: 0.1, value: readValue, detail: bookCount > 0 ? `${bookCount} topic${bookCount > 1 ? 's' : ''} read` : 'no reading yet' },
      { key: 'dsa', label: 'DSA', weight: 0.1, value: dsaValue, detail: dsaCount > 0 ? `${dsaCount} solved` : `${dsaT.done}/${dsaT.total} done` },
      { key: 'job', label: 'Job Applications', weight: 0.1, value: jobValue, detail: `${jobT.done}/${jobT.total} block done` },
      { key: 'schedule', label: 'Schedule Discipline', weight: 0.1, value: scheduleValue, detail: `${scheduleDone}/${scored.length} handled` },
    ];
  }
  const score = Math.round(breakdown.reduce((s, c) => s + c.weight * c.value, 0) * 100);

  const focusSec = tasks.reduce((s, t) => s + t.focusSec, 0);
  const activeSec = session ? Math.max(0, (session.endedAt ?? Date.now()) - session.startedAt) / 1000 : 0;
  const tasksDone = scored.filter((t) => t.status === 'done').length;

  const categoryFocus: DayComputed['categoryFocus'] = {};
  for (const t of tasks) categoryFocus[t.category] = (categoryFocus[t.category] ?? 0) + t.focusSec;

  const aimlFocus = (categoryFocus.aiml ?? 0) + (categoryFocus.build ?? 0);
  const revFocus = categoryFocus.revision ?? 0;
  const stageOn = (st: 'learn' | 'revise' | 'teach') => roadmapTopics.some((t) => t.stageDates[st] === date);

  const flags: DayFlags = {
    learned: aimlFocus >= 20 * 60 || aiml.done > 0 || stageOn('learn'),
    revised: revFocus >= 10 * 60 || rev.done > 0 || stageOn('revise') || stageOn('teach'),
    read: bookCount > 0,
    dsa: dsaCount > 0,
    routine: !!session && (!!session.endedAt || score >= 40),
    hasActivity:
      tasks.some((t) => t.status !== 'todo' || t.focusSec > 0) || !!session || bookCount > 0 || dsaCount > 0,
    overall: false,
  };
  flags.overall = score >= 50 || (flags.learned && flags.dsa && flags.read);

  return {
    date,
    score,
    breakdown,
    focusSec,
    activeSec,
    tasksDone,
    tasksTotal: scored.length,
    flags,
    categoryFocus,
  };
}

// ── Streaks ───────────────────────────────────────────────────────────────────

export interface Streak {
  current: number;
  best: number;
}

/**
 * Streak with an automatic one-day grace: a single missed day never breaks a
 * streak (it just doesn't extend it). Today never counts against you while the
 * day is still in progress.
 */
export function computeStreak(days: string[], qualifies: (d: string) => boolean): Streak {
  if (days.length === 0) return { current: 0, best: 0 };
  const sorted = [...days].sort();
  const today = sorted[sorted.length - 1];

  // current — walk back from today
  let current = 0;
  let i = sorted.length - 1;
  if (qualifies(today)) {
    current++;
    i--;
  } else {
    i--; // today still in progress — don't punish it
  }
  let grace = false;
  while (i >= 0) {
    if (qualifies(sorted[i])) {
      current++;
      i--;
    } else if (!grace && i > 0) {
      grace = true; // forgive one miss
      i--;
    } else {
      break;
    }
  }

  // best — forward scan with one bridged miss per run
  let best = 0;
  let run = 0;
  let runGrace = false;
  for (const d of sorted) {
    if (qualifies(d)) {
      run++;
      best = Math.max(best, run);
    } else if (run > 0 && !runGrace) {
      runGrace = true;
    } else {
      run = 0;
      runGrace = false;
    }
  }
  return { current, best };
}

/** Aggregate a list of DayComputed into week-style stats. */
export function summarizeWeek(days: DayComputed[]) {
  const cat = (c: string) => days.reduce((s, d) => s + (d.categoryFocus[c as keyof (typeof d)['categoryFocus']] ?? 0), 0);
  const totalFocus = days.reduce((s, d) => s + d.focusSec, 0);
  const done = days.reduce((s, d) => s + d.tasksDone, 0);
  const total = days.reduce((s, d) => s + d.tasksTotal, 0);
  const activeDays = days.filter((d) => d.flags.hasActivity).length || 1;
  return {
    learningH: (cat('aiml') + cat('build')) / HOUR,
    buildingH: cat('build') / HOUR,
    readingH: cat('book') / HOUR,
    revisionH: cat('revision') / HOUR,
    dsaH: cat('dsa') / HOUR,
    jobH: cat('job') / HOUR,
    avgFocusH: totalFocus / HOUR / activeDays,
    avgScore: days.reduce((s, d) => s + (d.flags.hasActivity ? d.score : 0), 0) / activeDays,
    completion: total > 0 ? done / total : 0,
    totalFocusH: totalFocus / HOUR,
  };
}

/** Is the day on track? Compares completed vs expected-by-now. */
export function onTrack(tasks: Task[], nowMin: number): { expected: number; done: number; ok: boolean } {
  const scored = tasks.filter((t) => t.category !== 'break' && t.status !== 'moved' && t.start !== '');
  const past = scored.filter((t) => toMin(t.end) <= nowMin);
  const expected = past.length;
  const done = past.filter((t) => t.status === 'done' || t.status === 'skipped').length;
  return { expected, done, ok: expected === 0 ? true : done / expected >= 0.75 };
}
