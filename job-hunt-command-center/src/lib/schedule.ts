import type { Settings, Task } from '../types';
import { dayOfWeek } from './dates';
import { uid } from './id';

/**
 * Materialize a day's tasks from the schedule template. Called lazily when a
 * day is first viewed — historical days are never overwritten, and edits to the
 * template only affect days that haven't been generated yet.
 */
export function generateDay(date: string, settings: Settings): Task[] {
  const dow = dayOfWeek(date);
  const isSunday = dow === 0;
  const blocks = isSunday ? settings.template.sunday : settings.template.weekdays;
  const tasks: Task[] = blocks
    .filter((blk) => !(blk.kind === 'packing') || (!isSunday && settings.packingDays.includes(dow)))
    .map((blk) => ({
      id: uid('task'),
      date,
      title: blk.title,
      category: blk.category,
      start: blk.start,
      end: blk.end,
      priority: blk.priority,
      status: 'todo' as const,
      notes: '',
      focusSec: 0,
      fixed: blk.kind === 'packing',
      kind: blk.kind,
      createdVia: 'template' as const,
    }));
  if (isSunday && settings.packingDays.includes(0)) {
    tasks.push({
      id: uid('task'),
      date,
      title: 'PACKING — fixed responsibility',
      category: 'packing',
      start: settings.packingStart,
      end: settings.packingEnd,
      priority: 'critical',
      status: 'todo',
      notes: '',
      focusSec: 0,
      fixed: true,
      kind: 'packing',
      createdVia: 'template',
    });
  }
  return tasks.sort((a, b) => a.start.localeCompare(b.start));
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const sa = a.start === '' ? '99:99' : a.start;
    const sb = b.start === '' ? '99:99' : b.start;
    return sa.localeCompare(sb);
  });
}
