'use client';

import type { ICellRendererParams, IsFullWidthRowParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Icon from '@/common/components/ui/Icon';
import TableActions, { type TableAction } from './TableActions';
import Alert from '@mui/material/Alert';
import type { AlertProps } from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, alpha } from '@mui/material/styles';
import { usePermission } from '@/common/providers/AuthProvider';
import { useThemeMode } from '@/common/providers/ThemeModeProvider';
import Box from '@mui/material/Box';
import MuiButton from '@mui/material/Button';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import TablePagination from '@mui/material/TablePagination';
import {
  getPreferredItemsPerPage,
  PAGE_SIZE_OPTIONS,
} from '@/common/shared/utils/pagination';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { DetailRow, RowWithId, useDataTable } from '../../hooks/useDataTable';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  ActionMode,
  type BaseColumnKey,
  type DataTableProps,
  type DataTableRef,
} from './DataTable';
import { DataTableToolbar } from './DataTableToolbar';
import { LoadingOverlay, NoRowsOverlay } from './gridTheme';

const DEFAULT_BASE_COLUMNS: BaseColumnKey[] = ['id'];

const DEFAULT_COL_DEF = {
  flex: 1,
  minWidth: 100,
  cellStyle: { display: 'flex', alignItems: 'center', height: '100%' },
} as const;

function isDetailRow<E>(row: E | DetailRow<E>): row is DetailRow<E> {
  return typeof row === 'object' && row !== null && '__isDetailRow' in row;
}

function getRowStatus<E>(row: E): string {
  if (typeof row === 'object' && row !== null && 'status' in row && typeof row.status === 'string') {
    return row.status;
  }
  return '';
}

const PageTitle = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
    </Box>
    {action}
  </Box>
);

const CreateButton = ({ children, onClick, variant, className }: MuiButtonProps) => (
  <MuiButton variant={variant} onClick={onClick} className={className} startIcon={<Icon name="piu" size={16} />}>
    {children}
  </MuiButton>
);

const StatusBanner = ({ children, severity, onClose }: AlertProps) => (
  <Alert severity={severity} onClose={onClose} sx={{ mb: 3 }}>
    {children}
  </Alert>
);

const StatusToggleButton = ({ currentStatus, onClick }: { currentStatus: string; onClick: () => void }) => (
  <Switch
    checked={currentStatus === 'ATTIVO' || currentStatus === 'ACTIVE'}
    onChange={onClick}
    size="small"
  />
);

const DataTableInner = <E,>(props: DataTableProps<E>, ref: React.Ref<DataTableRef<E>>) => {
  const {
    title,
    subtitle,
    createLabel,
    onCreateClick,
    error,
    onErrorClose,
    columns,
    baseColumns = DEFAULT_BASE_COLUMNS,
    onRowClick,
    emptyMessage,
    emptyTitle,
    emptyDescription,
    searchPlaceholder,
    renderRowActionStatus,
    onEdit,
    onDelete,
    onView,
    editPermission,
    deletePermission,
    viewPermission,
    deleteConfirmTitle,
    deleteConfirmMessage,
    openEntityModal,
    onRefresh,
    renderExpandedRow,
    renderCard,
    hideState = false,
    onStatusChange,
    extraToolbarActions,
    toolbarFilters,
    isLoading,
    hasError,
    pageSize,
    pageSizeSelector,
    getRowStyle,
    rowActions,
    hideToolbar = true,
    footerContent,
  } = props;

  const { t } = useTranslation();
  const { resolvedTheme } = useThemeMode();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const effectiveEmptyMessage = emptyMessage ?? (emptyTitle ? `${emptyTitle}${emptyDescription ? ` - ${emptyDescription}` : ''}` : undefined) ?? t('Nessun dato disponibile');
  const effectiveDeleteConfirmTitle = deleteConfirmTitle ?? t('Conferma eliminazione');
  const effectiveDeleteConfirmMessage =
    deleteConfirmMessage ?? t('Sei sicuro di voler eliminare questo elemento?');

  const onGetRowStyle = useCallback(
    (params: { data?: E | DetailRow<E> }) => {
      if (getRowStyle && params.data && !isDetailRow(params.data)) {
        return getRowStyle(params.data);
      }
      return undefined;
    },
    [getRowStyle]
  );

  const canEdit = usePermission(editPermission ?? '');
  const canDelete = usePermission(deletePermission ?? '');
  const canView = usePermission(viewPermission ?? '');

  const activeRowActionStatus = useMemo(() => {
    if (renderRowActionStatus) {
      return renderRowActionStatus;
    }
    if (onStatusChange) {
      return function StatusToggleCell(row: E) {
        return (
          <StatusToggleButton
            currentStatus={getRowStatus(row)}
            onClick={() => onStatusChange(row)}
          />
        );
      };
    }
    return undefined;
  }, [renderRowActionStatus, onStatusChange]);

  const actionsRef = useRef<{
    openModal: (action: ActionMode, row: E | undefined) => void;
    setDeleteTarget: (row: E | null) => void;
    toggleExpand: (id: string | number) => void;
    expandedRowIds: Set<string | number>;
  }>({
    openModal: () => {},
    setDeleteTarget: () => {},
    toggleExpand: () => {},
    expandedRowIds: new Set(),
  });

  const ActionsCellRenderer = useCallback(
    (params: ICellRendererParams) => {
      const row = params.data as E;
      if (!row) {
        return null;
      }
      const showView = (onView || openEntityModal) && (!viewPermission || canView);
      const showEdit = (onEdit || openEntityModal) && (!editPermission || canEdit);
      const showDelete = onDelete && (!deletePermission || canDelete);
      const configuredActions: TableAction[] = rowActions?.(row) ?? [];
      const automaticActions: TableAction[] = [
        {
          id: 'view',
          label: t('Visualizza'),
          icon: 'vedi',
          tone: 'primary',
          hidden: !showView,
          onClick: () =>
            onView
              ? onView(row)
              : openEntityModal
                ? actionsRef.current.openModal(ActionMode.Read, row)
                : undefined,
        },
        {
          id: 'edit',
          label: t('Modifica'),
          icon: 'pencil',
          tone: 'primary',
          hidden: !showEdit,
          onClick: () =>
            openEntityModal ? actionsRef.current.openModal(ActionMode.Edit, row) : onEdit!(row),
        },
        {
          id: 'delete',
          label: t('Elimina'),
          icon: 'cestino',
          tone: 'error',
          hidden: !showDelete,
          onClick: () => actionsRef.current.setDeleteTarget(row),
        },
      ];
      return (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%' }}>
          <TableActions actions={[...configuredActions, ...automaticActions]} />
          {renderRowActionStatus
            ? renderRowActionStatus(row)
            : !hideState && activeRowActionStatus?.(row)}
        </Box>
      );
    },
    [
      onView,
      onEdit,
      onDelete,
      openEntityModal,
      activeRowActionStatus,
      canView,
      canEdit,
      canDelete,
      viewPermission,
      editPermission,
      deletePermission,
      hideState,
      renderRowActionStatus,
      rowActions,
      t,
    ]
  );

  const FullWidthDetailCellRenderer = useCallback(
    (params: ICellRendererParams) => {
      const detailRow = params.data as DetailRow<E> | undefined;
      if (!detailRow?.__isDetailRow || !renderExpandedRow) {
        return null;
      }
      return (
        <Box
          sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}
        >
          {renderExpandedRow(detailRow.__parentData)}
        </Box>
      );
    },
    [renderExpandedRow]
  );

  const ExpandCellRenderer = useCallback((params: ICellRendererParams) => {
    const row = params.data as RowWithId | undefined;
    if (row?.id === undefined) {
      return null;
    }
    const id = row.id;
    const isExpanded = actionsRef.current.expandedRowIds.has(id);
    return (
      <IconButton size="small" onClick={() => actionsRef.current.toggleExpand(id)}>
        {isExpanded ? <Icon name="chevronUp" size={16} /> : <Icon name="chevronDown" size={16} />}
      </IconButton>
    );
  }, []);

  const {
    searchTerm,
    handleSearchChange,
    mPage,
    setMPage,
    mLimit,
    setMLimit,
    mTotalCount,
    handleSortChanged,
    activeStatusFilter,
    handleStatusFilterChange,
    activeStatusFilterOptions,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    handleDeleteConfirm,
    colMenuAnchor,
    setColMenuAnchor,
    toggleableCols,
    handleOpenColMenu,
    handleColVisToggle,
    exportAnchor,
    setExportAnchor,
    exporting,
    runExport,
    showExport,
    colDefs,
    rowData,
    rawData,
    gridApiRef,
    onGridReady,
    handleColumnVisible,
    modalContent,
    openModal,
    colBtnRef,
    isManaged,
    expandedRowIds,
    toggleExpand,
    activeFetching,
  } = useDataTable({
    columns,
    baseColumns,
    data: props.data,
    fetchData: props.fetchData,
    refreshKey: props.refreshKey,
    queryKey: props.queryKey,
    onRowClick,
    onEdit,
    onDelete,
    onView,
    editPermission,
    deletePermission,
    viewPermission,
    statusFilter: props.statusFilter,
    statusFilterOptions: props.statusFilterOptions,
    onStatusFilterChange: props.onStatusFilterChange,
    openEntityModal,
    columnVisibility: props.columnVisibility,
    onColumnVisibilityChange: props.onColumnVisibilityChange,
    renderExpandedRow,
    exportable: props.exportable,
    exportFileName: props.exportFileName,
    hideState,
    onStatusChange,
    title,
    ActionsCellRenderer,
    ExpandCellRenderer,
    toolbarFilters,
    rowActions,
  });

  React.useEffect(() => {
    actionsRef.current = { openModal, setDeleteTarget, toggleExpand, expandedRowIds };
  });

  React.useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      openModal(ActionMode.Create, undefined);
    },
    openEditModal: (item: E) => {
      openModal(ActionMode.Edit, item);
    },
    openReadModal: (item: E) => {
      openModal(ActionMode.Read, item);
    }
  }));

  const userPreferredPageSize = useMemo(getPreferredItemsPerPage, []);
  const [localPageSize, setLocalPageSize] = useState(pageSize ?? userPreferredPageSize);
  const effectivePageSize = localPageSize;
  const selectorCurrentSize = isManaged ? mLimit : effectivePageSize;

  const effectivePageSizeSelector = useMemo(() => {
    const baseOptions = pageSizeSelector ?? [...PAGE_SIZE_OPTIONS];
    if (!baseOptions.includes(selectorCurrentSize)) {
      return [...baseOptions, selectorCurrentSize].sort((a, b) => a - b);
    }
    return baseOptions;
  }, [pageSizeSelector, selectorCurrentSize]);

  const [localPage, setLocalPage] = useState(0);
  const [localTotal, setLocalTotal] = useState(rawData.length);

  const syncLocalPagination = useCallback(() => {
    if (isManaged) return;
    const api = gridApiRef.current;
    setLocalPage(api?.paginationGetCurrentPage() ?? 0);
    setLocalTotal(api?.getDisplayedRowCount() ?? rawData.length);
  }, [gridApiRef, isManaged, rawData.length]);

  useEffect(() => {
    if (isManaged) return;
    setLocalTotal(rawData.length);
    const lastPage = Math.max(0, Math.ceil(rawData.length / effectivePageSize) - 1);
    if (localPage > lastPage) {
      setLocalPage(lastPage);
      gridApiRef.current?.paginationGoToPage(lastPage);
    }
  }, [effectivePageSize, gridApiRef, isManaged, localPage, rawData.length]);

  useEffect(() => {
    if (isManaged) return;
    setLocalPage(0);
    gridApiRef.current?.paginationGoToFirstPage();
  }, [gridApiRef, isManaged, searchTerm]);

  const handlePaginationPageChange = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      if (isManaged) {
        setMPage(newPage);
        return;
      }
      setLocalPage(newPage);
      gridApiRef.current?.paginationGoToPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [gridApiRef, isManaged, setMPage]
  );

  const handlePaginationPageSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newSize = Number.parseInt(event.target.value, 10);
      setMLimit(newSize);
      if (!isManaged) {
        setLocalPageSize(newSize);
        setLocalPage(0);
        gridApiRef.current?.setGridOption('paginationPageSize', newSize);
        gridApiRef.current?.paginationGoToFirstPage();
      }
    },
    [gridApiRef, isManaged, setMLimit]
  );

  const paginationCount = isManaged ? mTotalCount : localTotal;
  const paginationPage = isManaged ? mPage : localPage;
  const paginationLimit = isManaged ? mLimit : effectivePageSize;
  const mobileRows = isManaged
    ? rowData
    : rowData.slice(localPage * effectivePageSize, (localPage + 1) * effectivePageSize);

  return (
    <>
      <Box
        className="table-container"
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 110px)',
        }}
      >
        {title && (
          <PageTitle
            title={title}
            subtitle={subtitle}
            action={
              createLabel && (onCreateClick || openEntityModal) ? (
                <CreateButton
                  variant="contained"
                  onClick={
                    openEntityModal ? () => openModal(ActionMode.Create, undefined) : onCreateClick
                  }
                  className="table-create-btn"
                >
                  {createLabel}
                </CreateButton>
              ) : undefined
            }
          />
        )}
        {!title && subtitle && (
          <Typography variant="body2" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
        )}
        {error && (
          <StatusBanner severity="error" onClose={onErrorClose}>
            {error}
          </StatusBanner>
        )}

        {!hideToolbar && (
          <DataTableToolbar
            onRefresh={onRefresh}
            hideState={hideState}
            activeStatusFilterOptions={activeStatusFilterOptions}
            activeStatusFilter={activeStatusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            onPageReset={() => setMPage(0)}
            toolbarFilters={toolbarFilters}
            extraToolbarActions={extraToolbarActions}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder={searchPlaceholder}
            colBtnRef={colBtnRef}
            onOpenColMenu={handleOpenColMenu}
            colMenuAnchor={colMenuAnchor}
            onColMenuClose={() => setColMenuAnchor(null)}
            toggleableCols={toggleableCols}
            onColVisToggle={handleColVisToggle}
            showExport={showExport}
            exporting={exporting}
            exportAnchor={exportAnchor}
            onExportClick={(event) => setExportAnchor(event.currentTarget)}
            onExportClose={() => setExportAnchor(null)}
            onRunExport={runExport}
            isManaged={isManaged}
          />
        )}

        {isSmall && renderCard ? (
          <Box
            className="table-cards-wrapper"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              flex: 1,
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 250px)'
            }}
          >
            {mobileRows.map((row, idx) => {
              if (isDetailRow(row)) return null;
              return <React.Fragment key={idx}>{renderCard(row)}</React.Fragment>;
            })}
          </Box>
        ) : (
          <Box
            className={`nagma-grid table-grid-wrapper ${resolvedTheme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'}`}
            sx={{
              width: '100%',
              flex: 1,
              minHeight: 0,
              position: 'relative',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x pan-y',
              '& > div': { height: '100%', minWidth: { xs: 480, md: 'auto' } },
              bgcolor: (theme) => theme.palette.mode === 'light' ? 'background.paper' : alpha(theme.palette.common.white, 0.02),
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <AgGridReact
              defaultColDef={DEFAULT_COL_DEF}
              columnDefs={colDefs}
              rowData={rowData}
              loading={isLoading !== undefined ? isLoading : activeFetching}
              onGridReady={onGridReady}
              onRowClicked={
                onRowClick ? (event) => event.data && onRowClick(event.data as E) : undefined
              }
              onSortChanged={isManaged ? handleSortChanged : undefined}
              onColumnVisible={props.onColumnVisibilityChange ? handleColumnVisible : undefined}
              noRowsOverlayComponent={NoRowsOverlay}
              noRowsOverlayComponentParams={{ message: effectiveEmptyMessage }}
              loadingOverlayComponent={LoadingOverlay}
              isFullWidthRow={
                renderExpandedRow
                  ? (params: IsFullWidthRowParams) =>
                      !!(params.rowNode.data as DetailRow<E> | undefined)?.__isDetailRow
                  : undefined
              }
              fullWidthCellRenderer={renderExpandedRow ? FullWidthDetailCellRenderer : undefined}
              getRowId={(params) => {
                const rowItem = params.data as DetailRow<E> | RowWithId;
                if ('__isDetailRow' in rowItem) {
                  return `__detail__${String((rowItem.__parentData as RowWithId)?.id ?? '')}`;
                }
                if (props.keyExtractor) {
                  return String(props.keyExtractor(rowItem as E));
                }
                return String((rowItem as RowWithId).id ?? '');
              }}
              quickFilterText={!isManaged ? searchTerm : undefined}
              pagination={!isManaged}
              paginationPageSize={effectivePageSize}
              paginationPageSizeSelector={effectivePageSizeSelector}
              suppressPaginationPanel
              onPaginationChanged={syncLocalPagination}
              onModelUpdated={syncLocalPagination}
              suppressCellFocus
              rowStyle={{ cursor: onRowClick ? 'pointer' : 'default' }}
              getRowStyle={onGetRowStyle}
            />
          </Box>
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

        {modalContent}

        {footerContent}

        <TablePagination
          component="div"
          count={paginationCount}
          page={paginationPage}
          onPageChange={handlePaginationPageChange}
          rowsPerPage={paginationLimit}
          rowsPerPageOptions={effectivePageSizeSelector}
          onRowsPerPageChange={handlePaginationPageSizeChange}
          labelRowsPerPage={t('Righe per pagina:')}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} di ${count}`}
          getItemAriaLabel={(type) => {
            if (type === 'first') return t('Prima pagina');
            if (type === 'last') return t('Ultima pagina');
            if (type === 'next') return t('Pagina successiva');
            return t('Pagina precedente');
          }}
          className="table-pagination"
          sx={{ mt: footerContent ? 0.5 : 2, flexShrink: 0 }}
        />
      </Box>
    </>
  );
};

DataTableInner.displayName = 'DataTableInner';

const DataTableImpl = forwardRef(DataTableInner);
DataTableImpl.displayName = 'DataTableImpl';

export default DataTableImpl;
