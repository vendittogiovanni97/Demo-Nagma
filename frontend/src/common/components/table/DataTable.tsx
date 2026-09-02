'use client';

import type {
  GridApi,
  ICellRendererParams,
  SortChangedEvent,
} from 'ag-grid-community';
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import TablePagination from '@mui/material/TablePagination';
import useMediaQuery from '@mui/material/useMediaQuery';

import { ConfirmDialog } from '../ui/ConfirmDialog';

import { useDebouncedValue } from '@/common/hooks/useDebouncedValue';
import {
  type DataTableProps,
  type TableAction,
} from './DataTable.types';
import { DataTableGrid } from './DataTableGrid';
import { DataTableToolbar } from './DataTableToolbar';
import { TableActions } from './TableActions';
import { useRemoteTableData } from './hooks/useRemoteTableData';
import { useTablePagination } from './hooks/useTablePagination';

import {
  buildAllColumns,
  columnPresets,
  DEFAULT_BASE_COLUMNS,
  DEFAULT_COL_DEF,
  mapToAgGridColDefs,
  type BaseColumnKey,
  type ColumnAlign,
  type ColumnDefinition,
} from './TableColumns';

export { buildAllColumns, columnPresets, DEFAULT_BASE_COLUMNS, DEFAULT_COL_DEF, mapToAgGridColDefs };
export type { BaseColumnKey, ColumnAlign, ColumnDefinition };
export { TableActions };
export { default as TableFooterTotal } from './TableFooterTotal';
export type {
  DataTableProps,
  DataTableResponse,
  FetchParams,
  TableAction,
  TableActionTone,
} from './DataTable.types';

export function DataTable<E>(props: DataTableProps<E>) {
  const {
    columns,
    baseColumns = DEFAULT_BASE_COLUMNS,
    data = [],
    fetchData,
    refreshKey = 0,
    emptyTitle,
    emptyDescription,
    onDelete,
    deleteConfirmTitle,
    deleteConfirmMessage,
    renderCard,
    hideState = true,
    isLoading,
    pageSize,
    getRowStyle,
    rowActions,
    hideToolbar = false,
    footerContent,
  } = props;

  const { t } = useTranslation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const effectiveEmptyMessage =
    (emptyTitle ? `${emptyTitle}${emptyDescription ? ` - ${emptyDescription}` : ''}` : undefined) ??
    t('Nessun dato disponibile');
  const effectiveDeleteConfirmTitle = deleteConfirmTitle ?? t('Conferma eliminazione');
  const effectiveDeleteConfirmMessage =
    deleteConfirmMessage ?? t('Sei sicuro di voler eliminare questo elemento?');

  const isManaged = !!fetchData;
  const gridApiRef = useRef<GridApi | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const [deleteTarget, setDeleteTarget] = useState<E | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pagination = useTablePagination({
    gridApiRef,
    remote: isManaged,
    localTotal: data.length,
    search: searchTerm,
    initialPageSize: pageSize,
  });
  const {
    remotePage,
    remoteLimit,
    setRemotePage,
  } = pagination;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const {
    data: remoteData,
    total: remoteTotal,
    isLoading: isRemoteLoading,
    refresh: refreshRemoteData,
  } = useRemoteTableData({
    fetchData,
    query: {
      page: remotePage,
      limit: remoteLimit,
      search: debouncedSearch,
      orderBy: sortKey,
      orderDirection: sortDirection,
      refreshKey,
    },
  });

  const rawData = useMemo(() => {
    if (!isManaged) return data;
    return remoteData;
  }, [isManaged, remoteData, data]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (isManaged) setRemotePage(0);
    },
    [isManaged, setRemotePage]
  );

  const handleSortChanged = useCallback(
    (event: SortChangedEvent) => {
      if (!isManaged) return;
      const sortCol = event.api.getColumnState().find((state) => state.sort);
      setSortKey(sortCol?.colId ?? null);
      setSortDirection((sortCol?.sort as 'asc' | 'desc') ?? 'asc');
      setRemotePage(0);
    },
    [isManaged, setRemotePage]
  );

  const ActionsCellRenderer = useCallback(
    (params: ICellRendererParams) => {
      const row = params.data as E;
      if (!row) return null;
      const showDelete = Boolean(onDelete);
      const configuredActions: TableAction[] = rowActions?.(row) ?? [];
      const automaticActions: TableAction[] = [
        {
          id: 'delete',
          label: t('Elimina'),
          icon: 'cestino',
          tone: 'error',
          hidden: !showDelete,
          onClick: () => setDeleteTarget(row),
        },
      ];
      return (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%' }}>
          <TableActions actions={[...configuredActions, ...automaticActions]} />
        </Box>
      );
    },
    [
      onDelete,
      rowActions,
      t,
    ]
  );

  const allColumns = useMemo(
    () => buildAllColumns<E>({ columns, baseColumns, hideState }),
    [columns, baseColumns, hideState]
  );

  const hasActionsColumn = Boolean(onDelete || rowActions);

  const colDefs = useMemo(
    () =>
      mapToAgGridColDefs<E>({
        allColumns,
        activeColumnVisibility: {},
        translate: t,
        hasActionsColumn,
        ActionsCellRenderer,
      }),
    [
      allColumns,
      t,
      hasActionsColumn,
      ActionsCellRenderer,
    ]
  );

  const onGridReady = useCallback((api: GridApi) => {
    gridApiRef.current = api;
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || !onDelete) return;
    setDeleteLoading(true);
    try {
      await onDelete(deleteTarget);
      if (isManaged) await refreshRemoteData();
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, onDelete, isManaged, refreshRemoteData]);

  const rowData = rawData;

  const paginationCount = isManaged ? remoteTotal : pagination.localCount;
  const paginationPage = pagination.page;
  const paginationLimit = pagination.limit;
  const mobileRows = isManaged
    ? rowData
    : rowData.slice(
        paginationPage * paginationLimit,
        (paginationPage + 1) * paginationLimit
      );

  const onGetRowStyle = useCallback(
    (params: { data?: E }) => {
      if (getRowStyle && params.data) {
        return getRowStyle(params.data);
      }
      return undefined;
    },
    [getRowStyle]
  );

  return (
    <Box
      className="table-container"
      sx={{
        p: hideToolbar ? 0 : 3,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 110px)',
      }}
    >
      {!hideToolbar ? (
        <DataTableToolbar search={searchTerm} onSearchChange={handleSearchChange} />
      ) : null}

      {isSmall && renderCard ? (
        <Box
          className="table-cards-wrapper"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            flex: 1,
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 250px)',
          }}
        >
          {mobileRows.map((row, idx) => {
            const key = props.keyExtractor ? props.keyExtractor(row as E) : idx;
            return <React.Fragment key={key}>{renderCard(row as E)}</React.Fragment>;
          })}
        </Box>
      ) : (
        <DataTableGrid
          columns={colDefs}
          rows={rowData}
          loading={isLoading ?? isRemoteLoading}
          remote={isManaged}
          search={searchTerm}
          pageSize={paginationLimit}
          pageSizeOptions={pagination.pageSizeOptions}
          emptyMessage={effectiveEmptyMessage}
          keyExtractor={props.keyExtractor}
          onReady={onGridReady}
          onSortChanged={isManaged ? handleSortChanged : undefined}
          onPaginationChanged={pagination.syncLocalPagination}
          getRowStyle={onGetRowStyle}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={effectiveDeleteConfirmTitle}
        message={effectiveDeleteConfirmMessage}
        confirmText={t('Elimina')}
        severity="error"
        loading={deleteLoading}
      />

      {footerContent}

      <TablePagination
        component="div"
        count={paginationCount}
        page={paginationPage}
        onPageChange={pagination.onPageChange}
        rowsPerPage={paginationLimit}
        rowsPerPageOptions={pagination.pageSizeOptions}
        onRowsPerPageChange={pagination.onPageSizeChange}
        labelRowsPerPage={t('Righe per pagina:')}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} di ${count}`}
        getItemAriaLabel={(type) => {
          if (type === 'first') return t('Prima pagina');
          if (type === 'last') return t('Ultima pagina');
          if (type === 'next') return t('Pagina successiva');
          return t('Pagina precedente');
        }}
        slotProps={{
          select: {
            MenuProps: {
              slotProps: {
                paper: {
                  sx: {
                    mt: 1,
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: (theme) => theme.palette.mode === 'light'
                      ? alpha(theme.palette.background.paper, 0.98)
                      : alpha(theme.palette.background.paper, 0.88),
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                    boxShadow: (theme) => `0 16px 40px ${alpha(theme.palette.common.black, 0.4)}, 0 0 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                },
              },
            },
          },
        }}
        className="table-pagination"
        sx={{ mt: footerContent ? 0.5 : 2, flexShrink: 0 }}
      />
    </Box>
  );
}

export default DataTable;
export { createDateColumn, createPriceColumn, createStatusColumn } from './TableColumns';
