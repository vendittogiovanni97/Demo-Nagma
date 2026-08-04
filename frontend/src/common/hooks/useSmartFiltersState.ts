"use client";

import { useState } from 'react';
import type { SmartFiltersProps } from '@/common/components/common/SmartFilters';
import { useDateRangeFilters } from '@/common/hooks/useDateRangeFilters';
import { useMonthNavigation } from '@/common/hooks/useMonthNavigation';
import { useDebouncedValue } from '@/common/hooks/useDebouncedValue';
import { DEBOUNCE_SEARCH_DELAY } from '@/common/config/env';

export interface UseSmartFiltersOptions {
  defaultSearch?: string;
  searchPlaceholder?: string;
  enableMonthPicker?: boolean;
  enableDateRange?: boolean;
  alignWithMonthPicker?: boolean;
  select?: SmartFiltersProps['select'];
  submitAction?: SmartFiltersProps['submitAction'];
}

export function useSmartFiltersState(options: UseSmartFiltersOptions = {}) {
  const {
    defaultSearch = '',
    searchPlaceholder = 'Cerca...',
    enableMonthPicker = false,
    enableDateRange = false,
    alignWithMonthPicker = false,
    select,
    submitAction,
  } = options;

  const monthNav = useMonthNavigation();
  const dateRange = useDateRangeFilters();
  const [search, setSearch] = useState(defaultSearch);
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_DELAY);

  const smartFiltersProps: SmartFiltersProps = {
    alignWithMonthPicker,
    select,
    submitAction,
    search: {
      value: search,
      onChange: setSearch,
      placeholder: searchPlaceholder,
    },
    ...(enableMonthPicker && {
      monthPicker: {
        label: monthNav.monthLabel,
        onPrev: monthNav.prevMonth,
        onNext: monthNav.nextMonth,
      },
    }),
    ...(enableDateRange && {
      dateRange: {
        start: { value: dateRange.startDate, onChange: dateRange.setStartDate },
        end: { value: dateRange.endDate, onChange: dateRange.setEndDate },
      },
    }),
  };

  return {
    search,
    setSearch,
    debouncedSearch,
    ...dateRange,
    ...monthNav,
    smartFiltersProps,
  };
}
