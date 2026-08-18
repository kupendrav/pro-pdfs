import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Play,
  Pause,
  MoreHorizontal,
  Pencil,
  SkipForward,
  CalendarPlus,
  Trash2,
  Lock,
  GripVertical,
  AlarmClock,
  CircleDot,
} from 'lucide-react';
import type { Task } from '../types';
import { useStore, liveTaskFocus } from '../store/useStore';
import { useNow } from '../hooks/useNow';
import { CATEGORY_META, PRIORITY_META } from '../lib/defaults';
import { fmtDur, nowMinutes, toMin } from '../lib/time';
import { todayStr } from '../lib/dates';
import { EmptyState } from './ui/misc';

function TaskMenu({ task, onClose }: { task: Task; onClose: () => void }) {
  const openTaskEditor = useStore((s) => s.openTaskEditor);
  const skipTask = useStore((s) => s.skipTask);
  const moveTaskToTomorrow = useStore((s) => s.moveTaskToTomorrow);
  const deleteTask = useStore((s) => s.deleteTask);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClose]);

  const item =
    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] text-mute transition-colors hover:bg-panel2 hover:text-ink';
  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-20 w-44 rounded-lg border border-line bg-panel p-1 shadow-soft animate-pop-in"
      role="menu"
    >
      <button className={item} onClick={() => { openTaskEditor(task.id); onClose(); }}>
        <Pencil size={13} /> Edit / reschedule
      </button>
      <button className={item} onClick={() => { moveTaskToTomorrow(task.id); onClose(); }}>
        <CalendarPlus size={13} /> Move to tomorrow
      </button>
      <button className={item} onClick={() => { skipTask(task.id); onClose(); }}>
        <SkipForward size={13} /> Skip intentionally
      </button>
      {!task.fixed && (
        <button className={`${item} text-danger hover:text-danger`} onClick={() => { deleteTask(task.id); onClose(); }}>
          <Trash2 size={13} /> Delete
        </button>
      )}
    </div>
  );
}

export function TaskRow({
  task,
  isCurrent,
  dragActive,
  onDragStartRow,
  onDragOverRow,
  onDropRow,
  compact,
}: {
  task: Task;
  isCurrent?: boolean;
  dragActive?: boolean;
  onDragStartRow?: () => void;
  onDragOverRow?: () => void;
  onDropRow?: () => void;
  compact?: boolean;
}) {
  const now = useNow(true);
  const state = useStore();
  const toggleTaskDone = useStore((s) => s.toggleTaskDone);
  const startFocus = useStore((s) => s.startFocus);
  const pauseFocus = useStore((s) => s.pauseFocus);
  const resumeFocus = useStore((s) => s.resumeFocus);
  const openTaskEditor = useStore((s) => s.openTaskEditor);
  const moveTaskToTomorrow = useStore((s) => s.moveTaskToTomorrow);
  const skipTask = useStore((s) => s.skipTask);
  const [menuOpen, setMenuOpen] = useState(false);

  const meta = CATEGORY_META[task.category];
  const focus = state.focus;
  const runningOnThis = focus?.taskId === task.id && focus.running;
  const elapsed = liveTaskFocus(state, task, now);
  const m = nowMinutes();
  const isPast = task.start !== '' && toMin(task.end) <= m;
  const missed = isPast && task.status === 'todo' && task.date === new Date().toISOString().slice(0, 10);
  const done = task.status === 'done';
  const skipped = task.status === 'skipped';
  const isBreak = task.category === 'break';
  const priorityColor = PRIORITY_META[task.priority]?.color;

  if (compact || isBreak) {
    return (
      <div
        className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[12px] ${
          done || skipped ? 'opacity-40' : ''
        } ${isCurrent ? 'bg-panel2/70' : ''}`}
      >
        <span className="tnum w-[86px] shrink-0 font-mono text-[10.5px] text-faint">
          {task.start === '' ? 'anytime' : `${task.start}–${task.end}`}
        </span>
        <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: meta.color }} />
        <span className={`truncate ${done ? 'line-through decoration-faint' : 'text-mute'}`}>{task.title}</span>
        {done && <Check size={12} className="shrink-0 text-ok" />}
      </div>
    );
  }

  return (
    <div
      draggable={!task.fixed && task.start !== ''}
      onDragStart={onDragStartRow}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOverRow?.();
      }}
      onDrop={onDropRow}
      className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 ${
        isCurrent
          ? 'border-acc/45 bg-acc/[0.07] shadow-glow'
          : missed
            ? 'border-warn/35 bg-warn/[0.04]'
            : 'border-line bg-panel hover:bg-panel2/50'
      } ${done || skipped ? 'opacity-55' : ''} ${dragActive ? 'ring-2 ring-acc/50' : ''}`}
    >
      {/* left priority stripe */}
      <span
        className="absolute left-0 top-2.5 bottom-2.5 w-[2.5px] rounded-full"
        style={{ background: isCurrent ? 'rgb(var(--c-acc))' : priorityColor, opacity: done || skipped ? 0.3 : 0.85 }}
        aria-hidden
      />

      {/* drag handle */}
      {!task.fixed && task.start !== '' && (
        <span className="hidden cursor-grab text-faint/60 transition-colors hover:text-mute active:cursor-grabbing md:block" aria-hidden>
          <GripVertical size={13} />
        </span>
      )}

      {/* checkbox */}
      <button
        onClick={() => toggleTaskDone(task.id)}
        aria-label={done ? `Mark "${task.title}" not done` : `Mark "${task.title}" done`}
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition-all duration-200 ${
          done ? 'border-ok bg-ok text-white' : 'border-line hover:border-acc hover:bg-acc/10'
        }`}
      >
        {done && <Check size={12} strokeWidth={3} />}
      </button>

      {/* time + category */}
      <div className="w-[92px] shrink-0">
        <p className="tnum font-mono text-[11px] text-mute">{task.start === '' ? 'anytime' : `${task.start}–${task.end}`}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide" style={{ color: meta.color }}>
          <span className="h-1 w-1 rounded-full" style={{ background: meta.color }} />
          {meta.label}
          {task.fixed && <Lock size={9} className="text-warn" />}
        </p>
      </div>

      {/* title */}
      <button
        onClick={() => openTaskEditor(task.id)}
        className="min-w-0 flex-1 text-left"
        title={task.notes || task.title}
      >
        <span className={`block truncate text-[13.5px] font-medium ${done ? 'line-through decoration-faint' : ''}`}>
          {task.title}
        </span>
        {task.partial && <span className="text-[10.5px] text-warn">partially completed</span>}
      </button>

      {/* elapsed */}
      {(runningOnThis || elapsed >= 60) && (
        <span
          className={`tnum shrink-0 font-mono text-[11.5px] ${runningOnThis ? 'text-acc' : 'text-faint'}`}
          aria-label="Focused time"
        >
          {fmtDur(elapsed)}
        </span>
      )}

      {/* NOW badge */}
      {isCurrent && !done && (
        <span className="hidden shrink-0 items-center gap-1 rounded-full bg-acc/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-acc sm:flex">
          <CircleDot size={9} className="animate-pulse-soft" /> Now
        </span>
      )}

      {/* missed recovery */}
      {missed && (
        <span className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => moveTaskToTomorrow(task.id)}
            className="rounded-md border border-line px-1.5 py-1 text-[10px] text-mute transition-colors hover:text-ink"
            title="Move to tomorrow"
          >
            <AlarmClock size={11} />
          </button>
          <button
            onClick={() => skipTask(task.id)}
            className="rounded-md border border-line px-1.5 py-1 text-[10px] text-mute transition-colors hover:text-ink"
            title="Skip intentionally"
          >
            <SkipForward size={11} />
          </button>
        </span>
      )}

      {/* actions */}
      <div className="flex shrink-0 items-center gap-0.5">
        {!done && !skipped && !isBreak && (
          <button
            onClick={() => {
              if (runningOnThis) pauseFocus();
              else if (focus?.taskId === task.id) resumeFocus();
              else startFocus({ taskId: task.id });
            }}
            className="rounded-md p-1.5 text-faint transition-colors hover:bg-acc/10 hover:text-acc"
            aria-label={runningOnThis ? `Pause timer for ${task.title}` : `Start timer for ${task.title}`}
            title={runningOnThis ? 'Pause timer' : 'Start timer'}
          >
            {runningOnThis ? <Pause size={14} /> : <Play size={14} />}
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-1.5 text-faint opacity-0 transition-all hover:bg-panel2 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
            aria-label={`More actions for ${task.title}`}
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && <TaskMenu task={task} onClose={() => setMenuOpen(false)} />}
        </div>
      </div>
    </div>
  );
}

export function Timeline({ tasks, showAnytime = true }: { tasks: Task[]; showAnytime?: boolean }) {
  const reorderTasks = useStore((s) => s.reorderTasks);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const m = nowMinutes();
  const today = todayStr();

  const scheduled = tasks.filter((t) => t.start !== '');
  const anytime = tasks.filter((t) => t.start === '' && t.status !== 'moved');
  if (scheduled.length === 0 && anytime.length === 0) {
    return (
      <EmptyState
        icon={<AlarmClock size={18} />}
        title="Nothing scheduled"
        body="Start My Day to load today's plan, or add your first task."
      />
    );
  }

  const current = scheduled.find((t) => toMin(t.start) <= m && m < toMin(t.end) && t.status !== 'moved');

  return (
    <div role="list" className="space-y-1.5">
      {scheduled.map((t) => (
        <div key={t.id} role="listitem">
          <TaskRow
            task={t}
            isCurrent={t.id === current?.id && t.date === today}
            dragActive={dragId === t.id || overId === t.id}
            onDragStartRow={() => setDragId(t.id)}
            onDragOverRow={() => overId !== t.id && setOverId(t.id)}
            onDropRow={() => {
              if (dragId && dragId !== t.id) reorderTasks(dragId, t.id);
              setDragId(null);
              setOverId(null);
            }}
          />
        </div>
      ))}

      {showAnytime && anytime.length > 0 && (
        <div className="pt-2">
          <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Anytime today</p>
          <div className="space-y-1.5">
            {anytime.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
