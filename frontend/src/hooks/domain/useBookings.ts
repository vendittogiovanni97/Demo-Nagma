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
    () => bookingService.getAll(month)
  );
}

export function useBookingStats(month?: string, options?: HookOptions) {
  const enabled = options?.enabled ?? true;

  return useSWR<BookingStats>(
    enabled ? [ENDPOINTS.BOOKINGS.STATS, month] : null,
    () => bookingService.getStats(month)
  );
}
