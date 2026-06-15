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

export const Table = React.forwardRef<HTMLDivElement, TableProps<any>>(
  ({ columns, data, rowKey, isLoading = false, emptyText = 'Nenhum dado encontrado', onRow }, ref) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            <p className="text-slate-400">Carregando...</p>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">{emptyText}</p>
        </div>
      );
    }

    const getRowKey = (record: any, index: number) => {
      if (typeof rowKey === 'string') {
        return record[rowKey] ?? index;
      }
      return record[rowKey as keyof any] ?? index;
    };

    return (
      <div ref={ref} className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300 ${
                    column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''
                  }`}
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
              return (
                <tr
                  key={getRowKey(record, rowIndex)}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                  {...rowProps}
                >
                  {columns.map((column, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-6 py-4 text-sm ${
                        column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                      }`}
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
  }
);

Table.displayName = 'Table';
