import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger' | 'soft';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'text-white bg-gradient-to-br from-acc to-acc2 shadow-glow hover:brightness-110 active:brightness-95',
  soft: 'text-acc bg-acc/10 hover:bg-acc/18',
  ghost: 'text-mute hover:text-ink hover:bg-panel2',
  outline: 'text-ink border border-line bg-panel hover:bg-panel2',
  danger: 'text-danger bg-danger/10 hover:bg-danger/20 border border-danger/30',
};

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-[13px] gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'outline', size = 'md', className = '', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex select-none items-center justify-center font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-45 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  );
});
