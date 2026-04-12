"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TableSkeleton } from '../feedback/Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  render?: (value: unknown, item: T) => React.ReactNode;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: Pagination;
}

export default function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  isLoading,
  emptyMessage = 'Nessun dato trovato',
  pagination,
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton rows={5} cols={columns.length} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="border border-surface-border rounded-xl flex items-center justify-center p-10 bg-white/5 text-text-secondary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full overflow-x-auto border border-surface-border rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/2 border-b border-surface-border">
            <tr>
              {columns.map((col, i) => (
                <th key={col.key || i} className="py-4 px-6 text-xs font-bold text-text-secondary uppercase tracking-widest">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={row.id ?? rowIdx}
                className="group hover:bg-white/2 transition-colors border-b border-surface-border/50 last:border-0"
              >
                {columns.map((col, colIdx) => (
                  <td key={col.key || colIdx} className="py-4 px-6 text-sm text-white">
                    {col.render
                      ? col.render((row as Record<string, unknown>)[col.key], row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-text-secondary">
            {pagination.total} risultati — pagina {pagination.page} di {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={pagination.onPrev}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-surface-border hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={pagination.onNext}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-surface-border hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
