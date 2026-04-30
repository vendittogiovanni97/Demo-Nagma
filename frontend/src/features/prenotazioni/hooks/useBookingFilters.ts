"use client";

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';
import { DEBOUNCE_SEARCH_DELAY } from '@/config/env';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { Booking, BookingStatus } from '@/types/booking';

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

  const filterBookings = useMemo(() => (bookings: Booking[]): Booking[] => {
    let result = bookings;

    // Filtra per stato
    if (statusFilter !== 'ALL') {
      result = result.filter(b => b.status === statusFilter);
    }

    if (startDate) {
      const from = new Date(startDate);
      result = result.filter(b => new Date(b.date) >= from);
    }

    if (endDate) {
      const to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
      result = result.filter(b => new Date(b.date) <= to);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(b => {
        const clienteName = b.customer
          ? `${b.customer.firstName} ${b.customer.lastName}`.toLowerCase()
          : '';
        const phone = b.customer?.phone?.toLowerCase() ?? '';
        const artist = b.artist?.name?.toLowerCase() ?? '';
        return clienteName.includes(q) || phone.includes(q) || artist.includes(q);
      });
    }

    // Ordina per data
    return result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [debouncedSearch, statusFilter, startDate, endDate, sortOrder]);

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
    prevMonth,
    nextMonth,
    filterBookings,
  };
}
