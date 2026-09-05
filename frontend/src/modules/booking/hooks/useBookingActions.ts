"use client";

import { bookingApi as bookingService } from '../api/booking.api';
import { useBookingDelete } from './useBookingDelete';

interface UseBookingActionsOptions {
  mutate: () => Promise<unknown>;
  onUpdateLocalState?: (id: number, fields: Partial<any>) => void;
}

export function useBookingActions({ mutate, onUpdateLocalState }: UseBookingActionsOptions) {
  const {
    pendingDeleteId,
    showDeletePasswordModal,
    showDeleteConfirm,
    deletePasswordLoading,
    handleDelete,
    confirmSuperAdminDelete,
    closeDeleteConfirm,
    handlePasswordDelete,
    closePendingDelete,
  } = useBookingDelete(mutate);

  const handleComplete = async (id: number, previousStatus?: string) => {
    onUpdateLocalState?.(id, { status: 'COMPLETATO' });
    try {
      await bookingService.update(id, { status: 'COMPLETATO' });
      await mutate();
    } catch {
      if (previousStatus) onUpdateLocalState?.(id, { status: previousStatus });
      await mutate();
    }
  };

  const handleRestore = async (id: number, previousStatus?: string) => {
    onUpdateLocalState?.(id, { status: 'CONFERMATO' });
    try {
      await bookingService.update(id, { status: 'CONFERMATO' });
      await mutate();
    } catch {
      if (previousStatus) onUpdateLocalState?.(id, { status: previousStatus });
      await mutate();
    }
  };

  return {
    pendingDeleteId,
    showDeletePasswordModal,
    showDeleteConfirm,
    deletePasswordLoading,
    handleComplete,
    handleRestore,
    handleDelete,
    handlePasswordDelete,
    confirmSuperAdminDelete,
    closeDeleteConfirm,
    closePendingDelete,
  };
}
