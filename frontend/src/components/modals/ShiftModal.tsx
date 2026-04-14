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
  const [startTime, setStartTime] = useState(DEFAULT_SHIFT_START);
  const [endTime, setEndTime] = useState(DEFAULT_SHIFT_END);
  const [isOff, setIsOff] = useState(false);
  const [loading, setLoading] = useState(false);
  const canManage = canManageShifts(user?.role);

  const { data: usersResult } = useTeamUsers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen });
  const users = usersResult?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return notifyError(new Error('Seleziona un collaboratore'), 'Seleziona un collaboratore');
    setLoading(true);
    try {
      const data: CreateShiftData = {
        userId,
        weekStart: new Date(`${weekStart}T00:00:00Z`).toISOString(),
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        isOff,
      };
      await teamService.createShift(data);
      notifySuccess('Turno pianificato');
      setUserId('');
      setDayOfWeek('0');
      setStartTime('09:00');
      setEndTime('18:00');
      setIsOff(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      notifyError(err, 'Errore nella creazione turno');
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna gli state interni quando cambiano le prop (se modale viene riaperta)
  // use effect non ideal ma Next 19 / React lo gestirebbe diversamente. Per sicurezza facciamo un derivato:
  // React 18/19: se isOpen cambia da false a true, dobbiamo resettare ai props.
  // Invece di useEffect, React 19 suggerisce key reset, ma andiamo sul sicuro con prop syncing basico.
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
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex items-center gap-2 px-1">
          <input 
            type="checkbox" 
            id="isOff" 
            checked={isOff} 
            onChange={(e) => setIsOff(e.target.checked)}
            className="w-4 h-4 rounded border-surface-border bg-white/5 text-accent focus:ring-accent accent-accent transition-colors"
          />
          <label htmlFor="isOff" className="text-white text-sm cursor-pointer select-none">
            Imposta come giorno libero (riposo)
          </label>
        </div>

        {!isOff && (
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Inizio" type="time" value={startTime} onChange={setStartTime} required={!isOff} />
            <FormInput label="Fine" type="time" value={endTime} onChange={setEndTime} required={!isOff} />
          </div>
        )}

        <SubmitButton loading={loading} label="Salva Turno" />
      </form>
      )}
    </Modal>
  );
}
