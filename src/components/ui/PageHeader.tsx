import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, description, actions }) => (
  <header className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="text-eyebrow mb-2">{eyebrow}</p>}
      <h1 className="truncate text-[26px] font-bold leading-tight text-ink">{title}</h1>
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
);
