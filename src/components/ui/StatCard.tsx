import React from 'react';

export type StatTone = 'brand' | 'success' | 'warning' | 'info' | 'neutral';

const tones: Record<StatTone, string> = {
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface-muted text-ink-soft',
};

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: StatTone;
  icon: React.ComponentType<{ size?: number }>;
  onClick?: () => void;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  tone = 'brand',
  icon: Icon,
  onClick,
  loading = false,
}) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={[
        'surface-card flex flex-col gap-4 p-5 text-left',
        onClick
          ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_20px_44px_-26px_rgba(31,58,138,.45)]'
          : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${tones[tone]}`}>
          <Icon size={18} />
        </span>
        {hint && <span className="text-[11px] font-semibold text-ink-faint">{hint}</span>}
      </div>
      <div>
        <p className="text-[12.5px] font-medium leading-snug text-ink-soft">{label}</p>
        {loading ? (
          <div className="skeleton mt-2 h-7 w-16" />
        ) : (
          <p className="mt-1 text-[28px] font-bold leading-none tracking-tight text-ink">{value}</p>
        )}
      </div>
    </Tag>
  );
};
