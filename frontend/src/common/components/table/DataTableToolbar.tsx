'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import SearchBar from '@/common/components/ui/SearchBar';
import Icon from '@/common/components/ui/Icon';
import Chip from '@/common/components/ui/Chip';
import type { ToolbarFilter, FilterChip } from './DataTable';

interface DataTableToolbarProps {
  onRefresh?: () => void;
  hideState: boolean;
  activeStatusFilterOptions?: FilterChip[];
  activeStatusFilter: string | undefined;
  onStatusFilterChange: (value: string | undefined) => void;
  onPageReset: () => void;
  toolbarFilters?: ToolbarFilter[];
  extraToolbarActions?: React.ReactNode;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  colBtnRef: React.RefObject<HTMLButtonElement | null>;
  onOpenColMenu: () => void;
  colMenuAnchor: HTMLButtonElement | null;
  onColMenuClose: () => void;
  toggleableCols: { colId: string; label: string; visible: boolean }[];
  onColVisToggle: (colId: string, visible: boolean) => void;
  showExport: boolean;
  exporting: boolean;
  exportAnchor: HTMLButtonElement | null;
  onExportClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onExportClose: () => void;
  onRunExport: (scope: 'current' | 'all', format: 'csv' | 'xlsx') => void;
  isManaged: boolean;
}

export function DataTableToolbar({
  onRefresh,
  hideState,
  activeStatusFilterOptions,
  activeStatusFilter,
  onStatusFilterChange,
  onPageReset,
  toolbarFilters,
  extraToolbarActions,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  colBtnRef,
  onOpenColMenu,
  colMenuAnchor,
  onColMenuClose,
  toggleableCols,
  onColVisToggle,
  showExport,
  exporting,
  exportAnchor,
  onExportClick,
  onExportClose,
  onRunExport,
  isManaged,
}: DataTableToolbarProps) {
  const { t } = useTranslation();
  const effectivePlaceholder = searchPlaceholder ?? t('Cerca...');

  return (
    <Box
      className="table-toolbar"
      sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
    >
      {onRefresh && (
        <Tooltip title={t('Aggiorna')} arrow>
          <IconButton onClick={onRefresh} className="table-refresh-btn" size="small">
            <Icon name="refresh" />
          </IconButton>
        </Tooltip>
      )}

      {activeStatusFilterOptions && !hideState && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={t('Tutti')}
            onClick={() => {
              onStatusFilterChange(undefined);
              onPageReset();
            }}
            size="small"
            className={`table-chip ${!activeStatusFilter ? 'active' : ''}`}
          />
          {activeStatusFilterOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => {
                onStatusFilterChange(option.value);
                onPageReset();
              }}
              size="small"
              className={`table-chip ${activeStatusFilter === option.value ? 'active' : ''}`}
            />
          ))}
        </Box>
      )}

      {toolbarFilters?.map((filter) => (
        <FormControl key={filter.id} size="small" sx={{ minWidth: filter.minWidth ?? 200 }}>
          <InputLabel id={`dt-filter-${filter.id}-label`}>{filter.label}</InputLabel>
          <Select
            labelId={`dt-filter-${filter.id}-label`}
            id={`dt-filter-${filter.id}`}
            value={filter.value}
            label={filter.label}
            onChange={(event) => filter.onChange(event.target.value as string)}
          >
            {filter.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value === '' ? <em>{option.label}</em> : option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}

      {extraToolbarActions}

      <Box sx={{ width: { xs: '100%', sm: 300 }, ml: 'auto' }}>
        <SearchBar
          placeholder={effectivePlaceholder}
          value={searchTerm}
          onChange={onSearchChange}
          fullWidth
        />
      </Box>

      <Tooltip title={t('Colonne')} arrow>
        <IconButton ref={colBtnRef} size="small" onClick={onOpenColMenu} className="table-icon-btn">
          <Icon name="colonne" />
        </IconButton>
      </Tooltip>

      <Popover
        open={!!colMenuAnchor}
        anchorEl={colMenuAnchor}
        onClose={onColMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { className: 'table-popover' } }}
      >
        <Box sx={{ p: 2, minWidth: 180 }}>
          <Typography variant="overline" color="text.secondary">
            {t('Colonne')}
          </Typography>
          <Divider sx={{ my: 1 }} />
          {toggleableCols.map((column) => (
            <Box key={column.colId} sx={{ display: 'block' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={column.visible}
                    onChange={(event) => onColVisToggle(column.colId, event.target.checked)}
                  />
                }
                label={<Typography variant="body2">{column.label}</Typography>}
              />
            </Box>
          ))}
        </Box>
      </Popover>

      {showExport && (
        <>
          <Tooltip title={t('Esporta')} arrow>
            <span>
              <IconButton
                size="small"
                onClick={onExportClick}
                disabled={exporting}
                className={`table-export-btn ${exporting ? 'exporting' : ''}`}
              >
                {exporting ? <CircularProgress size={20} /> : <Icon name="esporta" />}
              </IconButton>
            </span>
          </Tooltip>
          <Menu
            anchorEl={exportAnchor}
            open={!!exportAnchor}
            onClose={onExportClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <ListSubheader sx={{ lineHeight: '32px' }}>{t('Pagina corrente')}</ListSubheader>
            <MenuItem onClick={() => onRunExport('current', 'csv')}>CSV (.csv)</MenuItem>
            <MenuItem onClick={() => onRunExport('current', 'xlsx')}>Excel (.xlsx)</MenuItem>
            {isManaged && (
              <ListSubheader sx={{ lineHeight: '32px' }}>{t('Tutti i risultati')}</ListSubheader>
            )}
            {isManaged && <MenuItem onClick={() => onRunExport('all', 'csv')}>CSV (.csv)</MenuItem>}
            {isManaged && (
              <MenuItem onClick={() => onRunExport('all', 'xlsx')}>Excel (.xlsx)</MenuItem>
            )}
          </Menu>
        </>
      )}
    </Box>
  );
}
