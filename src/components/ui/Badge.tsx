import React from 'react';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-ink-soft border-line',
  info: 'bg-info-soft text-info border-brand-100',
  success: 'bg-success-soft text-success border-success/15',
  warning: 'bg-warning-soft text-warning border-warning/15',
  danger: 'bg-danger-soft text-danger border-danger/15',
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
};

/** Mapeia status do domínio (pt-BR) para um tom visual. */
export function statusTone(status?: string): BadgeTone {
  switch ((status ?? '').toLowerCase()) {
    case 'entregue':
    case 'finalizado':
    case 'concluido':
    case 'active':
      return 'success';
    case 'pendente':
    case 'aguardando':
      return 'warning';
    case 'em_transito':
    case 'em transito':
      return 'info';
    case 'cancelado':
    case 'expired':
      return 'danger';
    default:
      return 'neutral';
  }
}

export const Badge: React.FC<{ tone?: BadgeTone; children: React.ReactNode; className?: string }> = ({
  tone = 'neutral',
  children,
  className = '',
}) => <span className={`badge-base ${tones[tone]} ${className}`}>{children}</span>;

export const StatusBadge: React.FC<{ status?: string }> = ({ status }) => (
  <Badge tone={statusTone(status)}>{(status ?? 'sem status').replace(/_/g, ' ')}</Badge>
);
