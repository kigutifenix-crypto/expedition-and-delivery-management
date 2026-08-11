import React from 'react';

type Variant = 'default' | 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  children: React.ReactNode;
}

const base =
  'relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none ' +
  'transition-all duration-200 ease-out rounded-[10px] ' +
  'disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none ' +
  'active:translate-y-[1px]';

const variants: Record<Variant, string> = {
  default:
    'bg-brand-500 text-white shadow-[0_1px_2px_rgba(15,23,42,.16),0_8px_20px_-12px_rgba(37,99,235,.65)] hover:bg-brand-600',
  primary:
    'bg-brand-500 text-white shadow-[0_1px_2px_rgba(15,23,42,.16),0_8px_20px_-12px_rgba(37,99,235,.65)] hover:bg-brand-600',
  secondary:
    'bg-surface text-ink border border-line-strong hover:bg-surface-muted hover:border-brand-300',
  outline:
    'bg-transparent text-brand-700 border border-brand-200 hover:bg-brand-50',
  subtle:
    'bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost:
    'bg-transparent text-ink-soft hover:bg-surface-muted hover:text-ink',
  danger:
    'bg-danger text-white hover:brightness-110 shadow-[0_8px_20px_-12px_rgba(185,28,28,.7)]',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
  icon: 'h-10 w-10 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'default', size = 'md', isLoading = false, className = '', disabled, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {isLoading && size !== 'icon' ? 'Aguarde...' : children}
    </button>
  ),
);

Button.displayName = 'Button';
