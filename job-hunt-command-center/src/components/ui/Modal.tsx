import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  sub,
  children,
  wide,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  wide?: boolean;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    const first = el?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab' && el) {
        const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (n) => n.offsetParent !== null,
        );
        if (items.length === 0) return;
        const firstItem = items[0];
        const lastItem = items[items.length - 1];
        if (!e.shiftKey && document.activeElement === lastItem) {
          e.preventDefault();
          firstItem.focus();
        } else if (e.shiftKey && document.activeElement === firstItem) {
          e.preventDefault();
          lastItem.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Dialog'}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-panel shadow-soft animate-rise-in sm:rounded-2xl ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-md'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-panel/95 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
            {sub && <p className="mt-0.5 text-xs text-mute">{sub}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-faint transition-colors hover:bg-panel2 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="sticky bottom-0 flex justify-end gap-2 border-t border-line bg-panel/95 px-5 py-3.5 backdrop-blur">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmButtons({
  onCancel,
  onConfirm,
  confirmLabel = 'Confirm',
  danger,
  busy,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy}>
        {confirmLabel}
      </Button>
    </div>
  );
}
