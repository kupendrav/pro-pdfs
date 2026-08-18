import { useMemo } from 'react';
import { MoonStar, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { activeGuardrails } from '../lib/guardrails';
import { useNow } from '../hooks/useNow';

const styles = {
  info: 'border-acc/25 bg-acc/[0.06]',
  warn: 'border-warn/30 bg-warn/[0.07]',
  danger: 'border-danger/30 bg-danger/[0.06]',
};

const icons = { info: <MoonStar size={14} />, warn: <AlertTriangle size={14} />, danger: <ShieldCheck size={14} /> };
const tones = { info: 'text-acc', warn: 'text-warn', danger: 'text-danger' };

/** Late-night guardrail, task overrun, job-block overrun. Calm by design. */
export function GuardrailBanners() {
  const state = useStore();
  const now = useNow(true);
  const rails = useMemo(() => activeGuardrails(state, now), [state, now]);

  const visible = rails.slice(0, 2);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2" role="status">
      {visible.map((r) => (
        <div key={r.id} className={`rounded-xl border px-3.5 py-3 ${styles[r.tone]}`}>
          <p className={`flex items-center gap-1.5 text-[12.5px] font-semibold ${tones[r.tone]}`}>
            {icons[r.tone]} {r.title}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-mute">{r.body}</p>
        </div>
      ))}
    </div>
  );
}
