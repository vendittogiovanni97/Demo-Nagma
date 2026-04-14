"use client";

import { useState } from 'react';
import { DEFAULT_SHIFT_END, DEFAULT_SHIFT_START, EXPORT_FETCH_LIMIT } from '@/config/defaults';
import { teamService } from '@/services/team.service';
import { useAuth } from '@/context/AuthContext';
import { useTeamUsers } from '@/hooks/domain';
import type { CreateShiftData } from '@/types/team';
import Modal from './Modal';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import SubmitButton from '../forms/SubmitButton';
import StatePanel from '@/components/feedback/StatePanel';
import { canManageShifts } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  weekStart: string;
  initialUserId?: string;
  initialDayOfWeek?: number;
}

const DAYS = [
  { value: '0', label: 'Lunedì' },
  { value: '1', label: 'Martedì' },
  { value: '2', label: 'Mercoledì' },
  { value: '3', label: 'Giovedì' },
  { value: '4', label: 'Venerdì' },
  { value: '5', label: 'Sabato' },
  { value: '6', label: 'Domenica' },
];

export default function ShiftModal({ isOpen, onClose, onSuccess, weekStart, initialUserId, initialDayOfWeek }: Props) {
  const { user } = useAuth();
  const [userId, setUserId] = useState(initialUserId || '');
  const [dayOfWeek, setDayOfWeek] = useState(initialDayOfWeek !== undefined ? initialDayOfWeek.toString() : '0');
  const [label, setLabel] = useState('Mattina');
  const [loading, setLoading] = useState(false);
  const canManage = canManageShifts(user?.role);

  const { data: usersResult } = useTeamUsers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen });
  const users = usersResult?.data;

  const SHIFT_OPTIONS = [
    { value: 'Mattina', label: 'Mattina (09:00 - 13:00)' },
    { value: 'Pomeriggio', label: 'Pomeriggio (14:00 - 19:00)' },
    { value: 'Tutta la giornata', label: 'Tutta la giornata (09:00 - 19:00)' },
    { value: 'Riposo', label: 'Riposo' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return notifyError(new Error('Seleziona un collaboratore'), 'Seleziona un collaboratore');
    setLoading(true);
    try {
      const data: CreateShiftData = {
        userId,
        weekStart, // Già in formato YYYY-MM-DD
        dayOfWeek: Number(dayOfWeek),
        label,
        isOff: label === 'Riposo',
      };
      await teamService.createShift(data);
      notifySuccess('Turno pianificato');
      setUserId('');
      setDayOfWeek('0');
      setLabel('Mattina');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      notifyError(err, 'Errore nella creazione turno');
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna gli state interni quando cambiano le prop (se modale viene riaperta)
  if (isOpen && initialUserId && userId !== initialUserId && !loading) {
     setUserId(initialUserId);
  }
  if (isOpen && initialDayOfWeek !== undefined && dayOfWeek !== initialDayOfWeek.toString() && !loading) {
     setDayOfWeek(initialDayOfWeek.toString());
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pianifica Turno">
      {!canManage ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin e segreteria possono gestire i turni."
        />
      ) : (
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSelect
          label="Collaboratore *"
          value={userId}
          onChange={setUserId}
          placeholder="Seleziona..."
          required
          options={(users || []).map(u => ({ value: u.id, label: u.name }))}
        />

        <FormSelect
          label="Giorno *"
          value={dayOfWeek}
          onChange={setDayOfWeek}
          options={DAYS}
        />

        <FormSelect
          label="Tipo di Turno *"
          value={label}
          onChange={setLabel}
          options={SHIFT_OPTIONS}
          required
        />

        <SubmitButton loading={loading} label="Salva Turno" />
      </form>
      )}
    </Modal>
  );
}
