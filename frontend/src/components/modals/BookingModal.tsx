"use client";

import { useState } from 'react';
import { bookingService } from '@/services/booking.service';
import { useCustomers, useTeamUsers } from '@/hooks/domain';
import type { CreateBookingData } from '@/types/booking';
import Modal from './Modal';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import SubmitButton from '../forms/SubmitButton';
import { notifyError, notifySuccess } from '@/utils/toast';
import { validateBookingData } from '@/utils/validation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookingModal({ isOpen, onClose, onSuccess }: Props) {
  const [customerId, setCustomerId] = useState('');
  const [artistId, setArtistId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [type, setType] = useState('Tattoo');
  const [loading, setLoading] = useState(false);

  const { data: customerResult } = useCustomers({ page: 1, limit: 1000, enabled: isOpen });
  const { data: artistsResult } = useTeamUsers({ page: 1, limit: 1000, enabled: isOpen });
  const customers = customerResult?.data;
  const artists = artistsResult?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bookingDate = date && time ? new Date(`${date}T${time}`).toISOString() : '';
    const data: CreateBookingData = {
      customerId,
      artistId,
      date: bookingDate,
      duration: Number(duration),
      type,
    };
    const validationError = validateBookingData({ ...data, time });
    if (validationError) {
      notifyError(new Error(validationError), validationError);
      return;
    }

    setLoading(true);
    try {
      await bookingService.create(data);
      notifySuccess(`Prenotazione del ${date} alle ${time} confermata!`);
      setCustomerId('');
      setArtistId('');
      setDate('');
      setTime('');
      setDuration('60');
      setType('Tattoo');
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      notifyError(error, 'Errore nella prenotazione');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuova Prenotazione">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormSelect
          label="Cliente"
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
          <FormInput label="Data" type="date" required value={date} onChange={setDate} />
          <FormInput label="Ora" type="time" required value={time} onChange={setTime} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Artista"
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
