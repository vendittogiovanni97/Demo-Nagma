'use client';

import useSWR from 'swr';
import { useState, useMemo, useCallback } from 'react';
import { artistRevenueApi } from '../api/artistRevenue.api';
import type { ArtistRevenueFilterParams } from '../model/artistRevenue.types';
import { format, addMonths, subMonths, addDays, subDays, addYears, subYears } from 'date-fns';

export function useArtistRevenue() {
  const [mode, setMode] = useState<'day' | 'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const filterParams: ArtistRevenueFilterParams = useMemo(() => {
    if (mode === 'day') {
      return {
        mode: 'day',
        day: format(currentDate, 'yyyy-MM-dd'),
      };
    }
    if (mode === 'year') {
      return {
        mode: 'year',
        year: currentDate.getFullYear(),
      };
    }
    return {
      mode: 'month',
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
    };
  }, [mode, currentDate]);

  const swrKey = useMemo(() => {
    return `artist-revenue-${mode}-${filterParams.day ?? ''}-${filterParams.year ?? ''}-${filterParams.month ?? ''}`;
  }, [mode, filterParams]);

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => artistRevenueApi.getArtistRevenue(filterParams),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => {
      if (mode === 'day') return subDays(prev, 1);
      if (mode === 'year') return subYears(prev, 1);
      return subMonths(prev, 1);
    });
  }, [mode]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      if (mode === 'day') return addDays(prev, 1);
      if (mode === 'year') return addYears(prev, 1);
      return addMonths(prev, 1);
    });
  }, [mode]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return {
    mode,
    setMode,
    currentDate,
    setCurrentDate,
    handlePrev,
    handleNext,
    handleToday,
    artists: data?.artists ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}
