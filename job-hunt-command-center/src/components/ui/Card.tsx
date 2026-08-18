import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-line bg-panel shadow-soft ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHead({
  title,
  sub,
  icon,
  right,
  className = '',
}: {
  title: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-3 px-4 pt-3.5 pb-2 ${className}`}>
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && <span className="text-acc shrink-0">{icon}</span>}
        <div className="min-w-0">
          <h3 className="truncate text-[13.5px] font-semibold tracking-tight">{title}</h3>
          {sub && <p className="mt-0.5 text-xs text-mute">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">{children}</h2>
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </div>
  );
}
