import { useMemo } from 'react';
import { Power, ArrowRight, MoonStar, Flame } from 'lucide-react';
import { useStore, tasksForDate } from '../store/useStore';
import { streaks } from '../lib/stats';
import { addDaysStr, greeting, prettyDateLong, todayStr } from '../lib/dates';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { nowMinutes, toMin } from '../lib/time';

/** Pre-start morning screen: one button, zero friction. */
export function StartDayHero() {
  const state = useStore();
  const startDay = useStore((s) => s.startDay);
  const moveTaskToTomorrow = useStore((s) => s.moveTaskToTomorrow);
  const skipTask = useStore((s) => s.skipTask);
  const today = todayStr();
  const yesterday = addDaysStr(today, -1);

  const all = useMemo(() => streaks(state), [state]);
  const unfinished = useMemo(() => {
    const ys = tasksForDate(state, yesterday).filter(
      (t) => t.category !== 'break' && (t.status === 'todo' || t.status === 'in_progress'),
    );
    return ys.slice(0, 5);
  }, [state, yesterday]);

  const tasks = tasksForDate(state, today);
  const first = tasks.find((t) => t.start !== '' && toMin(t.start) > nowMinutes() && t.category !== 'break');
  const wake = state.settings.wake;
  const late = nowMinutes() > toMin(wake) + 90;

  return (
    <Card className="hero-glow relative overflow-hidden p-7 sm:p-10">
      <div className="max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">{prettyDateLong(today)}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {greeting(state.settings.name)}
        </h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-mute">
          {late
            ? `You woke past your ${wake} target — no guilt. Start now, protect the rest of the day.`
            : 'Learn → Build → Revise → Practice → Apply. One block at a time.'}
        </p>

        <div className="mt-6">
          <Button
            variant="primary"
            size="lg"
            onClick={startDay}
            className="h-12 px-7 text-[15px]"
            autoFocus
          >
            <Power size={16} /> Start My Day
          </Button>
          {first && (
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-mute">
              <MoonStar size={12} className="text-acc" />
              First up: <span className="font-medium text-ink">{first.title}</span>
              <span className="tnum font-mono text-acc">{first.start}</span>
              <ArrowRight size={12} className="text-faint" />
            </p>
          )}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-mute">
          <span className="flex items-center gap-1.5">
            <Flame size={13} className="text-warn" />
            <strong className="tnum font-mono text-ink">{all.overall.current}</strong> day streak · best {all.overall.best}
          </span>
          <span>
            DSA <strong className="tnum font-mono text-ink">{all.dsa.current}</strong>
          </span>
          <span>
            Learning <strong className="tnum font-mono text-ink">{all.learning.current}</strong>
          </span>
        </div>

        {unfinished.length > 0 && (
          <div className="mt-7 rounded-xl border border-line bg-panel2/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
              Unfinished from yesterday
            </p>
            <ul className="mt-2 space-y-1.5">
              {unfinished.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="truncate text-mute">{t.title}</span>
                  <span className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => moveTaskToTomorrow(t.id)}
                      className="rounded-md border border-line px-2 py-1 text-[11px] text-mute transition-colors hover:border-acc/40 hover:text-acc"
                    >
                      move to today
                    </button>
                    <button
                      onClick={() => skipTask(t.id)}
                      className="rounded-md border border-line px-2 py-1 text-[11px] text-faint transition-colors hover:text-ink"
                    >
                      let go
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
