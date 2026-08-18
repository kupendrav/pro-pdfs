import { useMemo } from 'react';
import { Flame, Brain, Code2, BookOpen, Coffee, Gauge, Route } from 'lucide-react';
import { useStore } from '../store/useStore';
import { day, streaks } from '../lib/stats';
import { todayStr, isSunday } from '../lib/dates';
import { Card, CardHead } from './ui/Card';
import { Ring, ProgressBar, Badge } from './ui/misc';
import { onTrack } from '../lib/score';
import { fmtDur, nowMinutes } from '../lib/time';

/** Ring + transparent weighted breakdown of today's score. */
export function ScoreCard() {
  const state = useStore();
  const today = todayStr();
  const d = useMemo(() => day(state, today), [state, today]);

  return (
    <Card>
      <CardHead
        title="Today's progress"
        sub={isSunday(today) ? 'Sunday weights — review & planning lead' : 'Weighted for consistency, not volume'}
        icon={<Gauge size={14} />}
      />
      <div className="flex items-center gap-5 px-4 pb-4 pt-1">
        <Ring value={d.score / 100} size={104} stroke={9}>
          <span className="tnum font-mono text-[26px] font-bold leading-none">{d.score}</span>
          <span className="text-[10px] uppercase tracking-wider text-faint">of 100</span>
        </Ring>
        <div className="min-w-0 flex-1 space-y-2">
          {d.breakdown.map((c) => (
            <div key={c.key}>
              <div className="mb-0.5 flex items-baseline justify-between gap-2 text-[11px]">
                <span className="truncate text-mute">{c.label}</span>
                <span className="tnum shrink-0 font-mono text-faint">{Math.round(c.value * 100)}%</span>
              </div>
              <ProgressBar value={c.value} height={3} />
            </div>
          ))}
        </div>
      </div>
      <details className="border-t border-line px-4 py-2.5">
        <summary className="cursor-pointer text-[11px] text-faint transition-colors hover:text-mute">
          How is this scored?
        </summary>
        <p className="mt-2 text-[11.5px] leading-relaxed text-mute">
          Each area earns up to its weight: a task counts when it's done, or partially by focused time vs planned time.
          Applications cap at your daily target of {state.settings.targets.applications} — extra volume never adds score.
          A score of 50+ keeps your overall streak alive. Consistency &gt; intensity.
        </p>
      </details>
    </Card>
  );
}

function streakIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes('dsa')) return <Code2 size={13} />;
  if (l.includes('read')) return <BookOpen size={13} />;
  if (l.includes('learning')) return <Brain size={13} />;
  return <Flame size={13} />;
}

/** Compact streak panel: current + best, with one-day grace. */
export function StreaksCard() {
  const state = useStore();
  const all = useMemo(() => streaks(state), [state]);
  const rows = ['overall', 'learning', 'dsa', 'reading', 'routine'].map((k) => all[k]);
  return (
    <Card>
      <CardHead title="Streaks" sub="One missed day never breaks a streak" icon={<Flame size={14} className="text-warn" />} />
      <div className="space-y-1 px-4 pb-4">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-panel2/50"
          >
            <span className="flex items-center gap-2 text-[12.5px] text-mute">
              <span className="text-warn">{streakIcon(r.label)}</span>
              {r.label}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="tnum font-mono text-[14px] font-semibold text-ink">{r.current}</span>
              <span className="tnum font-mono text-[10.5px] text-faint">best {r.best}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** "Am I on track?" + quick numbers. */
export function QuickStatsCard() {
  const state = useStore();
  const today = todayStr();
  const d = useMemo(() => day(state, today), [state, today]);
  const tasks = useMemo(
    () => Object.values(state.tasks).filter((t) => t.date === today),
    [state.tasks, today],
  );
  const track = onTrack(tasks, nowMinutes());
  const roadmapDone = state.roadmap.topics.filter((t) => Object.values(t.stages).every(Boolean)).length;
  const roadmapPct = Math.round((roadmapDone / Math.max(1, state.roadmap.topics.length)) * 100);
  const appsToday = Object.values(state.jobs).filter((j) => j.dateApplied === today).length;

  const cells: Array<[string, string, typeof Coffee]> = [
    ['Focus time', fmtDur(d.focusSec), Coffee],
    ['Active time', fmtDur(d.activeSec), Gauge],
    ['Tasks done', `${d.tasksDone}/${d.tasksTotal}`, Coffee],
    ['Roadmap', `${roadmapPct}%`, Route],
    ['Applications', `${appsToday} today`, Flame],
    ['DSA today', state.dsa.some((x) => x.date === today) ? 'solved ✓' : 'pending', Code2],
  ];

  return (
    <Card>
      <CardHead
        title="Quick stats"
        sub={
          track.expected === 0
            ? 'Day is young'
            : track.ok
              ? `${track.done}/${track.expected} blocks handled — on track`
              : `${track.done}/${track.expected} blocks handled — catch up gently`
        }
        icon={<Coffee size={14} />}
        right={
          <Badge color={track.expected === 0 || track.ok ? '#34d399' : '#f59e0b'}>
            {track.expected === 0 || track.ok ? 'On track' : 'Behind'}
          </Badge>
        }
      />
      <div className="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-3">
        {cells.map(([label, value, Icon]) => (
          <div key={label} className="rounded-lg border border-line bg-panel2/40 px-3 py-2.5">
            <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-faint">
              <Icon size={11} /> {label}
            </p>
            <p className="tnum mt-0.5 font-mono text-[14.5px] font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
