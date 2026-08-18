// ── Time helpers (HH:mm strings ⇄ minutes, durations) ─────────────────────────

export function toMin(hm: string): number {
  const [h, m] = hm.split(':').map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export function fromMin(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function nowHM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** duration in seconds → "01:14:32" */
export function fmtClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
}

/** duration in seconds → "04h 32m" / "12m" */
export function fmtDur(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0 && m === 0) return `${s}s`;
  if (h === 0) return `${m}m`;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

export function blockMinutes(start: string, end: string): number {
  return Math.max(0, toMin(end) - toMin(start));
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
