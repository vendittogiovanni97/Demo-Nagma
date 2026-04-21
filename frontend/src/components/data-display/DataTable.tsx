"use client";

import React, { type ReactNode } from 'react';
import { Skeleton } from '@/components/feedback/Skeleton';

export interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
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

const SKELETON_ROWS = 5;

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
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={[
                    'py-3.5 px-5 text-[11px] font-bold text-text-secondary uppercase tracking-widest',
                    'bg-white/[0.03] border-b border-surface-border',
                    alignClass[col.align ?? 'left'],
                    i === 0 ? 'pl-6' : '',
                  ].join(' ')}
                >
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th className="py-3.5 px-5 pr-6 text-right text-[11px] font-bold text-text-secondary uppercase tracking-widest bg-white/[0.03] border-b border-surface-border w-[1%] whitespace-nowrap">
                  Azioni
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col, j) => (
                    <td
                      key={col.key}
                      className={[
                        'py-4 px-5 border-b border-surface-border/40',
                        j === 0 ? 'pl-6' : '',
                        i % 2 === 1 ? 'bg-white/[0.015]' : '',
                      ].join(' ')}
                    >
                      <Skeleton variant="text" className="w-28 h-4" />
                    </td>
                  ))}
                  {hasActions && (
                    <td className="py-4 px-5 pr-6 border-b border-surface-border/40">
                      <div className="flex justify-end gap-1">
                        <Skeleton variant="rect" className="w-8 h-8 rounded-lg" />
                        <Skeleton variant="rect" className="w-8 h-8 rounded-lg" />
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="py-20 text-center text-sm text-text-secondary">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr
                  key={keyExtractor(item)}
                  className={[
                    'group transition-colors duration-150',
                    rowIdx % 2 === 1 ? 'bg-white/[0.018]' : '',
                    rowIdx < data.length - 1 ? 'border-b border-surface-border/40' : '',
                    'hover:bg-accent/[0.06]',
                  ].join(' ')}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key}
                      className={[
                        'py-3.5 px-5 text-sm text-white',
                        colIdx === 0 ? 'pl-6' : '',
                        alignClass[col.align ?? 'left'],
                      ].join(' ')}
                    >
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="py-3.5 px-5 pr-6 text-right">
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
