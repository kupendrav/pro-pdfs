// ── Core data model for Job Hunt Command Center ──────────────────────────────

export type ID = string;

// Categories map 1:1 to the daily commitment areas.
export type Category =
  | 'aiml' // AI/ML roadmap learning
  | 'build' // building / projects / practice
  | 'revision'
  | 'book' // AI/ML book reading
  | 'dsa'
  | 'job'
  | 'admin'
  | 'personal'
  | 'packing' // fixed daily responsibility
  | 'break'; // breaks / meals — not scored

export type Priority = 'critical' | 'high' | 'normal' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'skipped' | 'moved';

export interface Task {
  id: ID;
  date: string; // YYYY-MM-DD (local)
  title: string;
  category: Category;
  /** '' means an unscheduled "anytime" task */
  start: string; // HH:mm
  end: string; // HH:mm
  priority: Priority;
  status: TaskStatus;
  notes: string;
  /** accumulated focused seconds while a timer ran on this task */
  focusSec: number;
  partial?: boolean; // completed partially → half credit
  fixed?: boolean; // fixed responsibility (packing) — time is protected
  kind?: 'packing';
  createdVia: 'template' | 'manual';
  completedAt?: number; // epoch ms
  roadmapTopicId?: ID;
}

// ── Focus timer engine ────────────────────────────────────────────────────────

export interface FocusState {
  taskId: ID | null;
  label: string; // shown in the focus overlay
  /** 0 = open-ended task timer */
  presetSec: number;
  /** seconds accrued across previous run segments (excluding the live one) */
  elapsedSec: number;
  running: boolean;
  /** epoch ms when the current run segment started (null when paused) */
  segStart: number | null;
}

export interface FocusDone {
  taskId: ID | null;
  label: string;
  presetSec: number;
  completedAt: number;
}

// ── Day session (Start My Day / End My Day) ───────────────────────────────────

export interface DayReview {
  wentWell: string;
  wentWrong: string;
  improve: string;
  sleepTime: string; // actual sleep time, HH:mm
}

export interface DaySession {
  date: string;
  startedAt: number;
  endedAt?: number;
  review?: DayReview;
}

// ── AI/ML roadmap ─────────────────────────────────────────────────────────────

export type Stage = 'learn' | 'build' | 'practice' | 'revise' | 'teach';

export const STAGES: Stage[] = ['learn', 'build', 'practice', 'revise', 'teach'];

export interface Milestone {
  id: ID;
  title: string;
}

export interface RoadmapTopic {
  id: ID;
  milestoneId: ID;
  title: string;
  stages: Record<Stage, boolean>;
  stageDates: Partial<Record<Stage, string>>; // when each stage was checked
  isCurrent: boolean;
  notes: string;
  project: string;
}

// ── Books ─────────────────────────────────────────────────────────────────────

export interface BookEntry {
  id: ID;
  date: string;
  book: string;
  topic: string;
  pages: number | null;
  keyConcepts: string;
  learned: string;
  notes: string;
  canExplain: boolean;
}

// ── DSA ───────────────────────────────────────────────────────────────────────

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface DsaEntry {
  id: ID;
  date: string;
  problem: string;
  difficulty: Difficulty;
  topic: string;
  minutes: number;
  independent: boolean;
  hints: boolean;
  insight: string;
  notes: string;
  link: string;
}

export interface CatalogProblem {
  id: ID;
  name: string;
  difficulty: Difficulty;
  topic: string;
  solved: boolean;
  solvedAt?: string;
}

// ── Job applications ──────────────────────────────────────────────────────────

export type JobStatus =
  | 'saved'
  | 'to_apply'
  | 'applied'
  | 'assessment'
  | 'interview'
  | 'technical'
  | 'hr'
  | 'offer'
  | 'rejected'
  | 'ghosted';

export interface JobApp {
  id: ID;
  company: string;
  role: string;
  portal: string;
  dateApplied: string;
  status: JobStatus;
  resumeVersion: string;
  coverNote: string;
  followUpDate: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

// ── Weekly review ─────────────────────────────────────────────────────────────

export interface WeekTargets {
  aimlTopics: number;
  bookTopics: number;
  projects: number;
  dsa: number;
  applications: number;
  personal: string[];
}

export interface WeeklyReview {
  weekStart: string; // Monday of the week being planned
  win: string;
  problem: string;
  change: string;
  targets: WeekTargets;
  savedAt: number;
}

// ── Settings & schedule template ──────────────────────────────────────────────

export interface Block {
  id: ID;
  title: string;
  category: Category;
  start: string; // HH:mm
  end: string; // HH:mm
  priority: Priority;
  kind?: 'packing';
}

export type ThemeMode = 'dark' | 'light' | 'system';

export interface Settings {
  name: string;
  wake: string; // HH:mm target wake
  sleep: string; // HH:mm target sleep
  windDown: string; // HH:mm — late-night guardrail
  packingDays: number[]; // 0=Sun … 6=Sat
  packingStart: string;
  packingEnd: string;
  targets: {
    aimlMin: number; // minutes of AI/ML learning per day
    dsaCount: number; // problems per day
    bookTopics: number; // book topics per day
    applications: number; // quality applications per day
  };
  focusPresetMin: number;
  breakMin: number;
  theme: ThemeMode;
  accent: string; // accent key
  sound: boolean;
  notifications: boolean;
  onboarded: boolean;
  template: { weekdays: Block[]; sunday: Block[] };
}

// ── UI (transient) ────────────────────────────────────────────────────────────

export type Section =
  | 'today'
  | 'tasks'
  | 'roadmap'
  | 'books'
  | 'dsa'
  | 'jobs'
  | 'analytics'
  | 'review'
  | 'settings';

export interface Toast {
  id: ID;
  message: string;
  tone: 'default' | 'success' | 'warn' | 'danger';
}

// ── Derived (computed, never stored) ──────────────────────────────────────────

export interface ScoreComponent {
  key: string;
  label: string;
  weight: number; // 0..1
  value: number; // 0..1
  detail: string;
}

export interface DayFlags {
  learned: boolean;
  revised: boolean;
  read: boolean;
  dsa: boolean;
  routine: boolean;
  overall: boolean;
  hasActivity: boolean;
}

export interface DayComputed {
  date: string;
  score: number; // 0..100
  breakdown: ScoreComponent[];
  focusSec: number;
  activeSec: number;
  tasksDone: number;
  tasksTotal: number; // scored tasks only
  flags: DayFlags;
  categoryFocus: Partial<Record<Category, number>>;
}
