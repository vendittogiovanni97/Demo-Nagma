"use client";

import { useCallback, useState } from 'react';
import { useAuth } from '@/common/context/AuthContext';
import { bookingApi as bookingService } from '@/modules/booking/api/booking.api';

/**
 * Flusso condiviso di cancellazione prenotazione con scelta rimborso:
 * SUPER_ADMIN → dialog di conferma, altri ruoli → modale password.
 * Usato sia da Prenotazioni (useBookingActions) sia da Agenda (useAgendaBookings).
 */
export function useBookingDelete(mutate: () => Promise<unknown>) {
  const { isSuperAdmin } = useAuth();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePasswordLoading, setDeletePasswordLoading] = useState(false);

  const handleDelete = useCallback((id: number) => {
    setPendingDeleteId(id);
    if (isSuperAdmin) {
      setShowDeleteConfirm(true);
    } else {
      setShowDeletePasswordModal(true);
    }
  }, [isSuperAdmin]);

  const confirmSuperAdminDelete = useCallback(async (refund: boolean) => {
    if (!pendingDeleteId) return;
    const idToDelete = pendingDeleteId;
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
    await bookingService.delete(idToDelete, refund);
    await mutate();
  }, [pendingDeleteId, mutate]);

  const closeDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
  }, []);

  const handlePasswordDelete = useCallback(async (password: string, refund: boolean = true) => {
    if (!pendingDeleteId) return;
    setDeletePasswordLoading(true);
    try {
      await bookingService.verifyPassword(password);
      setShowDeletePasswordModal(false);
      const idToDelete = pendingDeleteId;
      setPendingDeleteId(null);
      await bookingService.delete(idToDelete, refund);
      await mutate();
    } catch {
      throw new Error('Password non corretta');
    } finally {
      setDeletePasswordLoading(false);
    }
  }, [pendingDeleteId, mutate]);

  const closePendingDelete = useCallback(() => {
    setShowDeletePasswordModal(false);
    setPendingDeleteId(null);
  }, []);

  return {
    pendingDeleteId,
    setPendingDeleteId,
    showDeletePasswordModal,
    setShowDeletePasswordModal,
    showDeleteConfirm,
    deletePasswordLoading,
    handleDelete,
    confirmSuperAdminDelete,
    closeDeleteConfirm,
    handlePasswordDelete,
    closePendingDelete,
  };
}
