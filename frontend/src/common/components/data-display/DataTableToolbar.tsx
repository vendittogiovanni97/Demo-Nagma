'use client';

import React from 'react';
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Popover,
  Menu,
  MenuItem,
  ListSubheader,
  Tooltip,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Icon from '@/common/components/ui/Icon';
import Badge from '@/common/components/ui/Badge';
import SearchInput from '@/common/components/forms/SearchInput';

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
  onOpenColMenu: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
  const theme = useTheme();
  const effectivePlaceholder = searchPlaceholder ?? 'Cerca...';

  return (
    <Box
      className="table-toolbar"
      sx={{
        mb: 2.5,
        p: 2,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        border: `1px solid ${alpha(theme.palette.common.white, 0.04)}`,
        background: alpha(theme.palette.common.white, 0.01),
      }}
    >
      {onRefresh && (
        <Tooltip title="Aggiorna" arrow>
          <IconButton
            onClick={onRefresh}
            size="small"
            sx={{
              color: 'text.secondary',
              border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
              bgcolor: alpha(theme.palette.common.white, 0.02),
              '&:hover': {
                color: 'primary.main',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <Icon name="refreshCw" size={16} />
          </IconButton>
        </Tooltip>
      )}

      {activeStatusFilterOptions && !hideState && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Badge
            label="Tutti"
            onClick={() => {
              onStatusFilterChange(undefined);
              onPageReset();
            }}
            variant={!activeStatusFilter ? 'primary' : 'default'}
            size="sm"
            sx={{ cursor: 'pointer' }}
          />
          {activeStatusFilterOptions.map((option) => (
            <Badge
              key={option.value}
              label={option.label}
              onClick={() => {
                onStatusFilterChange(option.value);
                onPageReset();
              }}
              variant={activeStatusFilter === option.value ? 'primary' : 'default'}
              size="sm"
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      )}

      {toolbarFilters?.map((filter) => (
        <FormControl key={filter.id} size="small" sx={{ minWidth: filter.minWidth ?? 180 }}>
          <InputLabel id={`dt-filter-${filter.id}-label`} sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{filter.label}</InputLabel>
          <Select
            labelId={`dt-filter-${filter.id}-label`}
            id={`dt-filter-${filter.id}`}
            value={filter.value}
            label={filter.label}
            onChange={(event) => {
              filter.onChange(event.target.value as string);
              onPageReset();
            }}
            sx={{
              color: 'common.white',
              fontSize: '0.875rem',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.common.white, 0.08),
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.common.white, 0.2),
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            {filter.options.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.875rem' }}>
                {option.value === '' ? <em>{option.label}</em> : option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}

      {extraToolbarActions}

      <Box sx={{ width: { xs: '100%', sm: 260 }, ml: 'auto' }}>
        <SearchInput
          placeholder={effectivePlaceholder}
          value={searchTerm}
          onChange={onSearchChange}
        />
      </Box>

      <Tooltip title="Colonne" arrow>
        <IconButton
          ref={colBtnRef}
          size="small"
          onClick={onOpenColMenu}
          sx={{
            color: 'text.secondary',
            border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
            bgcolor: alpha(theme.palette.common.white, 0.02),
            '&:hover': {
              color: 'primary.main',
              borderColor: alpha(theme.palette.primary.main, 0.2),
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          <Icon name="slidersHorizontal" size={16} />
        </IconButton>
      </Tooltip>

      <Popover
        open={!!colMenuAnchor}
        anchorEl={colMenuAnchor}
        onClose={onColMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
              borderRadius: 2,
              p: 2,
              minWidth: 180,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
            }
          }
        }}
      >
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.6875rem' }}>
          Colonne Visibili
        </Typography>
        <Divider sx={{ my: 1, borderColor: alpha(theme.palette.common.white, 0.06) }} />
        {toggleableCols.map((column) => (
          <Box key={column.colId} sx={{ display: 'block' }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={column.visible}
                  onChange={(event) => onColVisToggle(column.colId, event.target.checked)}
                  sx={{
                    color: alpha(theme.palette.common.white, 0.2),
                    '&.Mui-checked': { color: 'primary.main' }
                  }}
                />
              }
              label={<Typography sx={{ fontSize: '0.8125rem', color: 'common.white' }}>{column.label}</Typography>}
            />
          </Box>
        ))}
      </Popover>

      {showExport && (
        <>
          <Tooltip title="Esporta" arrow>
            <span>
              <IconButton
                size="small"
                onClick={onExportClick}
                disabled={exporting}
                sx={{
                  color: 'text.secondary',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                  bgcolor: alpha(theme.palette.common.white, 0.02),
                  '&:hover': {
                    color: 'success.main',
                    borderColor: alpha(theme.palette.success.main, 0.2),
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                  },
                }}
              >
                {exporting ? <CircularProgress size={16} color="success" /> : <Icon name="download" size={16} />}
              </IconButton>
            </span>
          </Tooltip>
          <Menu
            anchorEl={exportAnchor}
            open={!!exportAnchor}
            onClose={onExportClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  bgcolor: alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                  borderRadius: 2,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
                }
              }
            }}
          >
            <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'transparent', color: 'text.secondary', fontWeight: 600, fontSize: '0.6875rem' }}>PAGINA CORRENTE</ListSubheader>
            <MenuItem onClick={() => onRunExport('current', 'csv')} sx={{ fontSize: '0.875rem' }}>Esporta CSV (.csv)</MenuItem>
            <MenuItem onClick={() => onRunExport('current', 'xlsx')} sx={{ fontSize: '0.875rem' }}>Esporta Excel (.xlsx)</MenuItem>
            {isManaged && (
              <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'transparent', color: 'text.secondary', fontWeight: 600, fontSize: '0.6875rem' }}>TUTTI I RISULTATI</ListSubheader>
            )}
            {isManaged && <MenuItem onClick={() => onRunExport('all', 'csv')} sx={{ fontSize: '0.875rem' }}>Esporta CSV (.csv)</MenuItem>}
            {isManaged && (
              <MenuItem onClick={() => onRunExport('all', 'xlsx')} sx={{ fontSize: '0.875rem' }}>Esporta Excel (.xlsx)</MenuItem>
            )}
          </Menu>
        </>
      )}
    </Box>
  );
}
