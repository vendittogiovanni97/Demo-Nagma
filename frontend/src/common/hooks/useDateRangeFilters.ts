'use client';

import { useCallback, useState } from 'react';

export function useDateRangeFilters() {
  const [startDate, setStartDateState] = useState('');
  const [endDate, setEndDateState] = useState('');

  const setStartDate = useCallback((value: string) => setStartDateState(value), []);
  const setEndDate = useCallback((value: string) => setEndDateState(value), []);

  const resetDateRange = useCallback(() => {
    setStartDateState('');
    setEndDateState('');
  }, []);

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    resetDateRange,
  };
}
