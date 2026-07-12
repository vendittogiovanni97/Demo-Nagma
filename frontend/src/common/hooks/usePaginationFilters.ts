"use client";

import { useState, useCallback } from 'react';

export function usePaginationFilters(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = useCallback((value: string) => {
    setStartDate(value);
    setPage(1);
  }, []);

  const handleEndDateChange = useCallback((value: string) => {
    setEndDate(value);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setPage(initialPage);
    setStartDate('');
    setEndDate('');
  }, [initialPage]);

  return {
    page,
    setPage,
    startDate,
    setStartDate: handleStartDateChange,
    endDate,
    setEndDate: handleEndDateChange,
    resetFilters,
  };
}
