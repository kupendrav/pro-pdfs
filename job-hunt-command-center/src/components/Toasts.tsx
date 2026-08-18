import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

const icons = {
  default: <Info size={14} />,
  success: <CheckCircle2 size={14} />,
  warn: <AlertTriangle size={14} />,
  danger: <XCircle size={14} />,
};

const tones = {
  default: 'text-ink border-line',
  success: 'text-ok border-ok/30',
  warn: 'text-warn border-warn/30',
  danger: 'text-danger border-danger/30',
};

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(92vw,340px)] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-panel/95 px-3.5 py-3 text-left text-[13px] shadow-soft backdrop-blur animate-rise-in ${tones[t.tone]}`}
        >
          <span className="mt-0.5 shrink-0">{icons[t.tone]}</span>
          <span className="text-ink leading-snug">{t.message}</span>
        </button>
      ))}
    </div>
  );
}
