"use client";

import { DEFAULT_BOOKING_DURATION, DEFAULT_BOOKING_TYPE, EXPORT_FETCH_LIMIT } from '@/config/defaults';
import { useCustomers, useTeamUsers } from '@/hooks/domain';
import { bookingService } from '@/services/booking.service';
import type { CreateBookingData } from '@/types/booking';
import { notifyError, notifySuccess } from '@/utils/toast';
import { validateBookingData } from '@/utils/validation';
import { useState } from 'react';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import SubmitButton from '../forms/SubmitButton';
import Modal from './Modal';

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
  const [duration, setDuration] = useState(DEFAULT_BOOKING_DURATION);
  const [type, setType] = useState(DEFAULT_BOOKING_TYPE);
  const [tattooStyle, setTattooStyle] = useState('');
  const [progettoTipo, setProgettoTipo] = useState('');
  const [grandezza, setGrandezza] = useState('');
  const [posizione, setPosizione] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: customerResult } = useCustomers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen });
  const { data: artistsResult } = useTeamUsers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen });
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
      tattooStyle: tattooStyle || undefined,
      progettoTipo: progettoTipo || undefined,
      grandezza: grandezza || undefined,
      posizione: posizione || undefined,
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
      setTattooStyle('');
      setProgettoTipo('');
      setGrandezza('');
      setPosizione('');
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

        {/* Dettagli Tattoo/Progetto */}
        <div className="border-t border-surface-border pt-4 mt-4">
          <h3 className="text-sm font-semibold text-white mb-3">Dettagli Progetto</h3>

          <div className="space-y-3">
            <FormSelect
              label="Stile Tattoo"
              value={tattooStyle}
              onChange={setTattooStyle}
              placeholder="Seleziona stile..."
              options={[
                { value: 'Realistico', label: 'Realistico' },
                { value: 'Tradizionale', label: 'Tradizionale' },
                { value: 'Neotradizionale', label: 'Neotradizionale' },
                { value: 'Acquerello', label: 'Acquerello' },
                { value: 'Blackwork', label: 'Blackwork' },
                { value: 'Minimal', label: 'Minimal' },
                { value: 'Giapponese', label: 'Giapponese' },
                { value: 'Lettering', label: 'Lettering' },
                { value: 'Geometrico', label: 'Geometrico' },
                { value: 'Altro', label: 'Altro' },
              ]}
            />

            <FormInput
              label="Tipo di Progetto"
              value={progettoTipo}
              onChange={setProgettoTipo}
              placeholder="Descrivi il tipo di progetto..."
            />

            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Grandezza"
                value={grandezza}
                onChange={setGrandezza}
                placeholder="Seleziona..."
                options={[
                  { value: 'Piccolo (< 10cm)', label: 'Piccolo (< 10cm)' },
                  { value: 'Medio (10-20cm)', label: 'Medio (10-20cm)' },
                  { value: 'Grande (20-30cm)', label: 'Grande (20-30cm)' },
                  { value: 'Extra Large (> 30cm)', label: 'Extra Large (> 30cm)' },
                ]}
              />

              <FormInput
                label="Posizione"
                value={posizione}
                onChange={setPosizione}
                placeholder="Es. Braccio, Gamba..."
              />
            </div>
          </div>
        </div>

        <SubmitButton loading={loading} label="Conferma Prenotazione" />
      </form>
    </Modal>
  );
}
