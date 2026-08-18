import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Block,
  BookEntry,
  CatalogProblem,
  DayReview,
  DsaEntry,
  FocusDone,
  FocusState,
  ID,
  JobApp,
  JobStatus,
  Milestone,
  Priority,
  RoadmapTopic,
  Section,
  Settings,
  Stage,
  Task,
  Toast,
  WeeklyReview,
  Category,
} from '../types';
import { defaultSettings, defaultWeekdayTemplate, defaultSundayTemplate } from '../lib/defaults';
import { generateDay, sortTasks } from '../lib/schedule';
import { seedRoadmap } from '../lib/roadmapSeed';
import { seedCatalog } from '../lib/neetcode';
import { todayStr, addDaysStr, dayOfWeek } from '../lib/dates';
import { uid } from '../lib/id';
import { normalizeName } from '../lib/neetcode';

export interface AppState {
  settings: Settings;
  sessions: Record<string, import('../types').DaySession>;
  tasks: Record<ID, Task>;
  roadmap: { milestones: Milestone[]; topics: RoadmapTopic[] };
  books: BookEntry[];
  dsa: DsaEntry[];
  dsaCatalog: CatalogProblem[];
  jobs: Record<ID, JobApp>;
  reviews: Record<string, WeeklyReview>;
  focus: FocusState | null;
  focusDone: FocusDone | null;
  // transient
  toasts: Toast[];
  ui: { section: Section; taskDate: string; editingTaskId: ID | null; newTaskPreset: Partial<Task> | null; focusOverlay: boolean };
}

export interface Actions {
  // ui
  setSection(s: Section): void;
  setTaskDate(d: string): void;
  openTaskEditor(id: ID | null, preset?: Partial<Task>): void;
  closeTaskEditor(): void;
  setFocusOverlay(open: boolean): void;
  toast(message: string, tone?: Toast['tone']): void;
  dismissToast(id: ID): void;

  // session
  startDay(): void;
  endDay(review: DayReview): void;
  reopenDay(): void;

  // tasks
  ensureDay(date: string): void;
  addTask(input: Partial<Task>): Task;
  updateTask(id: ID, patch: Partial<Task>): void;
  deleteTask(id: ID): void;
  toggleTaskDone(id: ID): void;
  skipTask(id: ID): void;
  moveTaskToTomorrow(id: ID): void;
  rescheduleTask(id: ID, start: string, end: string): void;
  reorderTasks(activeId: ID, overId: ID): void;

  // focus engine
  startFocus(opts: { taskId?: ID | null; label?: string; presetSec?: number }): void;
  pauseFocus(): void;
  resumeFocus(): void;
  extendFocus(sec: number): void;
  stopFocus(): void;
  completeCountdown(): void;
  clearFocusDone(): void;

  // roadmap
  addMilestone(title: string): void;
  renameMilestone(id: ID, title: string): void;
  deleteMilestone(id: ID): void;
  addTopic(milestoneId: ID, title: string): void;
  updateTopic(id: ID, patch: Partial<Pick<RoadmapTopic, 'title' | 'notes' | 'project'>>): void;
  deleteTopic(id: ID): void;
  toggleStage(topicId: ID, stage: Stage): void;
  setCurrentTopic(topicId: ID): void;

  // books
  addBook(entry: Omit<BookEntry, 'id'>): void;
  updateBook(id: ID, patch: Partial<BookEntry>): void;
  deleteBook(id: ID): void;

  // dsa
  addDsa(entry: Omit<DsaEntry, 'id'>): void;
  updateDsa(id: ID, patch: Partial<DsaEntry>): void;
  deleteDsa(id: ID): void;
  toggleCatalogSolved(id: ID): void;

  // jobs
  addJob(app: Omit<JobApp, 'id' | 'createdAt' | 'updatedAt'>): void;
  updateJob(id: ID, patch: Partial<JobApp>): void;
  setJobStatus(id: ID, status: JobStatus): void;
  deleteJob(id: ID): void;

  // weekly
  saveWeeklyReview(review: WeeklyReview): void;
  generateNextWeek(review: WeeklyReview, personalTasks: string[]): number;

  // settings & data
  updateSettings(patch: Partial<Settings>): void;
  updateTemplate(kind: 'weekdays' | 'sunday', blocks: Block[]): void;
  resetScheduleTemplate(): void;
  applyPackingToTemplate(): void;
  importData(json: string): boolean;
  resetAll(): void;
}

export type Store = AppState & Actions;

function accrue(set: (fn: (s: AppState) => Partial<AppState>) => void, get: () => AppState) {
  // Accrue the live focus segment into elapsed + the task's focusSec.
  const f = get().focus;
  if (!f || !f.running || f.segStart == null) return;
  const seg = Math.max(0, (Date.now() - f.segStart) / 1000);
  set((s) => ({
    focus: f
      ? { ...f, elapsedSec: f.elapsedSec + seg, running: false, segStart: null }
      : null,
    tasks: f?.taskId
      ? { ...s.tasks, [f.taskId]: { ...s.tasks[f.taskId], focusSec: s.tasks[f.taskId].focusSec + seg } }
      : s.tasks,
  }));
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      settings: defaultSettings(),
      sessions: {},
      tasks: {},
      roadmap: seedRoadmap(),
      books: [],
      dsa: [],
      dsaCatalog: seedCatalog(),
      jobs: {},
      reviews: {},
      focus: null,
      focusDone: null,
      toasts: [],
      ui: { section: 'today', taskDate: todayStr(), editingTaskId: null, newTaskPreset: null, focusOverlay: false },

      // ── ui ──────────────────────────────────────────────────────────────────
      setSection: (s) => set({ ui: { ...get().ui, section: s } }),
      setTaskDate: (d) => set({ ui: { ...get().ui, taskDate: d } }),
      openTaskEditor: (id, preset) =>
        set({ ui: { ...get().ui, editingTaskId: id, newTaskPreset: id ? null : preset ?? null } }),
      closeTaskEditor: () => set({ ui: { ...get().ui, editingTaskId: null, newTaskPreset: null } }),
      setFocusOverlay: (open) => set({ ui: { ...get().ui, focusOverlay: open } }),
      toast: (message, tone = 'default') => {
        const t: Toast = { id: uid('toast'), message, tone };
        set({ toasts: [...get().toasts.slice(-3), t] });
        setTimeout(() => get().dismissToast(t.id), 3800);
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

      // ── session ─────────────────────────────────────────────────────────────
      startDay: () => {
        const today = todayStr();
        get().ensureDay(today);
        if (!get().sessions[today]) {
          set({ sessions: { ...get().sessions, [today]: { date: today, startedAt: Date.now() } } });
        } else {
          const s = get().sessions[today];
          set({ sessions: { ...get().sessions, [today]: { ...s, startedAt: s.startedAt, endedAt: undefined } } });
        }
        get().toast('Day started. One block at a time.', 'success');
      },
      endDay: (review) => {
        const today = todayStr();
        const s = get().sessions[today];
        if (!s) return;
        accrue(set, get);
        set({ sessions: { ...get().sessions, [today]: { ...s, endedAt: Date.now(), review } } });
      },
      reopenDay: () => {
        const today = todayStr();
        const s = get().sessions[today];
        if (!s) return;
        set({ sessions: { ...get().sessions, [today]: { ...s, endedAt: undefined } } });
      },

      // ── tasks ───────────────────────────────────────────────────────────────
      ensureDay: (date) => {
        const exists = Object.values(get().tasks).some((t) => t.date === date);
        if (exists) return;
        const day = generateDay(date, get().settings);
        const next = { ...get().tasks };
        for (const t of day) next[t.id] = t;
        set({ tasks: next });
      },
      addTask: (input) => {
        const t: Task = {
          id: uid('task'),
          date: input.date ?? get().ui.taskDate,
          title: input.title ?? 'New task',
          category: (input.category as Category) ?? 'personal',
          start: input.start ?? '',
          end: input.end ?? '',
          priority: (input.priority as Priority) ?? 'normal',
          status: 'todo',
          notes: input.notes ?? '',
          focusSec: 0,
          createdVia: 'manual',
        };
        set({ tasks: { ...get().tasks, [t.id]: t } });
        return t;
      },
      updateTask: (id, patch) => {
        const t = get().tasks[id];
        if (!t) return;
        set({ tasks: { ...get().tasks, [id]: { ...t, ...patch } } });
      },
      deleteTask: (id) => {
        const t = get().tasks[id];
        if (!t) return;
        if (t.fixed) {
          get().toast('Packing is a fixed responsibility — remove it from Settings → Packing instead.', 'warn');
          return;
        }
        const next = { ...get().tasks };
        delete next[id];
        set({ tasks: next });
      },
      toggleTaskDone: (id) => {
        const t = get().tasks[id];
        if (!t) return;
        if (get().focus?.taskId === id) {
          accrue(set, get);
          set({ focus: null });
        }
        set({
          tasks: {
            ...get().tasks,
            [id]:
              t.status === 'done'
                ? { ...t, status: 'todo', completedAt: undefined }
                : { ...t, status: 'done', completedAt: Date.now() },
          },
        });
      },
      skipTask: (id) => {
        const t = get().tasks[id];
        if (!t) return;
        if (get().focus?.taskId === id) {
          accrue(set, get);
          set({ focus: null });
        }
        set({ tasks: { ...get().tasks, [id]: { ...t, status: 'skipped' } } });
      },
      moveTaskToTomorrow: (id) => {
        const t = get().tasks[id];
        if (!t) return;
        const tomorrow = addDaysStr(t.date, 1);
        get().ensureDay(tomorrow);
        if (get().focus?.taskId === id) {
          accrue(set, get);
          set({ focus: null });
        }
        set({ tasks: { ...get().tasks, [id]: { ...t, date: tomorrow, status: 'todo' } } });
        get().toast('Moved to tomorrow.', 'success');
      },
      rescheduleTask: (id, start, end) => {
        const t = get().tasks[id];
        if (!t) return;
        set({ tasks: { ...get().tasks, [id]: { ...t, start, end } } });
      },
      reorderTasks: (activeId, overId) => {
        const s = get();
        const a = s.tasks[activeId];
        const o = s.tasks[overId];
        if (!a || !o || a.id === o.id || a.date !== o.date) return;
        if (a.fixed || o.fixed || a.start === '' || o.start === '') {
          if (a.fixed) s.toast('The packing block stays fixed at its time.', 'warn');
          return;
        }
        // swap time slots
        set({
          tasks: {
            ...s.tasks,
            [a.id]: { ...a, start: o.start, end: o.end },
            [o.id]: { ...o, start: a.start, end: a.end },
          },
        });
      },

      // ── focus engine ────────────────────────────────────────────────────────
      startFocus: ({ taskId, label, presetSec }) => {
        accrue(set, get); // pause anything already running
        const t = taskId ? get().tasks[taskId] : null;
        set({
          focus: {
            taskId: taskId ?? null,
            label: label ?? t?.title ?? 'Focus session',
            presetSec: presetSec ?? 0,
            elapsedSec: 0,
            running: true,
            segStart: Date.now(),
          },
        });
        if (t && t.status === 'todo') set({ tasks: { ...get().tasks, [t.id]: { ...t, status: 'in_progress' } } });
      },
      pauseFocus: () => accrue(set, get),
      resumeFocus: () => {
        const f = get().focus;
        if (!f || f.running) return;
        set({ focus: { ...f, running: true, segStart: Date.now() } });
      },
      extendFocus: (sec) => {
        const f = get().focus;
        if (!f) return;
        set({ focus: { ...f, presetSec: f.presetSec + sec } });
      },
      stopFocus: () => {
        accrue(set, get);
        set({ focus: null });
      },
      completeCountdown: () => {
        const f = get().focus;
        if (!f) return;
        accrue(set, get);
        const done: FocusDone = {
          taskId: f.taskId,
          label: f.label,
          presetSec: f.presetSec,
          completedAt: Date.now(),
        };
        set({ focus: null, focusDone: done });
      },
      clearFocusDone: () => set({ focusDone: null }),

      // ── roadmap ─────────────────────────────────────────────────────────────
      addMilestone: (title) => {
        const m: Milestone = { id: uid('m'), title };
        set({ roadmap: { ...get().roadmap, milestones: [...get().roadmap.milestones, m] } });
      },
      renameMilestone: (id, title) => {
        set({
          roadmap: {
            ...get().roadmap,
            milestones: get().roadmap.milestones.map((m) => (m.id === id ? { ...m, title } : m)),
          },
        });
      },
      deleteMilestone: (id) => {
        set({
          roadmap: {
            milestones: get().roadmap.milestones.filter((m) => m.id !== id),
            topics: get().roadmap.topics.filter((t) => t.milestoneId !== id),
          },
        });
      },
      addTopic: (milestoneId, title) => {
        const t: RoadmapTopic = {
          id: uid('t'),
          milestoneId,
          title,
          stages: { learn: false, build: false, practice: false, revise: false, teach: false },
          stageDates: {},
          isCurrent: false,
          notes: '',
          project: '',
        };
        set({ roadmap: { ...get().roadmap, topics: [...get().roadmap.topics, t] } });
      },
      updateTopic: (id, patch) => {
        set({
          roadmap: {
            ...get().roadmap,
            topics: get().roadmap.topics.map((t) => (t.id === id ? { ...t, ...patch } : t)),
          },
        });
      },
      deleteTopic: (id) => {
        set({ roadmap: { ...get().roadmap, topics: get().roadmap.topics.filter((t) => t.id !== id) } });
      },
      toggleStage: (topicId, stage) => {
        const topic = get().roadmap.topics.find((t) => t.id === topicId);
        if (!topic) return;
        const now = !topic.stages[stage];
        const stageDates = { ...topic.stageDates };
        if (now) stageDates[stage] = todayStr();
        else delete stageDates[stage];
        set({
          roadmap: {
            ...get().roadmap,
            topics: get().roadmap.topics.map((t) =>
              t.id === topicId ? { ...t, stages: { ...t.stages, [stage]: now }, stageDates } : t,
            ),
          },
        });
      },
      setCurrentTopic: (topicId) => {
        set({
          roadmap: {
            ...get().roadmap,
            topics: get().roadmap.topics.map((t) => ({ ...t, isCurrent: t.id === topicId })),
          },
        });
      },

      // ── books ───────────────────────────────────────────────────────────────
      addBook: (entry) => {
        const e: BookEntry = { ...entry, id: uid('book') };
        set({ books: [e, ...get().books] });
      },
      updateBook: (id, patch) => {
        set({ books: get().books.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
      },
      deleteBook: (id) => set({ books: get().books.filter((b) => b.id !== id) }),

      // ── dsa ─────────────────────────────────────────────────────────────────
      addDsa: (entry) => {
        const e: DsaEntry = { ...entry, id: uid('dsa') };
        set({ dsa: [e, ...get().dsa] });
        // auto-check the NeetCode checklist entry by name
        const norm = normalizeName(e.problem);
        if (norm) {
          const match = get().dsaCatalog.find((p) => normalizeName(p.name) === norm);
          if (match && !match.solved) {
            set({
              dsaCatalog: get().dsaCatalog.map((p) =>
                p.id === match.id ? { ...p, solved: true, solvedAt: e.date } : p,
              ),
            });
          }
        }
      },
      updateDsa: (id, patch) => set({ dsa: get().dsa.map((d) => (d.id === id ? { ...d, ...patch } : d)) }),
      deleteDsa: (id) => set({ dsa: get().dsa.filter((d) => d.id !== id) }),
      toggleCatalogSolved: (id) => {
        set({
          dsaCatalog: get().dsaCatalog.map((p) =>
            p.id === id ? { ...p, solved: !p.solved, solvedAt: !p.solved ? todayStr() : undefined } : p,
          ),
        });
      },

      // ── jobs ────────────────────────────────────────────────────────────────
      addJob: (app) => {
        const now = Date.now();
        const j: JobApp = { ...app, id: uid('job'), createdAt: now, updatedAt: now };
        set({ jobs: { ...get().jobs, [j.id]: j } });
      },
      updateJob: (id, patch) => {
        const j = get().jobs[id];
        if (!j) return;
        set({ jobs: { ...get().jobs, [id]: { ...j, ...patch, updatedAt: Date.now() } } });
      },
      setJobStatus: (id, status) => get().updateJob(id, { status }),
      deleteJob: (id) => {
        const next = { ...get().jobs };
        delete next[id];
        set({ jobs: next });
      },

      // ── weekly ──────────────────────────────────────────────────────────────
      saveWeeklyReview: (review) => set({ reviews: { ...get().reviews, [review.weekStart]: review } }),
      generateNextWeek: (review, personalTasks) => {
        get().saveWeeklyReview(review);
        // materialize next week + drop personal tasks evenly across weekdays
        const start = review.weekStart;
        let i = 0;
        for (let d = 0; d < 7; d++) {
          const date = addDaysStr(start, d);
          get().ensureDay(date);
          const isSun = dayOfWeek(date) === 0;
          if (!isSun && personalTasks[i]) {
            get().addTask({ date, title: personalTasks[i], category: 'personal', priority: 'normal' });
            i++;
          }
        }
        return 7;
      },

      // ── settings ────────────────────────────────────────────────────────────
      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
      updateTemplate: (kind, blocks) =>
        set({ settings: { ...get().settings, template: { ...get().settings.template, [kind]: blocks } } }),
      resetScheduleTemplate: () =>
        set({
          settings: {
            ...get().settings,
            template: {
              weekdays: defaultWeekdayTemplate(get().settings.packingStart, get().settings.packingEnd),
              sunday: defaultSundayTemplate(),
            },
          },
        }),
      applyPackingToTemplate: () => {
        const s = get().settings;
        const weekdays = s.template.weekdays.map((b) =>
          b.kind === 'packing' ? { ...b, start: s.packingStart, end: s.packingEnd } : b,
        );
        set({ settings: { ...s, template: { ...s.template, weekdays } } });
      },
      importData: (json) => {
        try {
          const parsed = JSON.parse(json);
          const state = parsed?.state ?? parsed;
          if (!state || typeof state !== 'object' || !('tasks' in state) || !('settings' in state)) {
            get().toast('That file does not look like a Command Center backup.', 'warn');
            return false;
          }
          set({
            settings: { ...defaultSettings(), ...state.settings },
            sessions: state.sessions ?? {},
            tasks: state.tasks ?? {},
            roadmap: state.roadmap ?? get().roadmap,
            books: state.books ?? [],
            dsa: state.dsa ?? [],
            dsaCatalog: state.dsaCatalog ?? get().dsaCatalog,
            jobs: state.jobs ?? {},
            reviews: state.reviews ?? {},
            focus: null,
            focusDone: null,
          });
          get().toast('Backup restored.', 'success');
          return true;
        } catch {
          get().toast('Could not read that backup file.', 'danger');
          return false;
        }
      },
      resetAll: () => {
        set({
          settings: defaultSettings(),
          sessions: {},
          tasks: {},
          roadmap: seedRoadmap(),
          books: [],
          dsa: [],
          dsaCatalog: seedCatalog(),
          jobs: {},
          reviews: {},
          focus: null,
          focusDone: null,
          toasts: [],
        });
      },
    }),
    {
      name: 'jhcc-state-v1',
      version: 1,
      partialize: (s) => ({
        settings: s.settings,
        sessions: s.sessions,
        tasks: s.tasks,
        roadmap: s.roadmap,
        books: s.books,
        dsa: s.dsa,
        dsaCatalog: s.dsaCatalog,
        jobs: s.jobs,
        reviews: s.reviews,
        focus: s.focus,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...p,
          settings: { ...defaultSettings(), ...(p.settings ?? {}) },
          roadmap: p.roadmap?.milestones ? p.roadmap : current.roadmap,
          ui: current.ui,
          toasts: [],
        };
      },
    },
  ),
);

// ── Selectors / helpers ────────────────────────────────────────────────────────

export function tasksForDate(state: AppState, date: string): Task[] {
  return sortTasks(Object.values(state.tasks).filter((t) => t.date === date));
}

export function yesterdayUnfinished(state: AppState, yesterday: string): Task[] {
  return Object.values(state.tasks).filter(
    (t) => t.date === yesterday && (t.status === 'todo' || t.status === 'in_progress'),
  );
}

/** Live focus seconds for a task (including the running segment). */
export function liveTaskFocus(state: AppState, task: Task, now: number): number {
  const f = state.focus;
  const live = f && f.taskId === task.id && f.running && f.segStart != null ? (now - f.segStart) / 1000 : 0;
  return task.focusSec + live;
}

/** Live remaining seconds for a countdown focus session. */
export function focusRemaining(state: AppState, now: number): number | null {
  const f = state.focus;
  if (!f || f.presetSec === 0) return null;
  const live = f.running && f.segStart != null ? (now - f.segStart) / 1000 : 0;
  return f.presetSec - (f.elapsedSec + live);
}
