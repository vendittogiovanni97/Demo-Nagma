import { useCallback, useEffect, useState } from 'react';
import { bookingApi } from '../api/booking.api';
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

  const [data, setData] = useState<{ data: BookingModel[]; total: number; hasMore: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getAll(apiParams);
      setData({
        ...response,
        data: response.data.map(bookingMapper.toModel),
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, JSON.stringify(apiParams)]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingLocalState = useCallback((id: number, updatedFields: Partial<BookingModel>) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: prev.data.map((b) => (b.id === id ? { ...b, ...updatedFields } : b)),
      };
    });
  }, [setData]);

  return {
    data,
    isLoading,
    error,
    mutate: fetchBookings,
    updateBookingLocalState,
  };
}

export function useBooking(id?: number) {
  const [data, setData] = useState<BookingModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getById(id);
      setData(bookingMapper.toModel(response));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  return {
    data,
    isLoading,
    error,
    mutate: fetchBooking
  };
}

export function useBookingStats(month?: string) {
  const [data, setData] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!month) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getStats(month);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    data,
    isLoading,
    error,
    mutate: fetchStats
  };
}
