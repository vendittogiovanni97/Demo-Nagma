"use client";

import { PERCENTUALE_OPTIONS_VALUES } from '@/config/booking-config';
import { EXPORT_FETCH_LIMIT } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useCustomers } from '@/hooks/domain/useCustomers';
import { useFormTemplates } from '@/hooks/domain/useFormTemplates';
import { useToast } from '@/hooks/useToast';
import { createBookingSchema } from '@/schemas/booking';
import { bookingService } from '@/services/booking.service';
import type { Booking, BookingStatus, CreateBookingData } from '@/types/booking';
import type { FieldDef } from '@/types/form-template';
import { extractErrorMessage } from '@/utils/extract-error';
import { validateData } from '@/utils/validation';
import { Box, useTheme } from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import SubmitButton from '../forms/SubmitButton';
import Modal from './Modal';
import PasswordConfirmModal from './PasswordConfirmModal';
import BookingDateTimeSection from './booking/BookingDateTimeSection';
import BookingDynamicFieldsSection from './booking/BookingDynamicFieldsSection';
import BookingFinancialSection from './booking/BookingFinancialSection';
import BookingParticipantsSection from './booking/BookingParticipantsSection';

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
  const theme = useTheme();
  const { isSuperAdmin } = useAuth();
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
  const [status, setStatus] = useState<BookingStatus>('CONFIRMED');
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
      setStatus(booking.status ?? 'CONFIRMED');
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
    setStatus('CONFIRMED');
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
      if (isSuperAdmin) {
        await executeBookingCreate(data, true);
      } else {
        setPendingData({ ...data, status } as CreateBookingData);
        setShowPasswordModal(true);
      }
    } else {
      await executeBookingCreate(data);
    }
  };

  const executeBookingCreate = async (data: CreateBookingData, skipPassword = false) => {
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
    <Modal isOpen={isOpen} onClose={onClose} title={booking ? 'Modifica Prenotazione' : 'Nuova Prenotazione'} maxWidth="lg">
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} onSubmit={handleSubmit}>
        {/* Sezione data/ora + partecipanti */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
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
        </Box>

        <Box sx={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

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

        <Box sx={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

        {templates && templates.length > 1 && (
          <>
            <Box sx={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="label"
                htmlFor="template-select"
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap'
                }}
              >
                Schema campi
              </Box>
              <Box
                component="select"
                id="template-select"
                value={selectedTemplateId ?? ''}
                onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
                sx={{
                  flex: 1,
                  borderRadius: 10,
                  border: `1px solid rgba(0, 191, 255, 0.2)`,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  px: 1.25,
                  py: 1,
                  fontSize: '0.8125rem',
                  color: theme.palette.text.primary,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'rgba(0, 191, 255, 0.4)'
                  },
                  '&:focus': {
                    outline: 'none',
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 3px rgba(0, 191, 255, 0.1)`
                  },
                  '& option': {
                    backgroundColor: '#0a1a26',
                    color: theme.palette.text.primary
                  }
                }}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Box>
            </Box>
          </>
        )}

        <BookingDynamicFieldsSection
          fields={dynamicFields}
          values={dynamicValues}
          onChange={handleDynamicChange}
        />

        <Box sx={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

        {/* Stato — solo in modifica */}
        {booking?.id && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Box
              component="span"
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              Stato prenotazione
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {([
                { value: 'CONFIRMED' as const, label: 'Confermato', palette: theme.palette.primary },
                { value: 'COMPLETED' as const, label: 'Completato', palette: theme.palette.success },
                { value: 'RESCHEDULED' as const, label: 'Spostato', palette: theme.palette.warning },
                { value: 'CANCELLED' as const, label: 'Annullato', palette: theme.palette.error },
              ]).map((opt) => (
                <Box
                  key={opt.value}
                  component="button"
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  sx={{
                    px: 1.5,
                    py: 0.625,
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: `1px solid ${status === opt.value ? `${opt.palette.main}99` : 'rgba(255, 255, 255, 0.1)'}`,
                    backgroundColor: status === opt.value ? `${opt.palette.main}1a` : 'rgba(255, 255, 255, 0.05)',
                    color: status === opt.value ? opt.palette.main : theme.palette.text.secondary,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: status === opt.value ? `${opt.palette.main}99` : 'rgba(255, 255, 255, 0.25)',
                    }
                  }}
                >
                  {opt.label}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

        {/* Note */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="span"
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              Note interne
            </Box>
          </Box>
          <Box
            component="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Aggiungi note sull'appuntamento..."
            rows={3}
            sx={{
              width: '100%',
              borderRadius: '8px',
              border: `1px solid rgba(0, 191, 255, 0.2)`,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              px: 1.5,
              py: 1,
              fontSize: '0.8125rem',
              color: theme.palette.text.primary,
              '&::placeholder': {
                color: 'rgba(176, 176, 176, 0.4)'
              },
              outline: 'none',
              transition: 'all 0.3s ease',
              resize: 'none',
              fontFamily: 'inherit',
              '&:focus': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 3px rgba(0, 191, 255, 0.1)`
              },
              '&:hover': {
                borderColor: 'rgba(0, 191, 255, 0.4)'
              }
            }}
          />
        </Box>

        <SubmitButton loading={loading} label={booking ? 'Salva Modifiche' : 'Conferma Prenotazione'} />
      </Box>

      {!isSuperAdmin && (
        <PasswordConfirmModal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setPendingData(null);
          }}
          onConfirm={handlePasswordConfirm}
          loading={passwordLoading}
        />
      )}
    </Modal>
  );
}
