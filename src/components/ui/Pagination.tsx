import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ current, total, pageSize, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const validCurrent = Math.max(1, Math.min(Number(current) || 1, totalPages));

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    const startPage = Math.max(2, validCurrent - 1);
    const endPage = Math.min(totalPages - 1, validCurrent + 1);
    if (startPage > 2) pages.push('...');
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const navBtn =
    'inline-flex h-9 items-center gap-1 rounded-[10px] border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-45';

  const from = total === 0 ? 0 : (validCurrent - 1) * pageSize + 1;
  const to = Math.min(total, validCurrent * pageSize);

  return (
    <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-ink-soft">
        Exibindo <span className="font-semibold text-ink">{from}–{to}</span> de{' '}
        <span className="font-semibold text-ink">{total}</span> registros
      </p>

      <div className="flex items-center gap-1.5">
        <button type="button" className={navBtn} onClick={() => onPageChange(validCurrent - 1)} disabled={validCurrent === 1}>
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`gap-${idx}`} className="px-1.5 text-ink-faint">…</span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page as number)}
              aria-current={validCurrent === page ? 'page' : undefined}
              className={`h-9 w-9 rounded-[10px] text-[13px] font-semibold transition-colors ${
                validCurrent === page
                  ? 'bg-brand-700 text-white shadow-[0_8px_18px_-12px_rgba(31,58,138,.9)]'
                  : 'text-ink-soft hover:bg-surface-muted'
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button type="button" className={navBtn} onClick={() => onPageChange(validCurrent + 1)} disabled={validCurrent === totalPages}>
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};
