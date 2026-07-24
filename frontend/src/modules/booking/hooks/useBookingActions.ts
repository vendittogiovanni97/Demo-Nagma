"use client";

import { useState } from 'react';
import { useAuth } from '@/common/context/AuthContext';
import { bookingApi as bookingService } from '../api/booking.api';

interface UseBookingActionsOptions {
  mutate: () => Promise<unknown>;
  onUpdateLocalState?: (id: number, fields: Partial<any>) => void;
}

export function useBookingActions({ mutate, onUpdateLocalState }: UseBookingActionsOptions) {
  const { isSuperAdmin } = useAuth();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
  const [deletePasswordLoading, setDeletePasswordLoading] = useState(false);

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

  const handleSuperAdminDelete = async (id: number) => {
    await bookingService.delete(id);
    await mutate();
  };

  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
    if (isSuperAdmin) {
      setShowDeletePasswordModal(false);
      handleSuperAdminDelete(id);
    } else {
      setShowDeletePasswordModal(true);
    }
  };

  const handlePasswordDelete = async (password: string) => {
    if (!pendingDeleteId) return;
    setDeletePasswordLoading(true);
    try {
      await bookingService.verifyPassword(password);
      setShowDeletePasswordModal(false);
      const idToDelete = pendingDeleteId;
      setPendingDeleteId(null);
      await bookingService.delete(idToDelete);
      await mutate();
    } catch {
      throw new Error('Password non corretta');
    } finally {
      setDeletePasswordLoading(false);
    }
  };

  const closePendingDelete = () => {
    setShowDeletePasswordModal(false);
    setPendingDeleteId(null);
  };

  return {
    pendingDeleteId,
    showDeletePasswordModal,
    deletePasswordLoading,
    handleComplete,
    handleRestore,
    handleDelete,
    handlePasswordDelete,
    closePendingDelete,
  };
}
