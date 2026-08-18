/** Gentle two-tone completion chime via WebAudio — no audio assets needed. */
export function chime() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const play = (freq: number, at: number, dur: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime + at);
      g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + dur + 0.05);
    };
    play(660, 0, 0.28);
    play(880, 0.16, 0.4);
    setTimeout(() => ctx.close(), 1200);
  } catch {
    /* audio unavailable — silently ignore */
  }
}

export function notify(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, silent: true });
    }
  } catch {
    /* notifications unavailable */
  }
}

export async function requestNotifyPermission(): Promise<boolean> {
  try {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const res = await Notification.requestPermission();
    return res === 'granted';
  } catch {
    return false;
  }
}
