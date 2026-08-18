import { useEffect, useState } from 'react';

type Listener = () => void;
const listeners = new Set<Listener>();
let timer: ReturnType<typeof setInterval> | null = null;

function ensureTimer() {
  if (timer != null) return;
  timer = setInterval(() => {
    for (const l of listeners) l();
  }, 1000);
}

function stopTimerIfIdle() {
  if (listeners.size === 0 && timer != null) {
    clearInterval(timer);
    timer = null;
  }
}

/**
 * Shared 1-second ticker. All subscribers reuse one interval, and the interval
 * stops entirely when nobody is watching (idle tabs cost nothing).
 */
export function useNow(enabled = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const l = () => setNow(Date.now());
    listeners.add(l);
    ensureTimer();
    return () => {
      listeners.delete(l);
      stopTimerIfIdle();
    };
  }, [enabled]);
  return now;
}
