"use client";

import { EXPORT_FETCH_LIMIT } from '@/config/defaults';
import { useCustomers } from '@/hooks/domain';
import { useFormTemplates } from '@/hooks/domain/useFormTemplates';
import { useToast } from '@/hooks/useToast';
import { bookingService } from '@/services/booking.service';
import type { Booking, CreateBookingData } from '@/types/booking';
import type { FieldDef } from '@/types/form-template';
import { validateData } from '@/utils/validation';
import { createBookingSchema } from '@/schemas';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import SubmitButton from '../forms/SubmitButton';
import Modal from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  booking?: Booking | null;
}

interface AvailableArtist {
  id: number;
  name: string;
  color?: string | null;
}

const DURATA_OPTIONS = [
  { value: '30', label: '30 min' },
  { value: '60', label: '1h' },
  { value: '90', label: '1h 30min' },
  { value: '120', label: '2h' },
  { value: '150', label: '2h 30min' },
  { value: '180', label: '3h' },
  { value: '240', label: '4h' },
  { value: '300', label: '5h' },
  { value: '360', label: '6h' },
];

const PERCENTUALE_OPTIONS = [
  { value: '10', label: '10%' },
  { value: '20', label: '20%' },
  { value: '30', label: '30%' },
  { value: '40', label: '40%' },
  { value: '50', label: '50%' },
  { value: '60', label: '60%' },
  { value: '70', label: '70%' },
  { value: '80', label: '80%' },
  { value: '90', label: '90%' },
  { value: '100', label: '100%' },
  { value: 'custom', label: 'Libero' },
];

export default function BookingModal({ isOpen, onClose, onSuccess, booking }: Props) {
  const toast = useToast();
  const [customerId, setCustomerId] = useState('');
  const [artistId, setArtistId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('120');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [percentualeMode, setPercentualeMode] = useState('50');
  const [customPercentuale, setCustomPercentuale] = useState('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [availableArtists, setAvailableArtists] = useState<AvailableArtist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);

  const { data: customerResult } = useCustomers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen });
  const { data: templates } = useFormTemplates();
  const customers = customerResult?.data;

  useEffect(() => {
    if (booking && isOpen) {
      const d = new Date(booking.date);
      setCustomerId(booking.customerId.toString());
      setArtistId(booking.artistId.toString());
      setDate(format(d, 'yyyy-MM-dd'));
      setTime(format(d, 'HH:mm'));
      setDuration(booking.duration?.toString() || '120');
      setPrice(booking.price?.toString() || '');
      setDeposit(booking.deposit?.toString() || '');

      const perc = (booking.formData)?.artistPercentage;
      if (perc != null) {
        const found = PERCENTUALE_OPTIONS.find(o => o.value === perc.toString());
        if (found) {
          setPercentualeMode(perc.toString());
        } else {
          setPercentualeMode('custom');
          setCustomPercentuale(perc.toString());
        }
      }
      setDynamicValues(booking.formData as Record<string, string> || {});
    } else if (!booking && isOpen) {
      resetForm();
    }
  }, [booking, isOpen]);

  useEffect(() => {
    if (date && time && isOpen) {
      const fetchAvailable = async () => {
        setLoadingArtists(true);
        try {
          const isoDate = new Date(`${date}T${time}`).toISOString();
          const data = await bookingService.getAvailableArtists(isoDate);
          setAvailableArtists(data);

          if (artistId && !data.find((a: AvailableArtist) => a.id.toString() === artistId)) {
            setArtistId('');
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Errore nel recupero artisti disponibili';
          toast.error(errorMessage);
        } finally {
          setLoadingArtists(false);
        }
      };
      fetchAvailable();
    } else {
      setAvailableArtists([]);
      setArtistId('');
    }
  }, [date, time, isOpen, artistId]);

  const dynamicFields = useMemo<FieldDef[]>(() => {
    if (!templates || templates.length === 0) return [];
    try {
      const jsonStr = atob(templates[0].schemaB64);
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }, [templates]);

  const percentuale = percentualeMode === 'custom'
    ? Number(customPercentuale) || 0
    : Number(percentualeMode) || 0;

  const prezzoNum = Number(price) || 0;
  const prezzoArtista = Math.round((prezzoNum * percentuale / 100) * 100) / 100;
  const guadagno = Math.round((prezzoNum - prezzoArtista) * 100) / 100;

  const handleDynamicChange = (name: string, value: string) => {
    setDynamicValues(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setCustomerId('');
    setArtistId('');
    setDate('');
    setTime('');
    setDuration('120');
    setPrice('');
    setDeposit('');
    setPercentualeMode('50');
    setCustomPercentuale('');
    setDynamicValues({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !artistId || !date || !time) {
      toast.error('Campi mancanti');
      return;
    }

    const bookingDate = new Date(`${date}T${time}`).toISOString();

    const formData: Record<string, unknown> = {};
    formData.artistPercentage = percentuale;
    formData.artistPrice = prezzoArtista;
    formData.studioProfit = guadagno;
    for (const field of dynamicFields) {
      const val = dynamicValues[field.name];
      if (val) formData[field.name] = val;
    }

    const data: CreateBookingData = {
      customerId: Number(customerId),
      artistId: Number(artistId),
      date: bookingDate,
      duration: Number(duration) || undefined,
      price: prezzoNum || undefined,
      deposit: Number(deposit) || undefined,
      formData,
    };

    const validationError = validateData(createBookingSchema, data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      if (booking?.id) {
        await bookingService.update(booking.id, data);
        toast.success('Prenotazione aggiornata!');
      } else {
        await bookingService.create(data);
        toast.success('Prenotazione confermata!');
      }
      resetForm();
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : (booking?.id ? 'Errore nell\'aggiornamento' : 'Errore nella prenotazione');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={booking ? 'Modifica Prenotazione' : 'Nuova Prenotazione'} maxWidth="max-w-6xl">
      <form className="space-y-4" onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Step 1: Data e Ora */}
          <div className="bg-white/5 border border-surface-border p-3 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider">1. Quando vuoi prenotare?</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Data *" type="date" required value={date} onChange={setDate} />
              <FormInput label="Ora *" type="time" required value={time} onChange={setTime} />
            </div>
            <div>
              <FormSelect
                label="Durata sessione"
                value={duration}
                onChange={setDuration}
                options={DURATA_OPTIONS}
              />
            </div>
          </div>

          {/* Step 2: Cliente e Artista */}
          <div className={`p-3 rounded-xl border transition-all duration-300 ${(!date || !time) ? 'opacity-50 grayscale pointer-events-none bg-black/20 border-transparent' : 'bg-white/5 border-surface-border'} space-y-3`}>
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider">2. Chi coinvolge?</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Cliente *"
                value={customerId}
                onChange={setCustomerId}
                placeholder="Seleziona..."
                required
                options={(customers || []).map((c) => ({
                  value: c.id.toString(),
                  label: `${c.firstName} ${c.lastName}`,
                }))}
              />
              <FormSelect
                label="Artista *"
                value={artistId}
                onChange={setArtistId}
                disabled={loadingArtists || availableArtists.length === 0}
                placeholder={loadingArtists ? 'Ricerca...' : availableArtists.length === 0 ? 'Nessun artista' : 'Seleziona...'}
                required
                options={availableArtists.map((a) => ({
                  value: a.id.toString(),
                  label: a.name,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Messaggio nessun artista */}
        {date && time && !loadingArtists && availableArtists.length === 0 && (
          <p className="text-[10px] text-danger italic text-center">Nessun artista ha un turno che copre questo orario o sono tutti occupati.</p>
        )}

        {/* Step 3: Dettagli Economici */}
        <div className="bg-white/2 border border-surface-border/50 p-3 rounded-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <FormInput label="Prezzo Finale (€)" type="number" value={price} onChange={setPrice} placeholder="0.00" min={0} step="0.01" />
            <FormInput label="Acconto (€)" type="number" value={deposit} onChange={setDeposit} placeholder="0.00" min={0} step="0.01" />

            <FormSelect
              label="% Artista"
              value={percentualeMode}
              onChange={setPercentualeMode}
              options={PERCENTUALE_OPTIONS}
            />

            {percentualeMode === 'custom' ? (
              <FormInput
                label="% libera"
                type="number"
                value={customPercentuale}
                onChange={setCustomPercentuale}
                placeholder="35"
                min={0}
                max={100}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 h-full pt-1">
                <div className="flex flex-col justify-center items-center bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-2 min-w-25 shadow-lg shadow-orange-500/5">
                  <p className="text-[10px] text-orange-400 uppercase font-black tracking-widest mb-1">Artista</p>
                  <p className="text-xl font-outfit font-black text-orange-400">€{prezzoArtista.toFixed(2)}</p>
                </div>
                <div className="flex flex-col justify-center items-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 min-w-25 shadow-lg shadow-emerald-500/5">
                  <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mb-1">Studio</p>
                  <p className="text-xl font-outfit font-black text-emerald-400">€{guadagno.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Campi dinamici */}
        {dynamicFields.length > 0 && (
          <div className="border-t border-surface-border/50 pt-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {dynamicFields.map((field) => {
                const CommonProps = {
                  label: field.label,
                  value: dynamicValues[field.name] || '',
                  onChange: (val: string) => handleDynamicChange(field.name, val),
                  placeholder: field.label,
                  required: field.required,
                };

                if (field.type === 'select') {
                  return (
                    <FormSelect
                      key={field.name}
                      {...CommonProps}
                      options={(field.options || []).map((o) => ({ value: o, label: o }))}
                    />
                  );
                }
                return (
                  <FormInput
                    key={field.name}
                    {...CommonProps}
                    type={field.type === 'number' ? 'number' : 'text'}
                  />
                );
              })}
            </div>
          </div>
        )}

        <SubmitButton loading={loading} label={booking ? 'Salva Modifiche' : 'Conferma Prenotazione'} />
      </form>
    </Modal>
  );
}
