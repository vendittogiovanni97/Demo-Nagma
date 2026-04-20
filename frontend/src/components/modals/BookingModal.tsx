"use client";

import { EXPORT_FETCH_LIMIT } from '@/config/defaults';
import { extractErrorMessage } from '@/utils/extract-error';
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
import PasswordConfirmModal from './PasswordConfirmModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  booking?: Booking | null;
  initialDate?: string;
  initialTime?: string;
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

export default function BookingModal({ isOpen, onClose, onSuccess, booking, initialDate, initialTime }: Props) {
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
  const [initialArtistLoaded, setInitialArtistLoaded] = useState(false);

  // Password confirmation
  const [pendingData, setPendingData] = useState<CreateBookingData | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

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
      setInitialArtistLoaded(true);
    } else if (!booking && isOpen) {
      resetForm();
      if (initialDate) setDate(initialDate);
      if (initialTime) setTime(initialTime);
      setInitialArtistLoaded(false);
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

          // In new booking mode only, clear artistId if not available
          // (In edit mode, keep the current artist even if not available - they may be busy with this slot)
          if (!booking?.id && artistId && !data.find((a: AvailableArtist) => a.id.toString() === artistId)) {
            setArtistId('');
          }
        } catch (err) {
          toast.error(extractErrorMessage(err, 'Errore nel recupero artisti disponibili'));
        } finally {
          setLoadingArtists(false);
        }
      };
      fetchAvailable();
    } else {
      setAvailableArtists([]);
      if (!initialArtistLoaded) {
        setArtistId('');
      }
    }
  }, [date, time, isOpen]);

  const dynamicFields = useMemo<FieldDef[]>(() => {
    if (!templates || templates.length === 0) return [];
    try {
      const jsonStr = atob(templates[0].schemaB64);
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }, [templates]);

  // Include current artist in options even if not available (edit mode)
  const artistOptions = useMemo(() => {
    const available = availableArtists.map((a) => ({
      value: a.id.toString(),
      label: a.name,
    }));

    // In edit mode, add current artist if not already in available list
    if (booking?.id && booking?.artist && artistId && !available.find((a) => a.value === artistId)) {
      available.unshift({
        value: booking.artist.id.toString(),
        label: booking.artist.name,
      });
    }

    return available;
  }, [availableArtists, booking?.id, booking?.artist, artistId]);

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

    // If editing, require password confirmation
    if (booking?.id) {
      setPendingData(data);
      setShowPasswordModal(true);
    } else {
      // New booking: no password needed
      await executeBookingCreate(data);
    }
  };

  const executeBookingCreate = async (data: CreateBookingData) => {
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
      // Refresh bookings list after successful update/create
      await onSuccess?.();
      onClose();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, booking?.id ? 'Errore nell\'aggiornamento' : 'Errore nella prenotazione'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    setPasswordLoading(true);
    try {
      // Verify password server-side
      await bookingService.verifyPassword(password);
      setShowPasswordModal(false);
      setPendingData(null);
      if (pendingData) {
        await executeBookingCreate(pendingData);
      }
    } catch (error: unknown) {
      throw new Error('Password non corretta');
    } finally {
      setPasswordLoading(false);
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
                disabled={loadingArtists || artistOptions.length === 0}
                placeholder={loadingArtists ? 'Ricerca...' : artistOptions.length === 0 ? 'Nessun artista' : 'Seleziona...'}
                required
                options={artistOptions}
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

      <PasswordConfirmModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingData(null);
        }}
        onConfirm={handlePasswordConfirm}
        loading={passwordLoading}
      />
    </Modal>
  );
}
