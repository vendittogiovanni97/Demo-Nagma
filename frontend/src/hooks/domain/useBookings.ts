"use client";

import useSWR from 'swr';

import { ENDPOINTS } from '@/api/endpoints';
import { bookingService } from '@/services/booking.service';
import type { Booking, BookingStats } from '@/types/booking';

interface HookOptions {
  enabled?: boolean;
}

export function useBookings(month?: string, options?: HookOptions) {
  const enabled = options?.enabled ?? true;
  return useSWR<Booking[]>(
    enabled ? [ENDPOINTS.BOOKINGS.BASE, month] : null,
    () => bookingService.getAll(month),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
      refreshInterval: 5 * 60 * 1000,
    }
  );
}

export function useBookingsPaged(month?: string, page?: number, limit?: number, startDate?: string, endDate?: string, options?: HookOptions) {
  const enabled = options?.enabled ?? true;
  return useSWR<Booking[]>(
    enabled ? [ENDPOINTS.BOOKINGS.BASE, month, page, limit, startDate, endDate] : null,
    () => bookingService.getAll(month, startDate, endDate, page, limit),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
      refreshInterval: 5 * 60 * 1000,
    }
  );
}

export function useBookingStats(month?: string, options?: HookOptions) {
  const enabled = options?.enabled ?? true;

  return useSWR<BookingStats>(
    enabled ? [ENDPOINTS.BOOKINGS.STATS, month] : null,
    () => bookingService.getStats(month),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
      refreshInterval: 5 * 60 * 1000, // 5 minuti
    }
  );
}
