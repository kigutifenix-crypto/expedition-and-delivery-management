import React from 'react';

export interface TableColumn<T> {
  title?: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: keyof T | string;
  isLoading?: boolean;
  emptyText?: string;
  onRow?: (record: T) => React.HTMLAttributes<HTMLTableRowElement>;
}

const align = (a?: 'left' | 'center' | 'right') =>
  a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

export const Table = React.forwardRef<HTMLDivElement, TableProps<any>>(
  ({ columns, data, rowKey, isLoading = false, emptyText = 'Nenhum dado encontrado', onRow }, ref) => {
    if (isLoading) {
      return (
        <div className="space-y-3 p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-11 w-full" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink-faint">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-ink">{emptyText}</p>
          <p className="text-[13px] text-ink-faint">Ajuste os filtros ou cadastre um novo registro.</p>
        </div>
      );
    }

    const getRowKey = (record: any, index: number) =>
      (typeof rowKey === 'string' ? record[rowKey] : record[rowKey as keyof any]) ?? index;

    return (
      <div ref={ref} className="w-full overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`sticky top-0 z-10 border-b border-line bg-surface-muted/80 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint backdrop-blur ${align(column.align)}`}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((record, rowIndex) => {
              const rowProps = onRow ? onRow(record) : {};
              const clickable = Boolean(rowProps.onClick);
              return (
                <tr
                  key={getRowKey(record, rowIndex)}
                  {...rowProps}
                  className={`group transition-colors hover:bg-brand-50/60 ${clickable ? 'cursor-pointer' : ''} ${rowProps.className ?? ''}`}
                >
                  {columns.map((column, colIdx) => (
                    <td
                      key={colIdx}
                      className={`border-b border-line px-5 py-4 text-sm text-ink ${align(column.align)}`}
                    >
                      {column.render
                        ? column.render(column.dataIndex ? record[column.dataIndex as keyof any] : undefined, record, rowIndex)
                        : column.dataIndex
                          ? String(record[column.dataIndex as keyof any] ?? '—')
                          : '—'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },
);

Table.displayName = 'Table';
