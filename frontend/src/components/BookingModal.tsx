"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { bookingService } from '@/services/booking.service';
import { customerService } from '@/services/customer.service';
import { teamService } from '@/services/team.service';
import { ENDPOINTS } from '@/api/endpoints';
import type { Customer, User, CreateBookingData } from '@/types';
import Modal from '@/components/Modal';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import SubmitButton from '@/components/SubmitButton';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookingModal({ isOpen, onClose, onSuccess }: BookingModalProps) {
  const [customerId, setCustomerId] = useState('');
  const [artistId, setArtistId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [type, setType] = useState('Tattoo');
  const [loading, setLoading] = useState(false);

  const { data: customers } = useSWR<Customer[]>(
    isOpen ? ENDPOINTS.CUSTOMERS.BASE : null,
    () => customerService.getAll()
  );
  const { data: artists } = useSWR<User[]>(
    isOpen ? ENDPOINTS.TEAM.USERS : null,
    () => teamService.getUsers()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !artistId || !date || !time) {
      return toast.error('Compila tutti i campi obbligatori');
    }

    setLoading(true);
    try {
      const data: CreateBookingData = {
        customerId,
        artistId,
        date: new Date(`${date}T${time}`).toISOString(),
        duration: Number(duration),
        type,
      };
      await bookingService.create(data);
      toast.success('Prenotazione confermata!');
      setCustomerId('');
      setArtistId('');
      setDate('');
      setTime('');
      setDuration('60');
      setType('Tattoo');
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Errore nella prenotazione';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const set = <K extends keyof typeof EMPTY>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.artistId || !form.date || !form.time) {
      toast.error('Cliente, artista, data e ora sono obbligatori');
      return;
    }
    setLoading(true);
    try {
      await bookingService.create({
        customerId: form.customerId,
        artistId: form.artistId,
        date: `${form.date}T${form.time}:00`,
        duration: Number(form.duration),
        type: form.type,
        price: form.price ? Number(form.price) : undefined,
        deposit: form.deposit ? Number(form.deposit) : undefined,
        notes: form.notes || undefined,
      });
      toast.success('Prenotazione creata');
      setForm(EMPTY);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Errore durante la creazione');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full p-3 rounded-xl bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition appearance-none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuova Prenotazione">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormSelect
          label="Cliente *"
          value={customerId}
          onChange={setCustomerId}
          placeholder="Seleziona cliente..."
          required
          options={(customers || []).map((c) => ({
            value: c.id,
            label: `${c.firstName} ${c.lastName}`,
          }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Data *" type="date" required value={date} onChange={setDate} />
          <FormInput label="Ora *" type="time" required value={time} onChange={setTime} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Artista *"
            value={artistId}
            onChange={setArtistId}
            placeholder="Seleziona artista..."
            required
            options={(artists || []).map((a) => ({
              value: a.id,
              label: a.name,
            }))}
          />
          <FormInput
            label="Durata (min)"
            type="number"
            value={duration}
            onChange={setDuration}
            min={15}
            step="15"
          />
        </div>

        <FormSelect
          label="Tipo"
          value={type}
          onChange={setType}
          options={[
            { value: 'Tattoo', label: 'Tattoo' },
            { value: 'Touch-up', label: 'Touch-up' },
            { value: 'Consulenza', label: 'Consulenza' },
            { value: 'Piercing', label: 'Piercing' },
          ]}
        />

        <SubmitButton loading={loading} label="Conferma Prenotazione" />
      </form>
    </Modal>
  );
}
