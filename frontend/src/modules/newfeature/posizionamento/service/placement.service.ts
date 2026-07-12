"use client";

import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import { BookingPlacementData } from '../model/placement.types';

export const placementService = {
  getByBookingId: async (bookingId: number): Promise<BookingPlacementData | null> => {
    try {
      const res = await apiClient.get<{ success: boolean; data: BookingPlacementData | null }>(
        ENDPOINTS.NEW_FEATURE.GET_PLACEMENT(bookingId)
      );
      return res.data;
    } catch (err) {
      console.error('Error fetching placement:', err);
      return null;
    }
  },

  save: async (bookingId: number, data: Omit<BookingPlacementData, 'bookingId'>): Promise<BookingPlacementData | null> => {
    const res = await apiClient.post<{ success: boolean; data: BookingPlacementData }>(
      ENDPOINTS.NEW_FEATURE.SAVE_PLACEMENT(bookingId),
      data
    );
    return res.data;
  }
};
