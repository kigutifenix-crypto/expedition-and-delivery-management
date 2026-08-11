import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Remove o padding interno (útil para tabelas full-bleed) */
  flush?: boolean;
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, flush = false, interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        'surface-card',
        flush ? 'p-0 overflow-hidden' : 'p-6',
        interactive ? 'transition-all duration-200 hover:border-brand-300 hover:shadow-[0_18px_40px_-24px_rgba(31,58,138,.35)]' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = 'Card';

export const CardHeader: React.FC<{ title: string; description?: string; action?: React.ReactNode }> = ({
  title,
  description,
  action,
}) => (
  <div className="mb-5 flex items-start justify-between gap-4">
    <div>
      <h3 className="text-[15px] font-bold text-ink">{title}</h3>
      {description && <p className="mt-0.5 text-[13px] text-ink-soft">{description}</p>}
    </div>
    {action}
  </div>
);
