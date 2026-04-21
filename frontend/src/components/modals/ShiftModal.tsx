"use client";

import StatePanel from '@/components/feedback/StatePanel';
import { EXPORT_FETCH_LIMIT } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useTeamMembers } from '@/hooks/domain';
import { useToast } from '@/hooks/useToast';
import { teamService } from '@/services/team.service';
import type { CreateShiftData } from '@/types/team';
import { extractErrorMessage } from '@/utils/extract-error';
import { useState } from 'react';
import FormSelect from '../forms/FormSelect';
import SubmitButton from '../forms/SubmitButton';
import Modal from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  weekStart: string;
  initialStaffId?: number;
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

export default function ShiftModal({ isOpen, onClose, onSuccess, weekStart, initialStaffId, initialDayOfWeek }: Props) {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [staffId, setStaffId] = useState(initialStaffId !== undefined ? initialStaffId.toString() : '');
  const [dayOfWeek, setDayOfWeek] = useState(initialDayOfWeek !== undefined ? initialDayOfWeek.toString() : '0');
  const [label, setLabel] = useState('Mattina');
  const [loading, setLoading] = useState(false);

  const { data: membersResult } = useTeamMembers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen });
  const members = membersResult?.data;

  const SHIFT_OPTIONS = [
    { value: 'Mattina', label: 'Mattina (09:00 - 13:00)' },
    { value: 'Pomeriggio', label: 'Pomeriggio (14:00 - 19:00)' },
    { value: 'Tutta la giornata', label: 'Tutta la giornata (09:00 - 19:00)' },
    { value: 'Riposo', label: 'Riposo' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) { toast.error('Seleziona un collaboratore'); return; }
    setLoading(true);
    try {
      const data: CreateShiftData = {
        staffId: Number(staffId),
        weekStart, // Già in formato YYYY-MM-DD
        dayOfWeek: Number(dayOfWeek),
        label,
        isOff: label === 'Riposo',
      };
      await teamService.createShift(data);
      toast.success('Turno pianificato');
      setStaffId('');
      setDayOfWeek('0');
      setLabel('Mattina');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Errore nella creazione turno'));
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna gli state interni quando cambiano le prop (se modale viene riaperta)
  if (isOpen && initialStaffId !== undefined && staffId !== initialStaffId.toString() && !loading) {
     setStaffId(initialStaffId.toString());
  }
  if (isOpen && initialDayOfWeek !== undefined && dayOfWeek !== initialDayOfWeek.toString() && !loading) {
     setDayOfWeek(initialDayOfWeek.toString());
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pianifica Turno">
      {!isAdmin ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin e segreteria possono gestire i turni."
        />
      ) : (
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSelect
          label="Collaboratore *"
          value={staffId}
          onChange={setStaffId}
          placeholder="Seleziona..."
          required
          options={(members || []).map(m => ({ value: m.id.toString(), label: m.name }))}
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
