import { useEffect } from 'react';
import { Pause, Play, Plus, Square, Maximize2, Volume2, VolumeX, Coffee, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useStore, focusRemaining } from '../store/useStore';
import { useNow } from '../hooks/useNow';
import { fmtClock, fmtDur } from '../lib/time';
import { Button } from './ui/Button';
import { Ring } from './ui/misc';
import { Modal } from './ui/Modal';
import { chime, notify } from '../lib/sound';

/** Watches a running countdown and completes it at zero (chime + notification). */
export function FocusWatcher() {
  const focus = useStore((s) => s.focus);
  const completeCountdown = useStore((s) => s.completeCountdown);
  const sound = useStore((s) => s.settings.sound);
  const notifications = useStore((s) => s.settings.notifications);
  const now = useNow(!!focus?.running);

  useEffect(() => {
    if (!focus || !focus.running || focus.presetSec === 0) return;
    const remaining = focusRemaining(useStore.getState(), now);
    if (remaining != null && remaining <= 0) {
      if (sound) chime();
      if (notifications) notify('Focus session complete', `${focus.label} — nice work. Breathe.`);
      completeCountdown();
    }
  }, [now, focus, completeCountdown, sound, notifications]);

  return null;
}

export function FocusOverlay() {
  const open = useStore((s) => s.ui.focusOverlay);
  const focus = useStore((s) => s.focus);
  const setFocusOverlay = useStore((s) => s.setFocusOverlay);
  const pauseFocus = useStore((s) => s.pauseFocus);
  const resumeFocus = useStore((s) => s.resumeFocus);
  const extendFocus = useStore((s) => s.extendFocus);
  const stopFocus = useStore((s) => s.stopFocus);
  const sound = useStore((s) => s.settings.sound);
  const updateSettings = useStore((s) => s.updateSettings);
  const now = useNow(open);

  useEffect(() => {
    const onFsChange = () => {/* re-render for fullscreen state */};
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  if (!open || !focus) return null;

  const remaining = focusRemaining(useStore.getState(), now);
  const countdown = focus.presetSec > 0;
  const display = countdown
    ? fmtClock(Math.max(0, remaining ?? 0))
    : fmtClock(focus.elapsedSec + (focus.running && focus.segStart != null ? (now - focus.segStart) / 1000 : 0));
  const progress = countdown ? 1 - Math.max(0, Math.min(1, (remaining ?? 0) / focus.presetSec)) : 0;

  const goFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      /* not permitted — ignore */
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-bg/95 px-6 backdrop-blur-xl animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Focus mode"
    >
      <div className="hero-glow pointer-events-none absolute inset-0" />

      <div className="relative text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">Focus mode</p>
        <h2 className="mt-2 max-w-xl text-balance text-xl font-semibold tracking-tight sm:text-2xl">
          {focus.label}
        </h2>
      </div>

      <Ring value={countdown ? progress : 0.75} size={280} stroke={10}>
        <span className="tnum font-mono text-[52px] font-bold leading-none tracking-tight sm:text-[64px]">
          {display}
        </span>
        {countdown && (
          <span className="mt-2 text-[11px] uppercase tracking-wider text-faint">
            of {Math.round(focus.presetSec / 60)} min
          </span>
        )}
      </Ring>

      <div className="relative flex items-center gap-2.5">
        {focus.running ? (
          <Button variant="outline" size="lg" onClick={pauseFocus} className="min-w-[128px]">
            <Pause size={15} /> Pause
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={resumeFocus} className="min-w-[128px]">
            <Play size={15} /> Resume
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={() => extendFocus(5 * 60)} aria-label="Add five minutes">
          <Plus size={15} /> 5m
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={stopFocus}
          className="text-mute hover:text-danger"
          aria-label="End focus session"
        >
          <Square size={14} /> End
        </Button>
      </div>

      <div className="relative flex items-center gap-1.5 text-faint">
        <button
          onClick={goFullscreen}
          className="rounded-lg p-2 transition-colors hover:bg-panel2 hover:text-ink"
          aria-label="Toggle full screen"
          title="Full screen"
        >
          <Maximize2 size={15} />
        </button>
        <button
          onClick={() => updateSettings({ sound: !sound })}
          className="rounded-lg p-2 transition-colors hover:bg-panel2 hover:text-ink"
          aria-label={sound ? 'Mute completion sound' : 'Unmute completion sound'}
          title={sound ? 'Sound on' : 'Sound off'}
        >
          {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
        <button
          onClick={() => setFocusOverlay(false)}
          className="ml-2 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors hover:bg-panel2 hover:text-ink"
        >
          Esc · hide (timer keeps running)
        </button>
      </div>
    </div>
  );
}

/** Shown when a countdown reaches zero. */
export function FocusCompleteDialog() {
  const done = useStore((s) => s.focusDone);
  const clear = useStore((s) => s.clearFocusDone);
  const startFocus = useStore((s) => s.startFocus);
  const toggleTaskDone = useStore((s) => s.toggleTaskDone);
  const toast = useStore((s) => s.toast);

  if (!done) return null;
  return (
    <Modal open onClose={clear} title="Focus session complete" sub={`${done.label} · ${fmtDur(done.presetSec)} of deep work`}>
      <div className="flex flex-col items-center gap-5 py-2">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-ok/10 text-ok animate-pop-in">
          <CheckCircle2 size={30} />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              clear();
              toast('Take a break — you earned it.', 'success');
            }}
          >
            <Coffee size={14} /> Take a break
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const { taskId, label, presetSec } = done;
              clear();
              startFocus({ taskId, label, presetSec });
            }}
          >
            <RotateCcw size={14} /> Continue
          </Button>
          {done.taskId && (
            <Button
              variant="primary"
              onClick={() => {
                toggleTaskDone(done.taskId!);
                clear();
              }}
            >
              <CheckCircle2 size={14} /> Mark task complete
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
