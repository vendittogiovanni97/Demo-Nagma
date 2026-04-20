"use client";

import React, { type ReactNode } from 'react';
import { Skeleton } from '@/components/feedback/Skeleton';

export interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: (item: T) => ReactNode;
  keyExtractor: (item: T) => string | number;
  footer?: ReactNode;
}

const alignClass: Record<NonNullable<Column<unknown>['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const SKELETON_ROWS = 3;

export default function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'Nessun dato trovato',
  actions,
  keyExtractor,
  footer,
}: DataTableProps<T>) {
  const hasActions = Boolean(actions);
  const totalCols = columns.length + (hasActions ? 1 : 0);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-4 px-6 text-xs font-bold text-text-secondary uppercase tracking-wider ${alignClass[col.align ?? 'left']}`}
                >
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th className="py-4 px-6 text-right text-xs font-bold text-text-secondary uppercase tracking-wider w-[1%] whitespace-nowrap">
                  Azioni
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={i} className="border-b border-surface-border/50">
                  {columns.map((col) => (
                    <td key={col.key} className="py-4 px-6">
                      <Skeleton variant="text" className="w-32" />
                    </td>
                  ))}
                  {hasActions && (
                    <td className="py-4 px-6">
                      <Skeleton variant="rect" className="w-20 ml-auto h-8" />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="py-16 text-center text-sm text-text-secondary">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="border-b border-surface-border/50 hover:bg-white/5 transition-colors group"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-4 px-6 text-sm text-white ${alignClass[col.align ?? 'left']}`}
                    >
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="py-4 px-6 text-right">
                      {actions!(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {footer && (
        <div className="border-t border-surface-border">
          {footer}
        </div>
      )}
    </div>
  );
}
