import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ current, total, pageSize, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  
  // Ensure current is a valid number
  const validCurrent = Math.max(1, Math.min(Number(current) || 1, totalPages));

  const handlePrevious = () => {
    if (validCurrent > 1) {
      onPageChange(validCurrent - 1);
    }
  };

  const handleNext = () => {
    if (validCurrent < totalPages) {
      onPageChange(validCurrent + 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      const startPage = Math.max(2, validCurrent - 1);
      const endPage = Math.min(totalPages - 1, validCurrent + 1);

      if (startPage > 2) {
        pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm text-slate-400">
        Página <span className="font-semibold text-slate-200">{validCurrent}</span> de{' '}
        <span className="font-semibold text-slate-200">{totalPages}</span> ({total} registros)
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={validCurrent === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          Anterior
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page, idx) => (
            <React.Fragment key={idx}>
              {page === '...' ? (
                <span className="px-2 py-1 text-slate-500">…</span>
              ) : (
                <Button
                  variant={validCurrent === page ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="w-10 h-10 p-0 flex items-center justify-center"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={validCurrent === totalPages}
          className="flex items-center gap-1"
        >
          Próxima
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
