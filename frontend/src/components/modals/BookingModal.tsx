"use client";

import { EXPORT_FETCH_LIMIT } from '@/config/env';
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
import SubmitButton from '../forms/SubmitButton';
import Modal from './Modal';
import PasswordConfirmModal from './PasswordConfirmModal';
import BookingDateTimeSection from './booking/BookingDateTimeSection';
import BookingParticipantsSection from './booking/BookingParticipantsSection';
import BookingFinancialSection from './booking/BookingFinancialSection';
import BookingDynamicFieldsSection from './booking/BookingDynamicFieldsSection';
import { PERCENTUALE_OPTIONS_VALUES } from '@/config/booking-config';

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
  const [notes, setNotes] = useState('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [availableArtists, setAvailableArtists] = useState<AvailableArtist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [initialArtistLoaded, setInitialArtistLoaded] = useState(false);

  const [pendingData, setPendingData] = useState<CreateBookingData | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

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
      setNotes(booking.notes || '');

      const perc = (booking.formData)?.artistPercentage;
      if (perc != null) {
        const found = (PERCENTUALE_OPTIONS_VALUES as readonly string[]).includes(perc.toString());
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

  useEffect(() => {
    if (templates && templates.length > 0 && selectedTemplateId === null) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates]);

  const activeTemplate = templates?.find((t) => t.id === selectedTemplateId) ?? null;

  const dynamicFields = useMemo<FieldDef[]>(() => {
    if (!activeTemplate) return [];
    try {
      const jsonStr = atob(activeTemplate.schemaB64);
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }, [activeTemplate]);

  const artistOptions = useMemo(() => {
    const available = availableArtists.map((a) => ({
      value: a.id.toString(),
      label: a.name,
    }));

    if (booking?.id && booking?.artist && artistId && !available.find((a) => a.value === artistId)) {
      available.unshift({
        value: booking.artist.id.toString(),
        label: booking.artist.name,
      });
    }

    return available;
  }, [availableArtists, booking?.id, booking?.artist, artistId]);

  const customerOptions = useMemo(() => (customers || []).map((c) => ({
    value: c.id.toString(),
    label: `${c.firstName} ${c.lastName}`,
  })), [customers]);

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
    setNotes('');
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
      notes: notes.trim() || undefined,
      formData,
    };

    const validationError = validateData(createBookingSchema, data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (booking?.id) {
      setPendingData(data);
      setShowPasswordModal(true);
    } else {
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
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Sezione data/ora + partecipanti */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BookingDateTimeSection
            date={date}
            time={time}
            duration={duration}
            onDateChange={setDate}
            onTimeChange={setTime}
            onDurationChange={setDuration}
          />
          <BookingParticipantsSection
            date={date}
            time={time}
            customerId={customerId}
            artistId={artistId}
            loadingArtists={loadingArtists}
            customerOptions={customerOptions}
            artistOptions={artistOptions}
            noArtistAvailable={availableArtists.length === 0}
            onCustomerChange={setCustomerId}
            onArtistChange={setArtistId}
          />
        </div>

        <div className="h-px bg-white/[0.06]" />

        <BookingFinancialSection
          price={price}
          deposit={deposit}
          percentualeMode={percentualeMode}
          customPercentuale={customPercentuale}
          prezzoArtista={prezzoArtista}
          guadagno={guadagno}
          onPriceChange={setPrice}
          onDepositChange={setDeposit}
          onPercentualeModeChange={setPercentualeMode}
          onCustomPercentualeChange={setCustomPercentuale}
        />

        {templates && templates.length > 1 && (
          <>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-center gap-3">
              <label htmlFor="template-select" className="text-[11px] font-bold text-accent uppercase tracking-widest whitespace-nowrap">
                Schema campi
              </label>
              <select
                id="template-select"
                value={selectedTemplateId ?? ''}
                onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
                className="flex-1 rounded-xl border border-surface-border bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent transition-all"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0a1a26]">{t.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <BookingDynamicFieldsSection
          fields={dynamicFields}
          values={dynamicValues}
          onChange={handleDynamicChange}
        />

        <div className="h-px bg-white/[0.06]" />

        {/* Note */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Note interne</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Aggiungi note sull'appuntamento..."
            rows={3}
            className="w-full rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
          />
        </div>

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
