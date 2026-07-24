"use client";

import SearchInput from '@/common/components/forms/SearchInput';
import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';
import { useBreakpointContext } from '@/common/context/BreakpointContext';
import {
  Box,
  IconButton,
  Stack,
  Typography,
  useTheme as useMuiTheme,
} from '@mui/material';
import Button from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import { ReactNode } from 'react';

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

interface SmartFiltersProps {
  search?: FilterConfig;
  dateRange?: {
    start: FilterConfig;
    end: FilterConfig;
  };
  select?: SelectConfig;
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
  monthPicker,
  alignWithMonthPicker = false,
  submitAction,
  children,
}: SmartFiltersProps) {
  const muiTheme = useMuiTheme();
  const { isXLarge, isLarge, isSmall, isMedium } = useBreakpointContext();

  const isDesktop = isLarge || isXLarge;

  // Responsive sizes - more compact for desktop to fit in one row
  const searchWidth = { xs: '100%', sm: 240, md: isXLarge ? 320 : 260 };
  const dateWidth = { xs: 'calc(50% - 6px)', sm: 150, md: isXLarge ? 165 : 150 };
  const selectWidth = { xs: '100%', sm: 160, md: isXLarge ? 180 : 150 };
  const gap = isXLarge ? 1.5 : 0.75;

  return (
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
      {/* 1. Month Picker or Alignment Spacer */}
      {monthPicker ? (
        <Stack direction="row" useFlexGap sx={{ gap: 0.25, alignItems: 'center', flexShrink: 0 }}>
          <IconButton size="small" onClick={monthPicker.onPrev} sx={{ p: 0.25 }}>
            <Icon name="chevronLeft" size={14} />
          </IconButton>
          <Typography
            sx={{
              fontSize: isXLarge ? '1.375rem' : isLarge ? '1.125rem' : '0.875rem',
              lineHeight: 1.2,
              fontWeight: 800,
              color: muiTheme.palette.primary.main,
              letterSpacing: isXLarge ? '-0.02em' : 0,
              textTransform: 'capitalize',
              minWidth: { xs: 80, sm: 100, md: isXLarge ? 180 : isLarge ? 150 : 100 },
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

      {/* 2. Search Input */}
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

      {/* 3. Date Range */}
      {dateRange && (
        <Stack direction="row" useFlexGap sx={{ gap: 0.75, flexShrink: 0 }}>
          <FormInput
            label={dateRange.start.label || "Dal"}
            type="date"
            value={dateRange.start.value}
            onChange={dateRange.start.onChange}
            size="sm"
            hideLabel
            sx={{ width: dateWidth }}
          />
          <FormInput
            label={dateRange.end.label || "Al"}
            type="date"
            value={dateRange.end.value}
            onChange={dateRange.end.onChange}
            size="sm"
            hideLabel
            sx={{ width: dateWidth }}
          />
        </Stack>
      )}

      {/* 4. Select Dropdown */}
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

      {/* 5. Extra Actions (Children) */}
      {children}

      {/* 6. Submit Action */}
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
    </Stack>
  );
}
