'use client';

import useSWR from 'swr';
import { useCallback, useMemo } from 'react';
import { bookingApi } from '@/modules/booking/api/booking.api';
import type { BookingDTO } from '@/modules/booking/api/booking.types';
import { useToast } from '@/common/hooks/useToast';

export type KanbanStage = 'IN_ARRIVO' | 'IN_ATTESA' | 'IN_SEDUTA' | 'DA_SALDARE' | 'SALDATO';

export interface KanbanBookingItem extends BookingDTO {
  kanbanStage: KanbanStage;
  outstandingBalance: number;
  sessionStartedAt?: string | null;
}

export function useKanbanBookings(dateStr?: string) {
  const toast = useToast();
  const cacheKey = dateStr ? `/api/bookings/kanban/today?date=${dateStr}` : '/api/bookings/kanban/today';

  const { data, error, isLoading, mutate } = useSWR<KanbanBookingItem[]>(
    cacheKey,
    async () => {
      const res = await bookingApi.getTodayKanban(dateStr);
      return (res as unknown as KanbanBookingItem[]) || [];
    },
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
    }
  );

  const moveBooking = useCallback(
    async (bookingId: number, targetStage: KanbanStage) => {
      if (!data) return;

      const previousData = [...data];
      const updatedData = data.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              kanbanStage: targetStage,
              status:
                targetStage === 'SALDATO'
                  ? 'COMPLETATO'
                  : targetStage === 'IN_SEDUTA' && b.status === 'CREATO'
                  ? 'CONFERMATO'
                  : b.status,
            }
          : b
      );

      mutate(updatedData, false);

      try {
        await bookingApi.updateKanbanStatus(bookingId, targetStage);
        toast.success(`Stato appuntamento aggiornato a ${targetStage.replace('_', ' ')}`);
        mutate();
      } catch (err: any) {
        mutate(previousData, false);
        toast.error(err?.message || 'Impossibile aggiornare lo stato dell\'appuntamento');
      }
    },
    [data, mutate, toast]
  );

  const columnsData = useMemo(() => {
    const list = data || [];
    return {
      IN_ARRIVO: list.filter((b) => b.kanbanStage === 'IN_ARRIVO'),
      IN_ATTESA: list.filter((b) => b.kanbanStage === 'IN_ATTESA'),
      IN_SEDUTA: list.filter((b) => b.kanbanStage === 'IN_SEDUTA'),
      DA_SALDARE: list.filter((b) => b.kanbanStage === 'DA_SALDARE'),
      SALDATO: list.filter((b) => b.kanbanStage === 'SALDATO'),
    };
  }, [data]);

  return {
    bookings: data || [],
    columnsData,
    isLoading,
    error,
    moveBooking,
    refresh: mutate,
  };
}
