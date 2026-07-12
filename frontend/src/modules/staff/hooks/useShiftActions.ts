"use client";

import { SHIFT_LABELS } from '@/common/config/staff-config';
import { useToast } from '@/common/hooks/useToast';
import { staffApi } from '../api/staff.api';
import type { Shift } from '../model/staff.types';
import { useState } from 'react';

interface UseShiftActionsParams {
  week: string;
  canManageShiftData: boolean;
  mutateShifts: () => Promise<unknown>;
}

export function useShiftActions({ week, canManageShiftData, mutateShifts }: UseShiftActionsParams) {
  const toast = useToast();
  const [updatingShiftId, setUpdatingShiftId] = useState<string | null>(null);
  const [isAddingShift, setIsAddingShift] = useState<string | null>(null);

  const handleCycleShift = async (shift: Shift) => {
    if (!canManageShiftData || updatingShiftId) return;

    const currentLabel = (shift.label || 'Mattina') as (typeof SHIFT_LABELS)[number];
    const currentIndex = SHIFT_LABELS.indexOf(currentLabel);
    const nextLabel = SHIFT_LABELS[(currentIndex + 1) % SHIFT_LABELS.length];

    setUpdatingShiftId(shift.id);
    try {
      await staffApi.updateShift(shift.id, {
        label: nextLabel,
        isOff: nextLabel === 'Riposo',
      });
      await mutateShifts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore nell\'aggiornamento del turno');
    } finally {
      setUpdatingShiftId(null);
    }
  };

  const handleQuickAddShift = async (staffId: number, dayOfWeek: number) => {
    if (!canManageShiftData || isAddingShift) return;

    const key = `${staffId}-${dayOfWeek}`;
    setIsAddingShift(key);
    try {
      await staffApi.createShift({
        staffId,
        weekStart: week,
        dayOfWeek,
        label: 'Mattina',
        isOff: false,
      });
      await mutateShifts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore nella creazione del turno');
    } finally {
      setIsAddingShift(null);
    }
  };

  const handleDeleteShift = async (
    id: string,
    deleteItem: (opts: {
      confirmMessage: string;
      action: () => Promise<unknown>;
      successMessage: string;
      errorMessage: string;
      onSuccess: () => Promise<unknown>;
    }) => Promise<void>
  ) => {
    await deleteItem({
      confirmMessage: 'Eliminare questo turno?',
      action: () => staffApi.deleteShift(id),
      successMessage: 'Turno eliminato',
      errorMessage: 'Errore durante l\'eliminazione',
      onSuccess: mutateShifts,
    });
  };

  return {
    updatingShiftId,
    isAddingShift,
    handleCycleShift,
    handleQuickAddShift,
    handleDeleteShift,
  };
}
