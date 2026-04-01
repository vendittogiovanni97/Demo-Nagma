"use client";

import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({ data, columns, isLoading, emptyMessage = 'Nessun dato trovato' }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex-1 border border-surface-border rounded-xl flex items-center justify-center text-text-secondary w-full p-10 bg-white/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex-1 border border-surface-border rounded-xl flex items-center justify-center text-text-secondary w-full p-10 bg-white/5">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-surface-border rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[rgba(255,255,255,0.02)] border-b border-surface-border">
          <tr>
            {columns.map((col, idx) => (
              <th key={col.key || idx.toString()} className="py-4 px-6 text-sm font-outfit text-text-secondary font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex.toString()} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors border-b border-surface-border/50 last:border-0">
              {columns.map((col, colIndex) => (
                <td key={col.key || colIndex.toString()} className="py-4 px-6 text-sm text-white">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
