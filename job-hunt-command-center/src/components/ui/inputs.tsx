import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const base =
  'w-full rounded-lg border border-line bg-panel2 px-3 py-2 text-[13px] text-ink placeholder:text-faint transition-colors focus:border-acc/60 focus:outline-none focus-visible:outline-none';

export function Field({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-mute">
        <span>{label}</span>
        {hint && <span className="text-[11px] font-normal text-faint">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${base} ${props.className ?? ''}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${base} min-h-[72px] resize-y ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${base} cursor-pointer appearance-none pr-8 ${props.className ?? ''}`}>
      {props.children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-200 ${
        checked ? 'bg-acc' : 'bg-line'
      }`}
    >
      <span
        className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
          checked ? 'left-[19px]' : 'left-[3px]'
        }`}
      />
    </button>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-panel2 px-1.5 py-0.5 font-mono text-[10px] text-mute">
      {children}
    </kbd>
  );
}
