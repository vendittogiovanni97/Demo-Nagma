import { useCallback } from 'react';
import useSWR from 'swr';
import { bookingApi } from '../api/booking.api';
import {
  BOOKING_DETAIL_CACHE_KEY,
  BOOKING_LIST_CACHE_KEY,
  BOOKING_STATS_CACHE_KEY,
} from '../api/booking.cache';
import { bookingMapper } from '../api/booking.mapper';
import type { BookingModel } from '../model/booking.model';
import type { BookingStats } from '../model/booking.types';

interface UseBookingsParams {
  month?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  search?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useBookings(params: UseBookingsParams = {}) {
  const { enabled = true, ...apiParams } = params;
  const { data, isLoading, error, mutate } = useSWR(
    enabled ? [BOOKING_LIST_CACHE_KEY, apiParams] : null,
    async ([, requestParams]) => {
      const response = await bookingApi.getAll(requestParams);
      return {
        ...response,
        data: response.data.map(bookingMapper.toModel),
      };
    },
  );

  const updateBookingLocalState = useCallback((id: number, updatedFields: Partial<BookingModel>) => {
    void mutate((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: prev.data.map((b) => (b.id === id ? { ...b, ...updatedFields } : b)),
      };
    }, { revalidate: false });
  }, [mutate]);

  return {
    data: data ?? null,
    isLoading,
    error,
    mutate,
    updateBookingLocalState,
  };
}

export function useBooking(id?: number) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? [BOOKING_DETAIL_CACHE_KEY, id] : null,
    async ([, bookingId]) => {
      const response = await bookingApi.getById(bookingId);
      return bookingMapper.toModel(response);
    },
  );

  return {
    data: data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useBookingStats(month?: string) {
  const { data, isLoading, error, mutate } = useSWR(
    month ? [BOOKING_STATS_CACHE_KEY, month] : null,
    async ([, requestedMonth]) => {
      return bookingApi.getStats(requestedMonth);
    },
  );

  return {
    data: data as BookingStats | undefined,
    isLoading,
    error,
    mutate,
  };
}
