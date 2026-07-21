'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { StatusChip } from '@/common/components/ui/StatusChip';
import { MonoText } from '@/common/components/ui/MonoText';
import { formatDate } from '@/common/shared/utils/format';

export enum ActionMode {
  Create = 'Create',
  Read = 'Read',
  Edit = 'Edit',
  Delete = 'Delete',
}

export interface DataTableRef {
  openCreateModal: () => void;
  openEditModal: (item: any) => void;
  openReadModal: (item: any) => void;
}

export interface ColumnDefinition<E> {
  key: keyof E | string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: E) => React.ReactNode;
  sortable?: boolean;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  exportValue?: (row: E) => string | number | boolean | Date | null | undefined;
  exportable?: boolean;
}

export const columnPresets = {
  id: {
    key: 'id',
    label: 'ID',
    maxWidth: 90,
    minWidth: 60,
    sortable: true,
    render: (row: Record<string, unknown>) => <MonoText>{row.id as React.ReactNode}</MonoText>,
  } as ColumnDefinition<Record<string, unknown>>,
  createdAt: {
    key: 'createdAt',
    label: 'Creato il',
    minWidth: 150,
    sortable: true,
    render: (row: Record<string, unknown>) => (
      <MonoText>{formatDate(row.createdAt as string | Date)}</MonoText>
    ),
  } as ColumnDefinition<Record<string, unknown>>,
  updatedAt: {
    key: 'updatedAt',
    label: 'Aggiornato il',
    minWidth: 150,
    sortable: true,
    render: (row: Record<string, unknown>) => (
      <MonoText>{formatDate(row.updatedAt as string | Date)}</MonoText>
    ),
  } as ColumnDefinition<Record<string, unknown>>,
  status: {
    key: 'status',
    label: 'Stato',
    minWidth: 100,
    sortable: true,
    align: 'center',
    render: (row: Record<string, unknown>) => <StatusChip status={row.status as string} />,
  } as ColumnDefinition<Record<string, unknown>>,
  actions: { key: '__actions', label: 'Azioni', width: 130, sortable: false } as ColumnDefinition<
    Record<string, unknown>
  >,
};

export interface FilterChip {
  label: string;
  value: string;
}

export interface ToolbarFilter {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  minWidth?: number;
}

export interface FetchParams {
  page: number;
  limit: number;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filter?: Record<string, string>;
}

export type BaseColumnKey = 'id' | 'createdAt' | 'updatedAt';

export interface DataTableProps<E> {
  title?: string;
  subtitle?: string;
  createLabel?: string;
  onCreateClick?: () => void;
  error?: string | null;
  onErrorClose?: () => void;

  columns: ColumnDefinition<E>[];
  baseColumns?: BaseColumnKey[];
  data?: E[];
  fetchData?: (params: FetchParams) => Promise<{ items: E[]; meta: { totalItems: number } } | any>;
  refreshKey?: number;
  queryKey?: string | unknown[];
  onRowClick?: (row: E) => void;
  keyExtractor?: (row: E) => string | number;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  renderRowActionStatus?: (row: E) => React.ReactNode;
  openEntityModal?: (
    action: ActionMode,
    row: E | undefined,
    onClose: () => void,
    onSuccess: () => void
  ) => React.ReactNode;
  onEdit?: (row: E) => void;
  onDelete?: (row: E) => void | Promise<void>;
  onView?: (row: E) => void;
  editPermission?: string;
  deletePermission?: string;
  viewPermission?: string;
  deleteConfirmTitle?: string;
  deleteConfirmMessage?: string;
  statusFilter?: string;
  statusFilterOptions?: FilterChip[];
  onStatusFilterChange?: (value: string | undefined) => void;
  onRefresh?: () => void;
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (newVisibility: Record<string, boolean>) => void;
  renderExpandedRow?: (row: E) => React.ReactNode;
  renderCard?: (row: E) => React.ReactNode;
  exportable?: boolean;
  exportFileName?: string;
  hideState?: boolean;
  onStatusChange?: (row: E) => Promise<void> | void;
  extraToolbarActions?: React.ReactNode;
  toolbarFilters?: ToolbarFilter[];
  isLoading?: boolean;
  hasError?: boolean;
  pageSize?: number;
  pageSizeSelector?: number[];
  getRowStyle?: (row: E) => React.CSSProperties | undefined;
  actions?: (row: E) => React.ReactNode;
  hideToolbar?: boolean;
}

export type DataTableParams<E> = Omit<
  DataTableProps<E>,
  'refreshKey' | 'statusFilter' | 'onStatusFilterChange' | 'data'
>;

const TableLoadingSkeleton = () => (
  <Box className="table-container" sx={{ p: 3 }}>
    <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
    <Skeleton variant="rounded" height={420} />
  </Box>
);

const LazyDataTableImpl = dynamic(() => import('./DataTableImpl'), {
  ssr: false,
  loading: () => <TableLoadingSkeleton />,
});

export const DataTable = LazyDataTableImpl as unknown as <E>(
  props: DataTableProps<E> & { ref?: React.Ref<any> }
) => React.ReactElement;

export default DataTable;
