"use client";

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { bookingApi } from '@/modules/booking/api/booking.api';
import type { BookingDTO } from '@/modules/booking/api/booking.types';

export function useAffitti() {
  const [month, setMonth] = useState<Date>(() => new Date());
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('ALL');

  const monthStr = format(month, 'yyyy-MM');

  const key = ['/affitti/bookings', monthStr, search, startDate, endDate, status];

  const { data, isLoading, mutate } = useSWR(key, async () => {
    const res = await bookingApi.getAll({
      month: monthStr,
      search: search || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status === 'ALL' ? undefined : status,
      isRentPayee: true,
      limit: 1000,
    });
    return res.data;
  });

  const bookings: BookingDTO[] = useMemo(() => data || [], [data]);

  return {
    bookings,
    isLoading,
    mutate,
    month,
    setMonth,
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    status,
    setStatus,
  };
}
