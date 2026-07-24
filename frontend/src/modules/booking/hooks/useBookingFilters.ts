"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';
import { DEBOUNCE_SEARCH_DELAY } from '@/common/config/env';
import { useDebouncedValue } from '@/common/hooks/useDebouncedValue';
import type { BookingStatus } from '@/modules/booking/model/booking.types';

function monthKey(date: Date) {
  return format(date, 'yyyy-MM');
}

export function useBookingFilters() {
  const searchParams = useSearchParams();
  const urlStartDate = searchParams.get('startDate') ?? '';
  const urlEndDate = searchParams.get('endDate') ?? '';

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState(urlStartDate);
  const [endDate, setEndDate] = useState(urlEndDate);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // 'desc' = più recente per primo

  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_DELAY);

  const month = monthKey(currentMonth);
  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: it });

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const resetDateRange = () => {
    setStartDate('');
    setEndDate('');
  };

  const setToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    const today = format(now, 'yyyy-MM-dd');
    setStartDate(today);
    setEndDate(today);
  };

  return {
    month,
    monthLabel,
    currentMonth,
    search,
    startDate,
    endDate,
    statusFilter,
    sortOrder,
    debouncedSearch,
    setSearch,
    setStartDate,
    setEndDate,
    setStatusFilter,
    setSortOrder,
    resetDateRange,
    setToday,
    prevMonth,
    nextMonth,
  };
}
