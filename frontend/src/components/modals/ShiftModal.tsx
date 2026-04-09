"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { teamService } from '@/services/team.service';
import { ENDPOINTS } from '@/api/endpoints';
import type { User, CreateShiftData } from '@/types';
import Modal from './Modal';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import SubmitButton from '../forms/SubmitButton';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  weekStart: string;
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

export default function ShiftModal({ isOpen, onClose, onSuccess, weekStart }: Props) {
  const [userId, setUserId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('0');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [loading, setLoading] = useState(false);

  const { data: users } = useSWR<User[]>(
    isOpen ? ENDPOINTS.TEAM.USERS : null,
    () => teamService.getUsers()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return toast.error('Seleziona un collaboratore');
    setLoading(true);
    try {
      const data: CreateShiftData = {
        userId,
        weekStart: new Date(`${weekStart}T00:00:00Z`).toISOString(),
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
      };
      await teamService.createShift(data);
      toast.success('Turno pianificato');
      setUserId('');
      setDayOfWeek('0');
      setStartTime('09:00');
      setEndTime('18:00');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore nella creazione turno';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pianifica Turno">
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

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Inizio" type="time" value={startTime} onChange={setStartTime} required />
          <FormInput label="Fine" type="time" value={endTime} onChange={setEndTime} required />
        </div>

        <SubmitButton loading={loading} label="Salva Turno" />
      </form>
    </Modal>
  );
}
