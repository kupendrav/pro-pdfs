import type { ReactNode } from 'react';

export function Badge({
  children,
  color,
  className = '',
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
      style={color ? { background: `${color}1f`, color, border: `1px solid ${color}33` } : undefined}
    >
      {children}
    </span>
  );
}

export function Dot({ color }: { color: string }) {
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />;
}

export function ProgressBar({
  value,
  color,
  className = '',
  height = 6,
}: {
  value: number; // 0..1
  color?: string;
  className?: string;
  height?: number;
}) {
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-line/70 ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, value * 100))}%`,
          background: color ?? 'linear-gradient(90deg, rgb(var(--c-acc)), rgb(var(--c-acc2)))',
        }}
      />
    </div>
  );
}

export function Ring({
  value,
  size = 120,
  stroke = 9,
  children,
  color,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  children?: ReactNode;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--c-line))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ?? 'rgb(var(--c-acc))'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <div className="mb-1 grid h-11 w-11 place-items-center rounded-xl bg-panel2 text-faint">{icon}</div>
      <p className="text-[13.5px] font-medium">{title}</p>
      <p className="max-w-sm text-xs leading-relaxed text-mute">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function StatChip({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-panel px-3.5 py-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-acc/10 text-acc">{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
        <p className="tnum truncate text-[15px] font-semibold leading-tight">{value}</p>
        {sub && <p className="truncate text-[11px] text-mute">{sub}</p>}
      </div>
    </div>
  );
}
