'use client';

import type { ICellRendererParams, IsFullWidthRowParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { forwardRef, useCallback, useMemo, useRef } from 'react';

import Icon from '@/common/components/ui/Icon';
import Alert from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, alpha } from '@mui/material/styles';
import { usePermission } from '@/common/providers/AuthProvider';
import { useThemeMode } from '@/common/providers/ThemeModeProvider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useTranslation } from 'react-i18next';
import { DetailRow, RowWithId, useDataTable } from '../../hooks/useDataTable';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ActionMode, type BaseColumnKey, type DataTableProps } from './DataTable';
import { DataTableToolbar } from './DataTableToolbar';
import { LoadingOverlay, NoRowsOverlay } from './gridTheme';

const DEFAULT_BASE_COLUMNS: BaseColumnKey[] = ['id'];

const DEFAULT_COL_DEF = {
  flex: 1,
  minWidth: 100,
  cellStyle: { display: 'flex', alignItems: 'center', height: '100%' },
} as const;

// PageTitle local wrapper
const PageTitle = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
    </Box>
    {action}
  </Box>
);

// CreateButton local wrapper
const CreateButton = ({ children, onClick, variant, className }: any) => (
  <Button variant={variant} onClick={onClick} className={className} startIcon={<Icon name="piu" size={16} />}>
    {children}
  </Button>
);

// StatusBanner local wrapper
const StatusBanner = ({ children, severity, onClose }: any) => (
  <Alert severity={severity} onClose={onClose} sx={{ mb: 3 }}>
    {children}
  </Alert>
);

// StatusToggleButton local wrapper
const StatusToggleButton = ({ currentStatus, onClick }: { currentStatus: string; onClick: () => void }) => (
  <Switch
    checked={currentStatus === 'ATTIVO' || currentStatus === 'ACTIVE'}
    onChange={onClick}
    size="small"
  />
);

const DataTableInner = <E,>(props: DataTableProps<E>, ref: React.Ref<any>) => {
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
    getRowStyle,
    actions,
    hideToolbar = true,
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
    (params: any) => {
      if (getRowStyle && params.data && !params.data.__isDetailRow) {
        return getRowStyle(params.data) as any;
      }
      return undefined;
    },
    [getRowStyle]
  );

  const pageSizeSelector = useMemo(() => {
    const defaultSelector = [10, 20, 50, 100];
    if (pageSize && !defaultSelector.includes(pageSize)) {
      return [pageSize, ...defaultSelector].sort((a, b) => a - b);
    }
    return defaultSelector;
  }, [pageSize]);

  const canEdit = usePermission(editPermission ?? '');
  const canDelete = usePermission(deletePermission ?? '');
  const canView = usePermission(viewPermission ?? '');

  const activeRowActionStatus = useMemo(() => {
    if (renderRowActionStatus) {
      return renderRowActionStatus;
    }
    if (onStatusChange) {
      // Callback di render per riga (non un componente): il display-name non è applicabile.
      // eslint-disable-next-line react/display-name
      return (row: E) => (
        <StatusToggleButton
          currentStatus={(row as unknown as { status: string }).status}
          onClick={() => onStatusChange(row)}
        />
      );
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
      return (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%' }}>
          {actions && actions(row)}
          {showView && (
            <IconButton
              size="small"
              color="primary"
              onClick={() =>
                openEntityModal ? actionsRef.current.openModal(ActionMode.Read, row) : onView!(row)
              }
            >
              <Icon name="vedi" size={16} />
            </IconButton>
          )}
          {showEdit && (
            <IconButton
              size="small"
              onClick={() =>
                openEntityModal ? actionsRef.current.openModal(ActionMode.Edit, row) : onEdit!(row)
              }
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Icon name="pencil" size={17} color={theme.palette.primary.main} />
            </IconButton>
          )}
          {showDelete && (
            <IconButton
              size="small"
              color="error"
              onClick={() => actionsRef.current.setDeleteTarget(row)}
            >
              <Icon name="cestino" size={16} />
            </IconButton>
          )}
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
      actions,
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
    actions,
  });

  React.useEffect(() => {
    actionsRef.current = { openModal, setDeleteTarget, toggleExpand, expandedRowIds };
  });

  React.useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      openModal(ActionMode.Create, undefined);
    },
    openEditModal: (item: any) => {
      openModal(ActionMode.Edit, item);
    },
    openReadModal: (item: any) => {
      openModal(ActionMode.Read, item);
    }
  }));

  return (
    <>
      <Box
        ref={ref}
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
            {rowData.map((row: any, idx: number) => {
              if (row.__isDetailRow) return null;
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
              paginationPageSize={pageSize ?? 10}
              paginationPageSizeSelector={pageSizeSelector}
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

        {isManaged && (
          <TablePagination
            component="div"
            count={mTotalCount}
            page={mPage}
            onPageChange={(event, newPage) => setMPage(newPage)}
            rowsPerPage={mLimit}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onRowsPerPageChange={(event) => {
              setMLimit(parseInt(event.target.value, 10));
              setMPage(0);
            }}
            labelRowsPerPage={t('Righe per pagina:')}
            className="table-pagination"
            sx={{ mt: 2 }}
          />
        )}
      </Box>
    </>
  );
};

DataTableInner.displayName = 'DataTableInner';

const DataTableImpl = forwardRef(DataTableInner);
DataTableImpl.displayName = 'DataTableImpl';

export default DataTableImpl;
