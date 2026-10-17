"use client";

import SearchInput from '@/common/components/forms/SearchInput';
import DatePicker from '@/common/components/forms/DatePicker';
import FormSelect from '@/common/components/forms/FormSelect';
import { useBreakpointContext } from '@/common/context/BreakpointContext';
import {
  Badge,
  Box,
  Collapse,
  IconButton,
  Stack,
  Typography,
  useTheme as useMuiTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Button from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import { useState, type ReactNode } from 'react';

interface FilterConfig {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

interface MonthPickerConfig {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}

interface SelectConfig extends FilterConfig {
  options: { label: string; value: string }[];
}

interface SegmentedConfig {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

export interface SmartFiltersProps {
  search?: FilterConfig;
  dateRange?: {
    start: FilterConfig;
    end: FilterConfig;
  };
  select?: SelectConfig;
  segmented?: SegmentedConfig;
  monthPicker?: MonthPickerConfig;
  /** If true and monthPicker is missing, adds a spacer to align with pages that have it */
  alignWithMonthPicker?: boolean;
  /** Action button like "Apply" or "Filter" */
  submitAction?: { label: string; onClick: () => void };
  /** Extra content */
  children?: ReactNode;
}

export default function SmartFilters({
  search,
  dateRange,
  select,
  segmented,
  monthPicker,
  alignWithMonthPicker = false,
  submitAction,
  children,
}: SmartFiltersProps) {
  const muiTheme = useMuiTheme();
  const { isXLarge, isLarge } = useBreakpointContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const isDesktop = isXLarge;

  // Count active secondary filters (dateRange, select)
  const activeSecondaryCount =
    (dateRange?.start.value ? 1 : 0) +
    (dateRange?.end.value ? 1 : 0) +
    (select?.value && select.value !== 'ALL' && select.value !== '' ? 1 : 0);

  const hasSecondaryFilters = Boolean(dateRange || select || children);

  // Responsive sizes
  const searchWidth = { xs: '100%', sm: 220, md: isXLarge ? 300 : 240 };
  const dateWidth = { xs: 'calc(50% - 6px)', sm: 150, md: isXLarge ? 165 : 150 };
  const selectWidth = { xs: '100%', sm: 160, md: isXLarge ? 180 : 150 };
  const gap = isXLarge ? 1.5 : 0.75;

  return (
    <Stack direction="column" sx={{ width: '100%', minWidth: 0 }}>
      {/* Primary Row */}
      <Stack
        direction="row"
        useFlexGap
        sx={{
          gap,
          alignItems: 'center',
          flexWrap: isDesktop ? 'nowrap' : 'wrap',
          minWidth: 0,
        }}
      >
        {/* Month Picker */}
        {monthPicker ? (
          <Stack direction="row" useFlexGap sx={{ gap: 0.25, alignItems: 'center', flexShrink: 0 }}>
            <IconButton size="small" onClick={monthPicker.onPrev} sx={{ p: 0.25 }}>
              <Icon name="chevronLeft" size={14} />
            </IconButton>
            <Typography
              sx={{
                fontSize: isXLarge ? '1.25rem' : isLarge ? '1.125rem' : '0.875rem',
                lineHeight: 1.2,
                fontWeight: 800,
                color: muiTheme.palette.primary.main,
                letterSpacing: isXLarge ? '-0.02em' : 0,
                textTransform: 'capitalize',
                minWidth: { xs: 80, sm: 100, md: isXLarge ? 160 : isLarge ? 140 : 100 },
                textAlign: 'center',
              }}
            >
              {monthPicker.label}
            </Typography>
            <IconButton size="small" onClick={monthPicker.onNext} sx={{ p: 0.25 }}>
              <Icon name="chevronRight" size={14} />
            </IconButton>
          </Stack>
        ) : alignWithMonthPicker ? (
          <Box sx={{ width: isXLarge ? 140 : 120, display: { xs: 'none', lg: 'block' } }} />
        ) : null}

        {/* Search Input */}
        {search && (
          <Box sx={{ width: searchWidth, flexShrink: 1, minWidth: { xs: '100%', sm: 120 } }}>
            <SearchInput
              value={search.value}
              onChange={search.onChange}
              placeholder={search.placeholder || "Cerca..."}
              sx={{
                width: '100%',
                '& .MuiInputBase-root': { height: 36 }
              }}
            />
          </Box>
        )}

        {/* Segmented Control Filter (e.g., Tutti / Entrate / Uscite) */}
        {segmented && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 0.35,
              borderRadius: 2.5,
              bgcolor: alpha(muiTheme.palette.background.paper, 0.92),
              border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.15)}`,
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            {segmented.options.map((opt) => {
              const isActive = opt.value === segmented.value;
              return (
                <Button
                  key={opt.value}
                  variant={isActive ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => segmented.onChange(opt.value)}
                  sx={{
                    px: 1.5,
                    height: 28,
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 700 : 500,
                    borderRadius: 2,
                    ...(isActive && {
                      boxShadow: `0 0 12px ${alpha(muiTheme.palette.primary.main, 0.4)}`,
                    }),
                  }}
                >
                  {opt.label}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Desktop View: Render secondary filters inline */}
        {isDesktop && (
          <>
            {dateRange && (
              <Stack direction="row" useFlexGap sx={{ gap: 0.75, flexShrink: 0 }}>
                <DatePicker
                  label={dateRange.start.label || "Dal"}
                  value={dateRange.start.value}
                  onChange={dateRange.start.onChange}
                  size="sm"
                  hideLabel
                  placeholder="Dal"
                  sx={{ width: dateWidth }}
                />
                <DatePicker
                  label={dateRange.end.label || "Al"}
                  value={dateRange.end.value}
                  onChange={dateRange.end.onChange}
                  size="sm"
                  hideLabel
                  placeholder="Al"
                  sx={{ width: dateWidth }}
                />
              </Stack>
            )}

            {select && (
              <Box sx={{ width: selectWidth, flexShrink: 1, minWidth: { xs: '100%', sm: 100 } }}>
                <FormSelect
                  label={select.label}
                  value={select.value}
                  onChange={select.onChange}
                  options={select.options}
                  placeholder={select.placeholder}
                  hideLabel
                  sx={{ '& .MuiInputBase-root': { height: 36 } }}
                />
              </Box>
            )}

            {children}

            {submitAction && (
              <Button
                variant="primary"
                size="sm"
                onClick={submitAction.onClick}
                sx={{ px: 1.5, height: 36, fontSize: '0.75rem' }}
              >
                {submitAction.label}
              </Button>
            )}
          </>
        )}

        {/* Mobile/Tablet View: Toggle button for secondary filters */}
        {!isDesktop && hasSecondaryFilters && (
          <Badge badgeContent={activeSecondaryCount} color="primary">
            <Button
              variant={isExpanded ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsExpanded((prev) => !prev)}
              icon={<Icon name="slidersHorizontal" size={14} />}
              sx={{ height: 36, px: 1.5, fontSize: '0.75rem', fontWeight: 600 }}
            >
              Filtri
            </Button>
          </Badge>
        )}
      </Stack>

      {/* Mobile/Tablet View: Collapsible Secondary Filters */}
      {!isDesktop && hasSecondaryFilters && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box
            sx={{
              mt: 1.5,
              p: 2,
              borderRadius: 2.5,
              border: `1px solid ${alpha(muiTheme.palette.divider, 0.15)}`,
              backgroundColor: alpha(muiTheme.palette.background.paper, 0.92),
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            {dateRange && (
              <Stack direction="row" useFlexGap sx={{ gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                <DatePicker
                  label={dateRange.start.label || "Dal"}
                  value={dateRange.start.value}
                  onChange={dateRange.start.onChange}
                  size="sm"
                  placeholder="Dal"
                  sx={{ flex: 1, minWidth: 130 }}
                />
                <DatePicker
                  label={dateRange.end.label || "Al"}
                  value={dateRange.end.value}
                  onChange={dateRange.end.onChange}
                  size="sm"
                  placeholder="Al"
                  sx={{ flex: 1, minWidth: 130 }}
                />
              </Stack>
            )}

            {select && (
              <Box sx={{ width: { xs: '100%', sm: 180 } }}>
                <FormSelect
                  label={select.label}
                  value={select.value}
                  onChange={select.onChange}
                  options={select.options}
                  placeholder={select.placeholder}
                  sx={{ '& .MuiInputBase-root': { height: 36 } }}
                />
              </Box>
            )}

            {children}

            {submitAction && (
              <Button
                variant="primary"
                size="sm"
                onClick={submitAction.onClick}
                sx={{ px: 2, height: 36, fontSize: '0.75rem' }}
              >
                {submitAction.label}
              </Button>
            )}
          </Box>
        </Collapse>
      )}
    </Stack>
  );
}
