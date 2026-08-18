import { useMemo, useState } from 'react';
import { Flame, Timer, Sun, Moon, MonitorSmartphone, Power, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNow } from '../hooks/useNow';
import { fmtDur } from '../lib/time';
import { prettyDateLong, todayStr } from '../lib/dates';
import { focusRemaining } from '../store/useStore';
import { EndDayModal } from './EndDayModal';

function Clock() {
  const now = useNow(true);
  const d = new Date(now);
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return (
    <div className="hidden text-right sm:block">
      <p className="tnum font-mono text-[15px] font-semibold leading-tight tracking-tight">{time}</p>
      <p className="text-[11px] text-faint">{prettyDateLong(todayStr())}</p>
    </div>
  );
}

export function TopBar() {
  const now = useNow(true);
  const [endOpen, setEndOpen] = useState(false);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const startDay = useStore((s) => s.startDay);
  const session = useStore((s) => s.sessions[todayStr()]);
  const tasks = useStore((s) => s.tasks);
  const focus = useStore((s) => s.focus);
  const setFocusOverlay = useStore((s) => s.setFocusOverlay);

  const focusToday = useMemo(() => {
    const t = todayStr();
    let sum = 0;
    for (const task of Object.values(tasks)) {
      if (task.date !== t) continue;
      sum += task.focusSec;
      if (focus?.taskId === task.id && focus.running && focus.segStart != null) {
        sum += (now - focus.segStart) / 1000;
      }
    }
    return sum;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, focus, now]);

  const remaining = focus ? focusRemaining(useStore.getState(), now) : null;

  const cycleTheme = () => {
    const order = ['dark', 'light', 'system'] as const;
    const next = order[(order.indexOf(settings.theme) + 1) % order.length];
    updateSettings({ theme: next });
  };

  const ThemeIcon = settings.theme === 'dark' ? Moon : settings.theme === 'light' ? Sun : MonitorSmartphone;

  return (
    <header className="glass sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line px-4 lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <img src="/favicon.svg" alt="" className="h-6 w-6" />
      </div>
      <Clock />

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {focus && (
          <button
            onClick={() => setFocusOverlay(true)}
            className="tnum hidden items-center gap-1.5 rounded-full border border-acc/30 bg-acc/10 px-3 py-1 font-mono text-xs text-acc transition-colors hover:bg-acc/20 md:flex"
            aria-label={`Focus running: ${focus.label}`}
          >
            <Timer size={13} className="animate-pulse-soft" />
            {remaining != null
              ? `${Math.max(0, Math.floor(remaining / 60))}:${String(Math.max(0, Math.floor(remaining % 60))).padStart(2, '0')}`
              : 'open'}
            <span className="max-w-[160px] truncate font-sans">· {focus.label}</span>
          </button>
        )}

        <div className="hidden items-center gap-1.5 text-xs text-mute md:flex" title="Focused time today">
          <Timer size={13} className="text-acc" />
          <span className="tnum font-mono font-medium">{fmtDur(focusToday)}</span>
        </div>

        <button
          onClick={cycleTheme}
          className="rounded-lg p-2 text-mute transition-colors hover:bg-panel2 hover:text-ink"
          aria-label={`Theme: ${settings.theme}. Click to change`}
          title={`Theme: ${settings.theme}`}
        >
          <ThemeIcon size={15} />
        </button>

        {!session ? (
          <button
            onClick={startDay}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-br from-acc to-acc2 px-4 text-[13px] font-semibold text-white shadow-glow transition-all hover:brightness-110"
          >
            <Power size={14} /> Start My Day
          </button>
        ) : session.endedAt ? (
          <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-ok/30 bg-ok/10 px-3.5 text-[13px] font-medium text-ok">
            <CheckCircle2 size={14} /> Day closed
          </span>
        ) : (
          <button
            onClick={() => setEndOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-panel2"
          >
            <Flame size={14} className="text-warn" /> End My Day
          </button>
        )}
      </div>

      <EndDayModal open={endOpen} onClose={() => setEndOpen(false)} />
    </header>
  );
}
