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

  const handleComplete = async (id: number) => {
    try {
      onUpdateLocalState?.(id, { status: 'COMPLETATO' });
      await bookingService.update(id, { status: 'COMPLETATO' });
      await mutate();
    } catch {
      await mutate();
    }
  };

  const handleRestore = async (id: number) => {
    try {
      onUpdateLocalState?.(id, { status: 'CONFERMATO' });
      await bookingService.update(id, { status: 'CONFERMATO' });
      await mutate();
    } catch {
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
