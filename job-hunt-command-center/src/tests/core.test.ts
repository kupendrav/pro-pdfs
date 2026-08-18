import { describe, it, expect } from 'vitest';
import { toMin, fromMin, fmtClock, fmtDur, blockMinutes, clamp } from '../lib/time';
import { computeDay, computeStreak, onTrack } from '../lib/score';
import { generateDay, sortTasks } from '../lib/schedule';
import { defaultSettings } from '../lib/defaults';
import { seedRoadmap } from '../lib/roadmapSeed';
import { seedCatalog, normalizeName } from '../lib/neetcode';
import { dateStr, addDaysStr, weekStart, isSunday, todayStr } from '../lib/dates';
import type { Task } from '../types';

const settings = defaultSettings();

// ── time ──────────────────────────────────────────────────────────────────────
describe('time helpers', () => {
  it('parses and formats HH:mm', () => {
    expect(toMin('07:30')).toBe(450);
    expect(toMin('23:59')).toBe(1439);
    expect(fromMin(450)).toBe('07:30');
    expect(blockMinutes('11:00', '11:30')).toBe(30);
  });
  it('formats clocks and durations', () => {
    expect(fmtClock(3659)).toBe('01:00:59');
    expect(fmtDur(3600 * 4 + 32 * 60)).toBe('04h 32m');
    expect(fmtDur(300)).toBe('5m');
    expect(clamp(5, 0, 1)).toBe(1);
  });
});

// ── dates ─────────────────────────────────────────────────────────────────────
describe('date helpers', () => {
  it('weeks start on Monday', () => {
    expect(weekStart('2026-08-19')).toBe('2026-08-17'); // Wednesday → Monday
    expect(weekStart('2026-08-16')).toBe('2026-08-10'); // Sunday → previous Monday
  });
  it('adds days across months', () => {
    expect(addDaysStr('2026-08-31', 1)).toBe('2026-09-01');
  });
  it('detects Sunday', () => {
    expect(isSunday('2026-08-16')).toBe(true);
    expect(isSunday('2026-08-17')).toBe(false);
  });
  it('todayStr is local, not UTC', () => {
    expect(todayStr()).toBe(dateStr(new Date()));
  });
});

// ── schedule generation ────────────────────────────────────────────────────────
describe('schedule generation', () => {
  it('generates the weekday plan with packing on Monday', () => {
    const tasks = generateDay('2026-08-17', settings); // Monday
    expect(tasks.length).toBeGreaterThan(10);
    const packing = tasks.find((t) => t.kind === 'packing');
    expect(packing).toBeDefined();
    expect(packing!.start).toBe('11:00');
    expect(packing!.end).toBe('11:30');
    expect(packing!.fixed).toBe(true);
  });
  it('skips packing on Sunday and uses the light template', () => {
    const tasks = generateDay('2026-08-16', settings);
    expect(tasks.some((t) => t.kind === 'packing')).toBe(false);
    expect(tasks.some((t) => t.title.includes('Weekly Review'))).toBe(true);
  });
  it('sorts tasks by start time with anytime last', () => {
    const a: Task = { ...tasksStub(), start: '', end: '' };
    const b: Task = { ...tasksStub(), start: '08:00', end: '09:00' };
    const sorted = sortTasks([a, b]);
    expect(sorted[0].start).toBe('08:00');
  });
});

function tasksStub(): Task {
  return {
    id: 'x',
    date: todayStr(),
    title: 'stub',
    category: 'personal',
    start: '12:00',
    end: '13:00',
    priority: 'normal',
    status: 'todo',
    notes: '',
    focusSec: 0,
    createdVia: 'manual',
  };
}

// ── scoring ───────────────────────────────────────────────────────────────────
function makeTask(patch: Partial<Task>): Task {
  return { ...tasksStub(), ...patch };
}

describe('daily score', () => {
  it('scores an empty day as 0 with all flags off', () => {
    const d = computeDay({
      tasks: [],
      date: '2026-08-18',
      books: [],
      dsa: [],
      roadmapTopics: [],
      settings,
      applicationsToday: 0,
    });
    expect(d.score).toBe(0);
    expect(d.flags.overall).toBe(false);
    expect(d.flags.hasActivity).toBe(false);
  });

  it('rewards done tasks per weight and reaches a passing score', () => {
    const tasks = [
      makeTask({ id: '1', category: 'aiml', status: 'done' }),
      makeTask({ id: '2', category: 'build', status: 'done' }),
      makeTask({ id: '3', category: 'revision', status: 'done' }),
      makeTask({ id: '4', category: 'book', status: 'done' }),
      makeTask({ id: '5', category: 'dsa', status: 'done' }),
      makeTask({ id: '6', category: 'job', status: 'done' }),
    ];
    const d = computeDay({
      tasks,
      date: '2026-08-18',
      books: [{ id: 'b', date: '2026-08-18', book: 'x', topic: 't', pages: 5, keyConcepts: '', learned: '', notes: '', canExplain: true }],
      dsa: [{ id: 'd', date: '2026-08-18', problem: 'Two Sum', difficulty: 'Easy', topic: 'Arrays & Hashing', minutes: 10, independent: true, hints: false, insight: '', notes: '', link: '' }],
      roadmapTopics: [],
      settings,
      applicationsToday: 5,
    });
    expect(d.score).toBe(100);
    expect(d.flags.learned).toBe(true);
    expect(d.flags.dsa).toBe(true);
    expect(d.flags.read).toBe(true);
    expect(d.flags.overall).toBe(true);
  });

  it('caps application score at the daily target (quality > quantity)', () => {
    const base = {
      tasks: [makeTask({ id: 'j', category: 'job', status: 'todo' })],
      date: '2026-08-18',
      books: [],
      dsa: [],
      roadmapTopics: [],
      settings,
    };
    const atTarget = computeDay({ ...base, applicationsToday: 5 });
    const overTarget = computeDay({ ...base, applicationsToday: 40 });
    const jobComp = (d: ReturnType<typeof computeDay>) => d.breakdown.find((c) => c.key === 'job')!;
    expect(jobComp(atTarget).value).toBe(1);
    expect(jobComp(overTarget).value).toBe(1); // never above target
  });

  it('gives partial credit from focused time vs planned time', () => {
    const t = makeTask({ id: 'a', category: 'aiml', start: '07:30', end: '09:30', focusSec: 3600 }); // 1h of 2h
    const d = computeDay({ tasks: [t], date: '2026-08-18', books: [], dsa: [], roadmapTopics: [], settings, applicationsToday: 0 });
    const aiml = d.breakdown.find((c) => c.key === 'aiml')!;
    expect(aiml.value).toBeCloseTo(0.5, 5);
  });

  it('counts intentional skips toward schedule discipline', () => {
    const tasks = [
      makeTask({ id: '1', category: 'aiml', status: 'done' }),
      makeTask({ id: '2', category: 'personal', status: 'skipped' }),
    ];
    const d = computeDay({ tasks, date: '2026-08-18', books: [], dsa: [], roadmapTopics: [], settings, applicationsToday: 0 });
    const sched = d.breakdown.find((c) => c.key === 'schedule')!;
    expect(sched.value).toBe(1);
  });
});

// ── streaks ───────────────────────────────────────────────────────────────────
describe('streaks with one-day grace', () => {
  const q = (days: string[]) => new Set(days);
  it('bridges a single missed day', () => {
    const days = ['2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16'];
    const hit = q(['2026-08-12', '2026-08-13', '2026-08-15', '2026-08-16']);
    const s = computeStreak(days, (d) => hit.has(d));
    expect(s.current).toBe(4); // 16,15 + bridge over 14 + 13
    expect(s.best).toBe(4);
  });
  it('breaks on two consecutive misses', () => {
    const days = ['2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16'];
    const hit = q(['2026-08-16', '2026-08-12']);
    const s = computeStreak(days, (d) => hit.has(d));
    expect(s.current).toBe(1);
  });
  it('never punishes an in-progress today', () => {
    const days = ['2026-08-15', '2026-08-16'];
    const hit = q(['2026-08-15']); // today (16th) not done yet
    const s = computeStreak(days, (d) => hit.has(d));
    expect(s.current).toBe(1);
  });
});

// ── on-track ──────────────────────────────────────────────────────────────────
describe('on track', () => {
  it('compares expected vs handled blocks', () => {
    const now = 13 * 60; // 13:00
    const tasks = [
      makeTask({ id: '1', category: 'aiml', start: '07:30', end: '09:30', status: 'done' }),
      makeTask({ id: '2', category: 'build', start: '10:00', end: '11:00', status: 'done' }),
      makeTask({ id: '3', category: 'revision', start: '12:00', end: '13:00', status: 'todo' }), // missed
    ];
    const t = onTrack(tasks, now);
    expect(t.expected).toBe(3);
    expect(t.done).toBe(2);
    expect(t.ok).toBe(false); // 2/3 < 0.75? no — 2/3 = 0.667 < 0.75 → behind
  });
});

// ── seeds ─────────────────────────────────────────────────────────────────────
describe('seed data', () => {
  it('seeds a non-trivial editable roadmap', () => {
    const r = seedRoadmap();
    expect(r.milestones.length).toBeGreaterThanOrEqual(8);
    expect(r.topics.length).toBeGreaterThanOrEqual(35);
    expect(r.topics.filter((t) => t.isCurrent).length).toBe(1);
  });
  it('seeds the NeetCode checklist (~150 problems)', () => {
    const c = seedCatalog();
    expect(c.length).toBeGreaterThanOrEqual(145);
    expect(c.length).toBeLessThanOrEqual(150);
    expect(new Set(c.map((p) => p.topic)).size).toBeGreaterThanOrEqual(18);
  });
  it('normalizes problem names for auto-matching', () => {
    expect(normalizeName('Kth Smallest Element in a BST')).toBe(normalizeName('kth smallest element in a  b s t'));
  });
});
