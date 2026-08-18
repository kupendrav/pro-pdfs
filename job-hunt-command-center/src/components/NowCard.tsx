import { useMemo } from 'react';
import { Play, Pause, Check, SkipForward, Timer, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNow } from '../hooks/useNow';
import { currentTask, nextTask } from '../lib/guardrails';
import { CATEGORY_META } from '../lib/defaults';
import { blockMinutes, fmtDur, nowMinutes, toMin } from '../lib/time';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

/** The big "what should I be doing right now" card. */
export function NowCard() {
  const now = useNow(true);
  const state = useStore();
  const settings = useStore((s) => s.settings);
  const startFocus = useStore((s) => s.startFocus);
  const pauseFocus = useStore((s) => s.pauseFocus);
  const resumeFocus = useStore((s) => s.resumeFocus);
  const setFocusOverlay = useStore((s) => s.setFocusOverlay);
  const toggleTaskDone = useStore((s) => s.toggleTaskDone);
  const skipTask = useStore((s) => s.skipTask);

  const cur = useMemo(() => currentTask(state, now), [state, now]);
  const next = useMemo(() => nextTask(state, now), [state, now]);
  const focus = state.focus;

  const m = nowMinutes();

  // ── between blocks / day edges ────────────────────────────────────────────
  if (!cur) {
    return (
      <Card className="hero-glow relative overflow-hidden p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">Now</p>
        {next ? (
          <>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Break — you're between blocks</h2>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-mute">
              Next {next.category !== 'break' && <span className="text-faint">up</span>}:{' '}
              <span className="font-medium text-ink">{next.title}</span>
              <span className="tnum font-mono text-xs text-acc">at {next.start}</span>
              <ArrowRight size={13} className="text-faint" />
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="soft"
                onClick={() => {
                  if (next.category === 'break') {
                    state.toast('Enjoy the break — no timer needed.', 'default');
                  } else {
                    startFocus({ taskId: next.id, presetSec: settings.focusPresetMin * 60 });
                    setFocusOverlay(true);
                  }
                }}
              >
                <Play size={14} /> Start {next.category === 'break' ? 'break' : 'early'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Free time</h2>
            <p className="mt-1.5 text-sm text-mute">
              Nothing else scheduled today. Wind down well — sleep is part of the system.
            </p>
          </>
        )}
      </Card>
    );
  }

  const meta = CATEGORY_META[cur.category];
  const runningOnThis = focus?.taskId === cur.id && focus.running;
  const elapsed =
    cur.focusSec +
    (runningOnThis && focus?.segStart != null ? (now - focus.segStart) / 1000 : 0);
  const planned = blockMinutes(cur.start, cur.end) * 60;
  const progress = planned > 0 ? Math.min(1, ((m - toMin(cur.start)) * 60) / planned) : 0;
  const done = cur.status === 'done';
  const isBreak = cur.category === 'break';
  const overrun = elapsed > planned + 15 * 60;

  return (
    <Card className={`relative overflow-hidden p-5 ${!isBreak ? 'hero-glow' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-acc animate-pulse-soft" /> Now
            <span className="rounded-full bg-acc/12 px-2 py-0.5 tracking-normal text-acc" style={{ color: meta.color, background: `${meta.color}1c` }}>
              {meta.label}
            </span>
          </p>
          <h2 className="mt-2 truncate text-xl font-semibold tracking-tight sm:text-[22px]">{cur.title}</h2>
          <p className="tnum mt-1 font-mono text-xs text-mute">
            {cur.start}–{cur.end} · {Math.round(blockMinutes(cur.start, cur.end))}m planned
          </p>
        </div>
        {runningOnThis && (
          <div className="text-right">
            <p className="tnum font-mono text-2xl font-bold leading-none text-acc">{fmtDur(elapsed)}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-faint">focused</p>
          </div>
        )}
      </div>

      {/* block progress */}
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-line/60" aria-hidden>
        <div
          className="h-full rounded-full transition-[width] duration-1000"
          style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, ${meta.color}aa, ${meta.color})` }}
        />
      </div>

      {overrun && (
        <p className="mt-3 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-[12px] leading-relaxed text-warn">
          You've exceeded the planned time. Continue if it's genuinely valuable — otherwise wrap it up and move on.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!isBreak && !done && (
          <>
            {runningOnThis ? (
              <Button variant="outline" onClick={pauseFocus}>
                <Pause size={14} /> Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  if (focus?.taskId === cur.id) resumeFocus();
                  else {
                    startFocus({ taskId: cur.id, presetSec: settings.focusPresetMin * 60 });
                    setFocusOverlay(true);
                  }
                }}
              >
                <Timer size={14} /> {focus?.taskId === cur.id ? 'Resume' : 'Start Focus'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                toggleTaskDone(cur.id);
              }}
            >
              <Check size={14} /> Done
            </Button>
            <Button variant="ghost" onClick={() => skipTask(cur.id)}>
              <SkipForward size={14} /> Skip
            </Button>
          </>
        )}
        {done && (
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-ok">
            <Check size={14} /> Completed
          </p>
        )}
      </div>

      {next && (
        <p className="mt-4 flex items-center gap-1.5 border-t border-line pt-3 text-[12px] text-mute">
          <span className="uppercase tracking-wider text-faint">Next</span>
          <ArrowRight size={12} className="text-faint" />
          <span className="truncate font-medium text-ink">{next.title}</span>
          <span className="tnum shrink-0 font-mono text-[11px] text-acc">{next.start}</span>
        </p>
      )}
    </Card>
  );
}
