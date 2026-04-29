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
import { useEffect, useMemo, useReducer, useState } from 'react';
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

interface BookingFormState {
  // Basic booking data
  customerId: string;
  artistId: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  deposit: string;
  percentualeMode: string;
  customPercentuale: string;
  notes: string;
  dynamicValues: Record<string, string>;
  status: BookingStatus;
  // UI states
  loading: boolean;
  availableArtists: AvailableArtist[];
  loadingArtists: boolean;
  initialArtistLoaded: boolean;
  pendingData: CreateBookingData | null;
  showPasswordModal: boolean;
  passwordLoading: boolean;
  selectedTemplateId: number | null;
}

type BookingFormAction = 
  | { type: 'SET_FIELD'; field: keyof Omit<BookingFormState, 'dynamicValues' | 'availableArtists' | 'pendingData'>; payload: string | boolean | number | BookingStatus | null }
  | { type: 'SET_DYNAMIC_VALUES'; payload: Record<string, string> }
  | { type: 'UPDATE_DYNAMIC_VALUE'; payload: { name: string; value: string } }
  | { type: 'SET_AVAILABLE_ARTISTS'; payload: AvailableArtist[] }
  | { type: 'SET_PENDING_DATA'; payload: CreateBookingData | null }
  | { type: 'RESET_FORM'; payload?: { initialDate?: string; initialTime?: string } }
  | { type: 'LOAD_BOOKING'; payload: { booking: Booking; isOpen: boolean } };

const initialFormState: BookingFormState = {
  customerId: '',
  artistId: '',
  date: '',
  time: '',
  duration: '120',
  price: '',
  deposit: '',
  percentualeMode: '50',
  customPercentuale: '',
  notes: '',
  dynamicValues: {},
  status: 'CONFIRMED',
  loading: false,
  availableArtists: [],
  loadingArtists: false,
  initialArtistLoaded: false,
  pendingData: null,
  showPasswordModal: false,
  passwordLoading: false,
  selectedTemplateId: null,
};

function bookingFormReducer(state: BookingFormState, action: BookingFormAction): BookingFormState {
  switch (action.type) {
    case 'SET_FIELD': {
      const { field, payload } = action;
      return { ...state, [field]: payload };
    }
    case 'SET_DYNAMIC_VALUES':
      return { ...state, dynamicValues: action.payload };
    case 'UPDATE_DYNAMIC_VALUE':
      return {
        ...state,
        dynamicValues: {
          ...state.dynamicValues,
          [action.payload.name]: action.payload.value,
        },
      };
    case 'SET_AVAILABLE_ARTISTS':
      return { ...state, availableArtists: action.payload };
    case 'SET_PENDING_DATA':
      return { ...state, pendingData: action.payload };
    case 'RESET_FORM':
      return {
        ...initialFormState,
        date: action.payload?.initialDate || '',
        time: action.payload?.initialTime || '',
      };
    case 'LOAD_BOOKING': {
      const { booking, isOpen } = action.payload;
      if (booking && isOpen) {
        const d = new Date(booking.date);
        const perc = booking.formData?.artistPercentage;
        let percentualeMode = '50';
        let customPercentuale = '';
        if (perc != null) {
          const found = (PERCENTUALE_OPTIONS_VALUES as readonly string[]).includes(perc.toString());
          if (found) {
            percentualeMode = perc.toString();
          } else {
            percentualeMode = 'custom';
            customPercentuale = perc.toString();
          }
        }
        return {
          ...state,
          customerId: booking.customerId.toString(),
          artistId: booking.artistId.toString(),
          date: format(d, 'yyyy-MM-dd'),
          time: format(d, 'HH:mm'),
          duration: booking.duration?.toString() || '120',
          price: booking.price?.toString() || '',
          deposit: booking.deposit?.toString() || '',
          notes: booking.notes || '',
          percentualeMode,
          customPercentuale,
          dynamicValues: booking.formData as Record<string, string> || {},
          status: booking.status ?? 'CONFIRMED',
          initialArtistLoaded: true,
        };
      } else if (!booking && isOpen) {
        return { ...initialFormState, initialArtistLoaded: false };
      }
      return state;
    }
    default:
      return state;
  }
}

export default function BookingModal({ isOpen, onClose, onSuccess, booking, initialDate, initialTime }: Props) {
  const toast = useToast();
  const theme = useTheme();
  const { isSuperAdmin } = useAuth();
  const [formState, dispatch] = useReducer(bookingFormReducer, initialFormState);

  const { data: customerResult } = useCustomers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen });
  const { data: templates } = useFormTemplates();
  const customers = customerResult?.data;

  // Load booking or reset form when modal opens/booking changes
  useEffect(() => {
    if (booking && isOpen) {
      dispatch({ type: 'LOAD_BOOKING', payload: { booking, isOpen } });
    } else if (!booking && isOpen) {
      dispatch({ type: 'RESET_FORM', payload: { initialDate, initialTime } });
    }
  }, [booking, isOpen, initialDate, initialTime]);

  // Fetch available artists when date/time changes
  useEffect(() => {
    if (formState.date && formState.time && isOpen) {
      const fetchAvailable = async () => {
        dispatch({ type: 'SET_FIELD', field: 'loadingArtists', payload: true });
        try {
          const isoDate = new Date(`${formState.date}T${formState.time}`).toISOString();
          const data = await bookingService.getAvailableArtists(isoDate);
          dispatch({ type: 'SET_AVAILABLE_ARTISTS', payload: data });

          if (!booking?.id && formState.artistId && !data.find((a: AvailableArtist) => a.id.toString() === formState.artistId)) {
            dispatch({ type: 'SET_FIELD', field: 'artistId', payload: '' });
          }
        } catch (err) {
          toast.error(extractErrorMessage(err, 'Errore nel recupero artisti disponibili'));
        } finally {
          dispatch({ type: 'SET_FIELD', field: 'loadingArtists', payload: false });
        }
      };
      fetchAvailable();
    } else {
      dispatch({ type: 'SET_AVAILABLE_ARTISTS', payload: [] });
      if (!formState.initialArtistLoaded) {
        dispatch({ type: 'SET_FIELD', field: 'artistId', payload: '' });
      }
    }
  }, [formState.date, formState.time, isOpen, booking?.id, formState.artistId, formState.initialArtistLoaded]);

  // Initialize template selection
  useEffect(() => {
    if (templates && templates.length > 0 && formState.selectedTemplateId === null) {
      dispatch({ type: 'SET_FIELD', field: 'selectedTemplateId', payload: templates[0].id });
    }
  }, [templates, formState.selectedTemplateId]);

  const activeTemplate = templates?.find((t) => t.id === formState.selectedTemplateId) ?? null;

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
    const available = formState.availableArtists.map((a) => ({
      value: a.id.toString(),
      label: a.name,
    }));

    if (booking?.id && booking?.artist && formState.artistId && !available.find((a) => a.value === formState.artistId)) {
      available.unshift({
        value: booking.artist.id.toString(),
        label: booking.artist.name,
      });
    }

    return available;
  }, [formState.availableArtists, booking?.id, booking?.artist, formState.artistId]);

  const customerOptions = useMemo(() => (customers || []).map((c) => ({
    value: c.id.toString(),
    label: `${c.firstName} ${c.lastName}`,
  })), [customers]);

  const percentuale = formState.percentualeMode === 'custom'
    ? Number(formState.customPercentuale) || 0
    : Number(formState.percentualeMode) || 0;

  const prezzoNum = Number(formState.price) || 0;
  const prezzoArtista = Math.round((prezzoNum * percentuale / 100) * 100) / 100;
  const guadagno = Math.round((prezzoNum - prezzoArtista) * 100) / 100;

  const handleDynamicChange = (name: string, value: string) => {
    dispatch({ type: 'UPDATE_DYNAMIC_VALUE', payload: { name, value } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.customerId || !formState.artistId || !formState.date || !formState.time) {
      toast.error('Campi mancanti');
      return;
    }

    const bookingDate = new Date(`${formState.date}T${formState.time}`).toISOString();

    const formData: Record<string, unknown> = {};
    formData.artistPercentage = percentuale;
    formData.artistPrice = prezzoArtista;
    formData.studioProfit = guadagno;
    for (const field of dynamicFields) {
      const val = formState.dynamicValues[field.name];
      if (val) formData[field.name] = val;
    }

    const data: CreateBookingData = {
      customerId: Number(formState.customerId),
      artistId: Number(formState.artistId),
      date: bookingDate,
      duration: Number(formState.duration) || undefined,
      price: prezzoNum || undefined,
      deposit: Number(formState.deposit) || undefined,
      notes: formState.notes.trim() || undefined,
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
        dispatch({ type: 'SET_PENDING_DATA', payload: { ...data, status: formState.status } as CreateBookingData });
        dispatch({ type: 'SET_FIELD', field: 'showPasswordModal', payload: true });
      }
    } else {
      await executeBookingCreate(data);
    }
  };

  const executeBookingCreate = async (data: CreateBookingData, skipPassword = false) => {
    dispatch({ type: 'SET_FIELD', field: 'loading', payload: true });
    try {
      if (booking?.id) {
        await bookingService.update(booking.id, data);
        toast.success('Prenotazione aggiornata!');
      } else {
        await bookingService.create(data);
        toast.success('Prenotazione confermata!');
      }
      dispatch({ type: 'RESET_FORM' });
      await onSuccess?.();
      onClose();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, booking?.id ? 'Errore nell\'aggiornamento' : 'Errore nella prenotazione'));
    } finally {
      dispatch({ type: 'SET_FIELD', field: 'loading', payload: false });
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    dispatch({ type: 'SET_FIELD', field: 'passwordLoading', payload: true });
    try {
      await bookingService.verifyPassword(password);
      dispatch({ type: 'SET_FIELD', field: 'showPasswordModal', payload: false });
      dispatch({ type: 'SET_PENDING_DATA', payload: null });
      if (formState.pendingData) {
        await executeBookingCreate(formState.pendingData);
      }
    } catch (error: unknown) {
      throw new Error('Password non corretta');
    } finally {
      dispatch({ type: 'SET_FIELD', field: 'passwordLoading', payload: false });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={booking ? 'Modifica Prenotazione' : 'Nuova Prenotazione'} maxWidth="lg">
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} onSubmit={handleSubmit}>
        {/* Sezione data/ora + partecipanti */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
          <BookingDateTimeSection
            date={formState.date}
            time={formState.time}
            duration={formState.duration}
            onDateChange={(val) => dispatch({ type: 'SET_FIELD', field: 'date', payload: val })}
            onTimeChange={(val) => dispatch({ type: 'SET_FIELD', field: 'time', payload: val })}
            onDurationChange={(val) => dispatch({ type: 'SET_FIELD', field: 'duration', payload: val })}
          />
          <BookingParticipantsSection
            date={formState.date}
            time={formState.time}
            customerId={formState.customerId}
            artistId={formState.artistId}
            loadingArtists={formState.loadingArtists}
            customerOptions={customerOptions}
            artistOptions={artistOptions}
            noArtistAvailable={formState.availableArtists.length === 0}
            onCustomerChange={(val) => dispatch({ type: 'SET_FIELD', field: 'customerId', payload: val })}
            onArtistChange={(val) => dispatch({ type: 'SET_FIELD', field: 'artistId', payload: val })}
          />
        </Box>

        <Box sx={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

        <BookingFinancialSection
          price={formState.price}
          deposit={formState.deposit}
          percentualeMode={formState.percentualeMode}
          customPercentuale={formState.customPercentuale}
          prezzoArtista={prezzoArtista}
          guadagno={guadagno}
          onPriceChange={(val) => dispatch({ type: 'SET_FIELD', field: 'price', payload: val })}
          onDepositChange={(val) => dispatch({ type: 'SET_FIELD', field: 'deposit', payload: val })}
          onPercentualeModeChange={(val) => dispatch({ type: 'SET_FIELD', field: 'percentualeMode', payload: val })}
          onCustomPercentualeChange={(val) => dispatch({ type: 'SET_FIELD', field: 'customPercentuale', payload: val })}
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
                value={formState.selectedTemplateId ?? ''}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'selectedTemplateId', payload: Number(e.target.value) })}
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
          values={formState.dynamicValues}
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
                  onClick={() => dispatch({ type: 'SET_FIELD', field: 'status', payload: opt.value })}
                  sx={{
                    px: 1.5,
                    py: 0.625,
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: `1px solid ${formState.status === opt.value ? `${opt.palette.main}99` : 'rgba(255, 255, 255, 0.1)'}`,
                    backgroundColor: formState.status === opt.value ? `${opt.palette.main}1a` : 'rgba(255, 255, 255, 0.05)',
                    color: formState.status === opt.value ? opt.palette.main : theme.palette.text.secondary,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: formState.status === opt.value ? `${opt.palette.main}99` : 'rgba(255, 255, 255, 0.25)',
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
            value={formState.notes}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'notes', payload: e.target.value })}
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

        <SubmitButton loading={formState.loading} label={booking ? 'Salva Modifiche' : 'Conferma Prenotazione'} />
      </Box>

      {!isSuperAdmin && (
        <PasswordConfirmModal
          isOpen={formState.showPasswordModal}
          onClose={() => {
            dispatch({ type: 'SET_FIELD', field: 'showPasswordModal', payload: false });
            dispatch({ type: 'SET_PENDING_DATA', payload: null });
          }}
          onConfirm={handlePasswordConfirm}
          loading={formState.passwordLoading}
        />
      )}
    </Modal>
  );
}
