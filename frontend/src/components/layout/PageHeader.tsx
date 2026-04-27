"use client";

import type { SxProps, Theme } from '@mui/material';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import PermissionGate from '@/components/auth/PermissionGate';
import SearchInput from '@/components/forms/SearchInput';
import Button from '@/components/ui/Button';

type FilterValue = string | number;

interface FilterOption {
  label: string;
  value: FilterValue;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;

  // === SEARCH ===
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  searchMaxWidth?: number | string;

  // === DATE RANGE ===
  showDateRange?: boolean;
  startDate?: string;
  endDate?: string;
  startDateLabel?: string;
  endDateLabel?: string;
  onStartDateChange?: (value: string) => void;
  onEndDateChange?: (value: string) => void;
  onResetDates?: () => void;

  // === FILTER DROPDOWN ===
  showFilter?: boolean;
  filterValue?: FilterValue;
  filterOptions?: FilterOption[];
  filterPlaceholder?: string;
  filterMinWidth?: number;
  onFilterChange?: (value: FilterValue) => void;

  // === APPLY BUTTON (commit filtri) ===
  showApplyButton?: boolean;
  applyButtonLabel?: string;
  onApply?: () => void;

  // === PRIMARY BUTTON ===
  showButton?: boolean;
  buttonLabel?: string;
  buttonIcon?: ReactNode;
  buttonRequiresAdmin?: boolean;
  buttonDisabled?: boolean;
  onButtonClick?: () => void;

  // === SECONDARY BUTTON ===
  showSecondaryButton?: boolean;
  secondaryButtonLabel?: string;
  secondaryButtonIcon?: ReactNode;
  secondaryButtonRequiresAdmin?: boolean;
  onSecondaryButtonClick?: () => void;

  // === ESCAPE HATCHES ===
  extraActions?: ReactNode;
  customFilters?: ReactNode;
  children?: ReactNode;

  titleSx?: SxProps<Theme>;
}

export default function PageHeader({
  title,
  subtitle,

  showSearch = false,
  searchValue = '',
  searchPlaceholder = 'Cerca...',
  onSearchChange,
  searchMaxWidth = 320,

  showDateRange = false,
  startDate = '',
  endDate = '',
  startDateLabel = 'Dal',
  endDateLabel = 'Al',
  onStartDateChange,
  onEndDateChange,
  onResetDates,

  showFilter = false,
  filterValue = '',
  filterOptions = [],
  filterPlaceholder = 'Tutti',
  filterMinWidth = 160,
  onFilterChange,

  showApplyButton = false,
  applyButtonLabel = 'Filtra',
  onApply,

  showButton = false,
  buttonLabel,
  buttonIcon,
  buttonRequiresAdmin = false,
  buttonDisabled = false,
  onButtonClick,

  showSecondaryButton = false,
  secondaryButtonLabel,
  secondaryButtonIcon,
  secondaryButtonRequiresAdmin = false,
  onSecondaryButtonClick,

  extraActions,
  customFilters,
  children,
  titleSx,
}: PageHeaderProps) {
  const theme = useTheme();

  const hasDateValues = Boolean(startDate || endDate);
  const showResetDates = showDateRange && hasDateValues && Boolean(onResetDates);

  const dateFieldSx = {
    width: { xs: '100%', sm: 150 },
    flexShrink: 0,
  };

  const primaryButtonNode = showButton && buttonLabel ? (
    <Button
      variant="primary"
      icon={buttonIcon}
      onClick={onButtonClick}
      disabled={buttonDisabled}
    >
      {buttonLabel}
    </Button>
  ) : null;

  const secondaryButtonNode = showSecondaryButton && secondaryButtonLabel ? (
    <Button
      variant="secondary"
      icon={secondaryButtonIcon}
      onClick={onSecondaryButtonClick}
      size="sm"
    >
      {secondaryButtonLabel}
    </Button>
  ) : null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 1.5, md: 2 },
        width: '100%',
        minWidth: 0,
      }}
    >
      {/* TITLE BLOCK — sempre sopra in mobile, a sinistra in desktop */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 0.25, sm: 1.5 },
          minWidth: 0,
          flexShrink: 0,
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontSize: { xs: '1.4rem', sm: '1.5rem', md: '1.6rem' },
            fontWeight: 700,
            color: theme.palette.primary.main,
            fontFamily: 'Outfit, sans-serif',
            lineHeight: 1.1,
            ...titleSx,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8125rem',
              color: theme.palette.text.secondary,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* CONTROLS BLOCK — sotto in mobile (full width, wrap), a destra in desktop */}
      <Stack
        direction="row"
        useFlexGap
        sx={{
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
          width: { xs: '100%', md: 'auto' },
          justifyContent: { xs: 'flex-start', md: 'flex-end' },
          minWidth: 0,
        }}
      >
        {customFilters}
        {children}

        {showSearch && (
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 240px' }, maxWidth: { sm: searchMaxWidth }, minWidth: 0 }}>
            <SearchInput
              value={searchValue}
              onChange={onSearchChange ?? (() => {})}
              placeholder={searchPlaceholder}
            />
          </Box>
        )}

        {showDateRange && (
          <Stack
            direction="row"
            useFlexGap
            sx={{
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <TextField
              label={startDateLabel}
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange?.(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={dateFieldSx}
            />
            <TextField
              label={endDateLabel}
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange?.(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={dateFieldSx}
            />
            {showResetDates && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetDates}
                icon={<X size={14} />}
                aria-label="Reset date"
                sx={{ fontSize: '0.75rem' }}
              >
                Reset
              </Button>
            )}
          </Stack>
        )}

        {showFilter && (
          <FormControl size="small" sx={{ minWidth: filterMinWidth, width: { xs: '100%', sm: 'auto' } }}>
            <Select
              value={filterValue}
              onChange={(e) => onFilterChange?.(e.target.value as FilterValue)}
              displayEmpty
            >
              <MenuItem value="">{filterPlaceholder}</MenuItem>
              {filterOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {showApplyButton && (
          <Button variant="primary" size="sm" onClick={onApply}>
            {applyButtonLabel}
          </Button>
        )}

        {extraActions}

        {secondaryButtonNode && (
          secondaryButtonRequiresAdmin
            ? <PermissionGate requireAdmin>{secondaryButtonNode}</PermissionGate>
            : secondaryButtonNode
        )}

        {primaryButtonNode && (
          buttonRequiresAdmin
            ? <PermissionGate requireAdmin>{primaryButtonNode}</PermissionGate>
            : primaryButtonNode
        )}
      </Stack>
    </Box>
  );
}
