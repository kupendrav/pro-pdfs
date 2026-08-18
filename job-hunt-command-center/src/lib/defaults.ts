import type { Block, Settings } from '../types';
import { uid } from './id';

export const ACCENTS: Record<string, { label: string; acc: string; acc2: string }> = {
  indigo: { label: 'Indigo', acc: '99 102 241', acc2: '139 92 246' },
  violet: { label: 'Violet', acc: '139 92 246', acc2: '217 70 239' },
  blue: { label: 'Blue', acc: '59 130 246', acc2: '14 165 233' },
  emerald: { label: 'Emerald', acc: '16 185 129', acc2: '45 212 191' },
  amber: { label: 'Amber', acc: '245 158 11', acc2: '251 191 36' },
  rose: { label: 'Rose', acc: '244 63 94', acc2: '251 113 133' },
};

function b(title: string, category: Block['category'], start: string, end: string, priority: Block['priority'] = 'normal', kind?: 'packing'): Block {
  return { id: uid('b'), title, category, start, end, priority, kind };
}

/** Weekday template (Mon–Sat) mirrors the default daily schedule. */
export function defaultWeekdayTemplate(packingStart = '11:00', packingEnd = '11:30'): Block[] {
  return [
    b('Wake up · freshen up · water', 'admin', '07:00', '07:30', 'high'),
    b('Deep Work 1 — AI/ML Roadmap · Learn', 'aiml', '07:30', '09:30', 'critical'),
    b('Break · breakfast', 'break', '09:30', '10:00'),
    b('AI/ML Roadmap — Build & Practice', 'build', '10:00', '11:00', 'high'),
    b('PACKING — fixed responsibility', 'packing', packingStart, packingEnd, 'critical', 'packing'),
    b('Break', 'break', '11:30', '12:00'),
    b('AI/ML Revision — explain it without looking', 'revision', '12:00', '13:00', 'high'),
    b('Lunch · rest', 'break', '13:00', '14:00'),
    b('AI/ML Book — one meaningful topic', 'book', '14:00', '15:00', 'high'),
    b('Book notes · revision', 'book', '15:00', '15:30'),
    b('Break', 'break', '15:30', '16:00'),
    b('Project — apply what you learned', 'build', '16:00', '17:00', 'high'),
    b('Break · walk · reset', 'break', '17:00', '17:30'),
    b('LeetCode — solve 1 problem', 'dsa', '17:30', '18:30', 'high'),
    b('Dinner · personal time', 'break', '18:30', '19:30'),
    b('Job Applications — focused session', 'job', '19:30', '21:00'),
    b('Application tracking · follow-ups', 'job', '21:00', '21:30'),
    b('Daily Review', 'admin', '21:30', '22:00', 'high'),
    b('Plan tomorrow', 'admin', '22:00', '22:30'),
    b('Wind-down — no intensive work', 'break', '22:30', '23:00'),
  ];
}

/** Sunday = weekly review + planning + light revision. */
export function defaultSundayTemplate(): Block[] {
  return [
    b('Slow morning', 'personal', '08:00', '08:30'),
    b('Weekly Review — score last week', 'admin', '08:30', '10:00', 'critical'),
    b('Break', 'break', '10:00', '10:30'),
    b('Light revision — AI/ML notes & roadmap', 'revision', '10:30', '12:00', 'high'),
    b('Lunch', 'break', '12:00', '13:00'),
    b('Weekly Planning — next week targets', 'admin', '13:00', '14:00', 'high'),
    b('DSA — optional light problem', 'dsa', '14:00', '14:45', 'low'),
    b('Free · rest · walk', 'break', '14:45', '17:00'),
    b('Book — light reading', 'book', '17:00', '18:00', 'normal'),
    b('Dinner · personal', 'break', '18:00', '19:30'),
    b('Prep for the week', 'personal', '19:30', '20:00', 'low'),
    b('Wind-down', 'break', '22:00', '22:30'),
  ];
}

export function defaultSettings(): Settings {
  return {
    name: 'Kupendra',
    wake: '07:00',
    sleep: '23:00',
    windDown: '22:30',
    packingDays: [1, 2, 3, 4, 5, 6], // Mon–Sat
    packingStart: '11:00',
    packingEnd: '11:30',
    targets: { aimlMin: 120, dsaCount: 1, bookTopics: 1, applications: 5 },
    focusPresetMin: 45,
    breakMin: 30,
    theme: 'dark',
    accent: 'indigo',
    sound: true,
    notifications: false,
    onboarded: false,
    template: { weekdays: defaultWeekdayTemplate(), sunday: defaultSundayTemplate() },
  };
}

export const CATEGORY_META: Record<
  string,
  { label: string; color: string; short: string }
> = {
  aiml: { label: 'AI/ML', color: '#818cf8', short: 'AI' },
  build: { label: 'Build', color: '#fbbf24', short: 'BU' },
  revision: { label: 'Revision', color: '#fb7185', short: 'RV' },
  book: { label: 'Book', color: '#38bdf8', short: 'BK' },
  dsa: { label: 'DSA', color: '#34d399', short: 'DS' },
  job: { label: 'Job Search', color: '#a78bfa', short: 'JB' },
  admin: { label: 'Admin', color: '#94a3b8', short: 'AD' },
  personal: { label: 'Personal', color: '#2dd4bf', short: 'PS' },
  packing: { label: 'Packing', color: '#f97316', short: 'PK' },
  break: { label: 'Break', color: '#6b7280', short: 'BR' },
};

export const PRIORITY_META: Record<string, { label: string; color: string }> = {
  critical: { label: 'Critical', color: '#f43f5e' },
  high: { label: 'High', color: '#f59e0b' },
  normal: { label: 'Normal', color: '#94a3b8' },
  low: { label: 'Low', color: '#64748b' },
};

export const JOB_STATUSES: Array<{ value: string; label: string; tone: string }> = [
  { value: 'saved', label: 'Saved', tone: '#94a3b8' },
  { value: 'to_apply', label: 'To Apply', tone: '#38bdf8' },
  { value: 'applied', label: 'Applied', tone: '#818cf8' },
  { value: 'assessment', label: 'Assessment', tone: '#f59e0b' },
  { value: 'interview', label: 'Interview', tone: '#a78bfa' },
  { value: 'technical', label: 'Technical Round', tone: '#8b5cf6' },
  { value: 'hr', label: 'HR Round', tone: '#2dd4bf' },
  { value: 'offer', label: 'Offer', tone: '#34d399' },
  { value: 'rejected', label: 'Rejected', tone: '#f43f5e' },
  { value: 'ghosted', label: 'Ghosted', tone: '#64748b' },
];
