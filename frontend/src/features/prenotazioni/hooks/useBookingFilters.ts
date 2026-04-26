"use client";

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { DEBOUNCE_SEARCH_DELAY } from '@/config/env';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { Booking } from '@/types/booking';

function monthKey(date: Date) {
  return format(date, 'yyyy-MM');
}

export function useBookingFilters() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCancelled, setShowCancelled] = useState(false);

  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_DELAY);

  const month = monthKey(currentMonth);
  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: it });

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const resetDateRange = () => {
    setStartDate('');
    setEndDate('');
  };

  const filterBookings = useMemo(() => (bookings: Booking[]): Booking[] => {
    const withCancelled = bookings.filter(b => {
      if (!showCancelled && b.status === 'CANCELLED') return false;
      return true;
    });

    let result = withCancelled;

    if (startDate) {
      const from = new Date(startDate);
      result = result.filter(b => new Date(b.date) >= from);
    }

    if (endDate) {
      const to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
      result = result.filter(b => new Date(b.date) <= to);
    }

    if (!debouncedSearch.trim()) return result;

    const q = debouncedSearch.toLowerCase();
    return result.filter(b => {
      const clienteName = b.customer
        ? `${b.customer.firstName} ${b.customer.lastName}`.toLowerCase()
        : '';
      const phone = b.customer?.phone?.toLowerCase() ?? '';
      const artist = b.artist?.name?.toLowerCase() ?? '';
      return clienteName.includes(q) || phone.includes(q) || artist.includes(q);
    });
  }, [debouncedSearch, showCancelled, startDate, endDate]);

  return {
    month,
    monthLabel,
    currentMonth,
    search,
    startDate,
    endDate,
    showCancelled,
    debouncedSearch,
    setSearch,
    setStartDate,
    setEndDate,
    setShowCancelled,
    resetDateRange,
    prevMonth,
    nextMonth,
    filterBookings,
  };
}
