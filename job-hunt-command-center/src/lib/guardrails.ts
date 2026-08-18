import type { AppState } from '../store/useStore';
import { liveTaskFocus } from '../store/useStore';
import type { Task } from '../types';
import { blockMinutes, nowMinutes, toMin } from './time';
import { tasksForDate } from '../store/useStore';

export interface Guardrail {
  id: string;
  tone: 'info' | 'warn' | 'danger';
  title: string;
  body: string;
}

/** Which task should be happening right now? */
export function currentTask(state: AppState, now = Date.now()): Task | null {
  const today = new Date(now);
  const ds = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const m = today.getHours() * 60 + today.getMinutes();
  const tasks = tasksForDate(state, ds).filter((t) => t.start !== '' && t.status !== 'moved');
  return tasks.find((t) => toMin(t.start) <= m && m < toMin(t.end)) ?? null;
}

export function nextTask(state: AppState, now = Date.now()): Task | null {
  const today = new Date(now);
  const ds = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const m = today.getHours() * 60 + today.getMinutes();
  return (
    tasksForDate(state, ds).find((t) => t.start !== '' && t.status !== 'moved' && toMin(t.start) > m) ?? null
  );
}

export function activeGuardrails(state: AppState, now = Date.now()): Guardrail[] {
  const out: Guardrail[] = [];
  const d = new Date(now);
  const m = d.getHours() * 60 + d.getMinutes();
  const session = state.sessions[formatDay(now)];

  // Late-night guardrail
  if (toMin(state.settings.windDown) <= m && session && !session.endedAt) {
    out.push({
      id: 'winddown',
      tone: 'info',
      title: 'Your main workday is complete',
      body: 'Protect tomorrow’s energy — wind down, close the day, and start fresh tomorrow.',
    });
  }

  const cur = currentTask(state, now);
  const focus = state.focus;

  // Task overrun
  if (cur && focus?.taskId === cur.id && focus.running) {
    const planned = blockMinutes(cur.start, cur.end) * 60;
    const spent = liveTaskFocus(state, cur, now);
    if (planned > 0 && spent > planned + 15 * 60) {
      out.push({
        id: 'overrun',
        tone: 'warn',
        title: 'You’ve exceeded the planned time',
        body: `“${cur.title}” was planned for ${Math.round(planned / 60)}m and you’re ${Math.round((spent - planned) / 60)}m over. Continue if it’s genuinely valuable — otherwise mark it done and move on.`,
      });
    }
  }

  // Job application guardrail
  if (cur && cur.category === 'job') {
    const planned = Object.values(state.tasks)
      .filter((t) => t.date === formatDay(now) && t.category === 'job')
      .reduce((s, t) => s + blockMinutes(t.start, t.end), 0);
    const spent = Object.values(state.tasks)
      .filter((t) => t.date === formatDay(now) && t.category === 'job')
      .reduce((s, t) => s + liveTaskFocus(state, t, now), 0);
    if (planned > 0 && spent > planned + 10 * 60) {
      out.push({
        id: 'jobguard',
        tone: 'warn',
        title: 'Application block is ending',
        body: 'Save your progress, update the tracker, and return to learning. Quality applications > random applications.',
      });
    }
  }
  return out;
}

function formatDay(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** True if the packing block for today is still pending (nudge near its start). */
export function packingSoon(state: AppState, now = Date.now()): boolean {
  const date = formatDay(now);
  const t = Object.values(state.tasks).find((x) => x.date === date && x.kind === 'packing');
  if (!t || t.status !== 'todo') return false;
  const diff = toMin(t.start) - nowMinutes();
  return diff > 0 && diff <= 30;
}
