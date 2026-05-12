"use client";

import {
  Box,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useMemo, useReducer, useState } from 'react';

// Consensus Integration
import ConsentModal from '@/modules/newfeature/consenso/components/ConsentModal';
import ConsentStatusBadge from '@/modules/newfeature/consenso/components/ConsentStatusBadge';
import { useConsentConfig } from '@/modules/newfeature/consenso/hooks/useConsentConfig';
import { configService } from '@/shared/services/config.service';
// Components
import SmartModal from '@/components/common/SmartModal';
import FormAutocomplete from '@/components/forms/FormAutocomplete';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import PasswordConfirmModal from '@/components/modals/PasswordConfirmModal';

// Types & Config
import { EXPORT_FETCH_LIMIT } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import type { Booking, BookingStatus, CreateBookingData } from '@/modules/booking/model/booking.types';
import { customerApi as customerService } from '@/modules/customer/api/customer.api';
import { useCustomers } from '@/modules/customer/hooks/useCustomer';
import { useFormTemplates } from '@/modules/form-templates/hooks/useFormTemplates';
import type { FieldDef } from '@/modules/form-templates/model/form-template.types';
import { staffApi as staffService } from '@/modules/staff/api/staff.api';
import { extractErrorMessage } from '@/shared/utils/extract-error';
import { bookingApi as bookingService } from '../../api/booking.api';
import { PERCENTUALE_OPTIONS_VALUES } from '../../hooks/booking-config';

export interface ArtistOption {
  id: number;
  name: string;
  color?: string;
}

export interface BookingFormState {
  customerId: string;
  artistId: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  deposit: string;
  percentualeMode: string;
  notes: string;
  dynamicValues: Record<string, string>;
  status: BookingStatus;
  isNewCustomer: boolean;
  newCustomerFirstName: string;
  newCustomerLastName: string;
  newCustomerPhone: string;
  newCustomerEmail: string;
  loading: boolean;
  artists: ArtistOption[];
  loadingArtists: boolean;
  initialArtistLoaded: boolean;
  pendingData: (CreateBookingData & { status?: BookingStatus }) | null;
  showPasswordModal: boolean;
  passwordLoading: boolean;
  selectedTemplateId: number | null;
}

export type BookingFormAction =
  | { type: 'SET_FIELD'; field: keyof BookingFormState; payload: BookingFormState[keyof BookingFormState] }
  | { type: 'SET_DYNAMIC_VALUES'; payload: Record<string, string> }
  | { type: 'UPDATE_DYNAMIC_VALUE'; payload: { name: string; value: string } }
  | { type: 'SET_ARTISTS'; payload: ArtistOption[] }
  | { type: 'SET_PENDING_DATA'; payload: (CreateBookingData & { status?: BookingStatus }) | null }
  | { type: 'RESET_FORM'; payload?: { initialDate?: string; initialTime?: string } }
  | { type: 'LOAD_BOOKING'; payload: { booking: Booking; isOpen: boolean } };

const DURATION_OPTIONS = Array.from({ length: 32 }, (_, i) => {
  const minutes = (i + 1) * 30;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  let label = hours > 0 ? `${hours}h` : '';
  if (remainingMinutes > 0) label += hours > 0 ? ` ${remainingMinutes}m` : `${remainingMinutes} min`;
  return { value: minutes.toString(), label: label.trim() };
});

const PERCENTUALE_OPTIONS = [
  { value: '0', label: '0%' },
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
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  booking?: Booking | null;
  initialDate?: string;
  initialTime?: string;
}

const initialFormState: BookingFormState = {
  customerId: '',
  artistId: '',
  date: '',
  time: '',
  duration: '120',
  price: '',
  deposit: '',
  percentualeMode: '50',
  notes: '',
  dynamicValues: {},
  status: 'CONFERMATO',
  isNewCustomer: false,
  newCustomerFirstName: '',
  newCustomerLastName: '',
  newCustomerPhone: '',
  newCustomerEmail: '',
  loading: false,
  artists: [],
  loadingArtists: false,
  initialArtistLoaded: false,
  pendingData: null,
  showPasswordModal: false,
  passwordLoading: false,
  selectedTemplateId: null,
};

function bookingFormReducer(state: BookingFormState, action: BookingFormAction): BookingFormState {
  switch (action.type) {
    case 'SET_FIELD': return { ...state, [action.field]: action.payload } as BookingFormState;
    case 'SET_DYNAMIC_VALUES': return { ...state, dynamicValues: action.payload };
    case 'UPDATE_DYNAMIC_VALUE':
      return { ...state, dynamicValues: { ...state.dynamicValues, [action.payload.name]: action.payload.value } };
    case 'SET_ARTISTS': return { ...state, artists: action.payload };
    case 'SET_PENDING_DATA': return { ...state, pendingData: action.payload };
    case 'RESET_FORM':
      return {
        ...initialFormState,
        artists: state.artists,
        loadingArtists: state.loadingArtists,
        initialArtistLoaded: state.initialArtistLoaded,
        date: action.payload?.initialDate || '',
        time: action.payload?.initialTime || ''
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
          if (found) percentualeMode = perc.toString();
          else { percentualeMode = 'CUSTOM'; customPercentuale = perc.toString(); }
        }
        let preLoadedArtists: ArtistOption[] = [];
        if (booking.artist) preLoadedArtists = [{ id: booking.artist.id, name: booking.artist.name, color: booking.artist.color }];
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
          dynamicValues: booking.formData as Record<string, string> || {},
          status: booking.status ?? 'CONFERMATO',
          artists: state.artists.length > 0 ? state.artists : preLoadedArtists,
          initialArtistLoaded: state.artists.length > 0 || state.initialArtistLoaded,
        };
      }
      return state;
    }
    default: return state;
  }
}

export default function BookingModal({ isOpen, onClose, onSuccess, booking, initialDate, initialTime }: Props) {
  const toast = useToast();
  const theme = useTheme();
  const { isSuperAdmin } = useAuth();
  const [formState, dispatch] = useReducer(bookingFormReducer, initialFormState);

  // Consensus & Placement States
  const { SHOW_CONSENSI, SHOW_POSIZIONAMENTO } = useConsentConfig();
  const [consentOpen, setConsentOpen] = useState(false);

  const { data: customerResult, isLoading: customersLoading, mutate: mutateCustomers } = useCustomers({ page: 1, limit: EXPORT_FETCH_LIMIT });
  const { data: templates } = useFormTemplates();
  const customers = customerResult?.data;

  useEffect(() => {
    if (isOpen) {
      if (booking) {
        dispatch({ type: 'LOAD_BOOKING', payload: { booking, isOpen } });
      } else {
        dispatch({ type: 'RESET_FORM', payload: { initialDate, initialTime } });
      }
    }
  }, [booking?.id, isOpen, initialDate, initialTime]);

  useEffect(() => {
    let mounted = true;
    if (isOpen) {
      const fetchAllArtists = async () => {
        if (formState.artists.length > 1) return;
        dispatch({ type: 'SET_FIELD', field: 'loadingArtists', payload: true });
        try {
          const data = await staffService.getAllForSelect();
          if (!mounted) return;
          dispatch({ type: 'SET_ARTISTS', payload: data.map(m => ({ id: m.id, name: m.name, color: m.color || '#00bfff' })) });
          dispatch({ type: 'SET_FIELD', field: 'initialArtistLoaded', payload: true });
        } catch (err) {
          if (mounted) toast.error(extractErrorMessage(err, 'Errore artisti'));
        } finally {
          if (mounted) dispatch({ type: 'SET_FIELD', field: 'loadingArtists', payload: false });
        }
      };
      fetchAllArtists();
    }
    return () => { mounted = false; };
  }, [isOpen]);

  useEffect(() => {
    if (templates && templates.length > 0 && formState.selectedTemplateId === null) {
      dispatch({ type: 'SET_FIELD', field: 'selectedTemplateId', payload: templates[0].id });
    }
  }, [templates, formState.selectedTemplateId]);

  const activeTemplate = templates?.find((t) => t.id === formState.selectedTemplateId) ?? null;
  const dynamicFields = useMemo<FieldDef[]>(() => {
    if (!activeTemplate) return [];
    try { return JSON.parse(atob(activeTemplate.schemaB64)); } catch { return []; }
  }, [activeTemplate]);

  const artistOptions = useMemo(() => {
    const available = formState.artists.map((a) => ({ value: a.id.toString(), label: a.name }));
    if (booking?.id && formState.artistId && !available.find((a) => a.value === formState.artistId)) {
      available.unshift({ value: formState.artistId, label: booking?.artist?.name || `Artista #${formState.artistId}` });
    }
    return available;
  }, [formState.artists, booking, formState.artistId]);

  const customerOptions = useMemo(() => (customers || []).map((c) => ({
    value: c.id.toString(), label: `${c.firstName} ${c.lastName}`
  })), [customers]);

  const percentuale = Number(formState.percentualeMode) || 0;
  const prezzoNum = Number(formState.price) || 0;
  const prezzoArtista = Math.round((prezzoNum * percentuale / 100) * 100) / 100;
  const guadagno = Math.round((prezzoNum - prezzoArtista) * 100) / 100;

  const handleSave = async () => {
    if (!formState.customerId && !formState.isNewCustomer) { toast.error('Seleziona un cliente'); return; }
    if (!formState.artistId || !formState.date || !formState.time) { toast.error('Campi obbligatori mancanti'); return; }

    const bookingDate = new Date(`${formState.date}T${formState.time}`).toISOString();
    const formData: Record<string, unknown> = { artistPercentage: percentuale, artistPrice: prezzoArtista, studioProfit: guadagno };
    Object.entries(formState.dynamicValues).forEach(([k, v]) => { if (v) formData[k] = v; });

    let customerId = formState.customerId;
    if (formState.isNewCustomer) {
      if (!formState.newCustomerFirstName || !formState.newCustomerLastName || !formState.newCustomerPhone) { toast.error('Dati nuovo cliente mancanti'); return; }
      dispatch({ type: 'SET_FIELD', field: 'loading', payload: true });
      try {
        let cleanPhone = formState.newCustomerPhone.trim().replace(/\s+/g, '');
        if (cleanPhone && !cleanPhone.startsWith('+') && !cleanPhone.startsWith('00')) {
          try {
            const res = await configService.getConfig();
            const prefix = res.DEFAULT_PHONE_PREFIX || '+39';
            cleanPhone = prefix + cleanPhone;
          } catch {
            cleanPhone = '+39' + cleanPhone;
          }
        }

        const newCustomer = await customerService.create({
          firstName: formState.newCustomerFirstName,
          lastName: formState.newCustomerLastName,
          phone: cleanPhone,
          email: formState.newCustomerEmail.trim() || undefined
        });
        customerId = newCustomer.id.toString();
        await mutateCustomers();
      } catch { toast.error('Errore creazione cliente'); dispatch({ type: 'SET_FIELD', field: 'loading', payload: false }); return; }
    }

    const data: CreateBookingData & { status?: BookingStatus } = {
      customerId: Number(customerId), artistId: Number(formState.artistId), date: bookingDate,
      duration: Number(formState.duration) || undefined, price: prezzoNum || undefined,
      deposit: Number(formState.deposit) || undefined, notes: formState.notes.trim() || undefined, formData,
      status: formState.status,
    };

    if (booking?.id && !isSuperAdmin) {
      dispatch({ type: 'SET_PENDING_DATA', payload: data });
      dispatch({ type: 'SET_FIELD', field: 'showPasswordModal', payload: true });
    } else {
      await executeBookingAction(data);
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const executeBookingAction = async (data: CreateBookingData & { status?: BookingStatus }) => {
    dispatch({ type: 'SET_FIELD', field: 'loading', payload: true });
    try {
      let saved: any = null;
      if (booking?.id) {
        saved = await bookingService.update(booking.id, data);
      } else {
        saved = await bookingService.create(data);
      }

      setShowSuccess(true);
      await onSuccess?.();

      // Delay closing to show animation
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Errore'));
      dispatch({ type: 'SET_FIELD', field: 'loading', payload: false });
    }
  };

  return (
    <>
      <SmartModal
        isOpen={isOpen} onClose={onClose} onSave={handleSave} isSaving={formState.loading} maxWidth="lg"
        title={booking ? 'Modifica Prenotazione' : 'Nuova Prenotazione'}
        saveLabel={booking ? 'Salva Modifiche' : 'Conferma Prenotazione'}
        headerAction={!booking && (
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={formState.isNewCustomer}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'isNewCustomer', payload: e.target.checked })}
                sx={styles.switch}
              />
            }
            label={<Typography sx={styles.switchLabel(formState.isNewCustomer)}>Nuovo Cliente</Typography>}
            sx={{ m: 0, flexDirection: 'row', gap: 1 }}
          />
        )}
      >
        <Box sx={styles.container}>
          <Grid container rowSpacing={5} columnSpacing={2.5}>
            {/* ROW 1: CUSTOMER DETAILS (DISABLED) IF EDITING */}
            {booking && (
              <Grid size={12}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormInput label="Nome" value={booking.customer?.firstName || ''} disabled size="sm" onChange={() => {}} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormInput label="Cognome" value={booking.customer?.lastName || ''} disabled size="sm" onChange={() => {}} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormInput label="Telefono" value={booking.customer?.phone || ''} disabled size="sm" onChange={() => {}} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormInput label="Email" value={booking.customer?.email || '—'} disabled size="sm" onChange={() => {}} />
                  </Grid>

                  {/* Informed Consent Status Row (Conditional Feature Flag check) */}
                  {SHOW_CONSENSI && isSuperAdmin && (
                    <Grid size={12}>
                      <Box sx={{
                        mt: 1.5,
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', fontSize: '0.8rem' }}>
                            Consenso Informato Digitale
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                            Modulo sanitario e firma grafica per l'inizio del tatuaggio
                          </Typography>
                        </Box>
                        <ConsentStatusBadge booking={booking} onClick={() => setConsentOpen(true)} />
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )}

            {/* ROW 2: CUSTOMER SELECTION IF NEW */}
            {!booking && (
              <>
                {!formState.isNewCustomer && (
                  <Grid size={12}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <FormAutocomplete
                          label="Cerca Cliente *" value={formState.customerId}
                          onChange={(val) => dispatch({ type: 'SET_FIELD', field: 'customerId', payload: val })}
                          disabled={customersLoading}
                          loading={customersLoading}
                          placeholder="Cerca per nome o telefono..."
                          options={customerOptions}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {/* NEW CUSTOMER FIELDS (ONLY VISIBLE IF TOGGLE IS ON) */}
                {formState.isNewCustomer && (
                  <Grid size={12}>
                    <Box sx={styles.newCustomerFields(true)}>
                      <Grid container spacing={2}>
                        <Grid size={3}>
                          <FormInput label="Nome *" value={formState.newCustomerFirstName} onChange={(v)=>dispatch({type:'SET_FIELD',field:'newCustomerFirstName',payload:v})} size="sm" placeholder="Nome" />
                        </Grid>
                        <Grid size={3}>
                          <FormInput label="Cognome *" value={formState.newCustomerLastName} onChange={(v)=>dispatch({type:'SET_FIELD',field:'newCustomerLastName',payload:v})} size="sm" placeholder="Cognome" />
                        </Grid>
                        <Grid size={3}>
                          <FormInput label="Telefono *" value={formState.newCustomerPhone} onChange={(v)=>dispatch({type:'SET_FIELD',field:'newCustomerPhone',payload:v})} size="sm" placeholder="Telefono" />
                        </Grid>
                        <Grid size={3}>
                          <FormInput label="Email" value={formState.newCustomerEmail} onChange={(v)=>dispatch({type:'SET_FIELD',field:'newCustomerEmail',payload:v})} size="sm" type="email" placeholder="Email" />
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                )}
              </>
            )}

            {/* MAIN DATA ROW */}
            <Grid size={12}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormSelect
                    label="Artista *" value={formState.artistId}
                    onChange={(val) => dispatch({ type: 'SET_FIELD', field: 'artistId', payload: val })}
                    disabled={formState.loadingArtists}
                    placeholder="Seleziona..."
                    options={artistOptions}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <FormInput label="Data *" type="date" value={formState.date} onChange={(v)=>dispatch({type:'SET_FIELD',field:'date',payload:v})} size="sm" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <FormInput label="Ora *" type="time" value={formState.time} onChange={(v)=>dispatch({type:'SET_FIELD',field:'time',payload:v})} size="sm" />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormSelect label="Durata" value={formState.duration} onChange={(v)=>dispatch({type:'SET_FIELD',field:'duration',payload:v})} options={DURATION_OPTIONS} />
                </Grid>
              </Grid>
            </Grid>

            {/* ECONOMIC ROW */}
            <Grid size={12}>
              <Grid container spacing={2} sx={{ alignItems: 'flex-end' }}>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <FormInput label="Prezzo" type="number" value={formState.price} onChange={(v)=>dispatch({type:'SET_FIELD',field:'price',payload:v})} size="sm" placeholder="€" />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <FormInput label="Acconto" type="number" value={formState.deposit} onChange={(v)=>dispatch({type:'SET_FIELD',field:'deposit',payload:v})} size="sm" placeholder="€" />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <FormSelect label="% Artista" value={formState.percentualeMode} onChange={(v)=>dispatch({type:'SET_FIELD',field:'percentualeMode',payload:v})} options={PERCENTUALE_OPTIONS} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={styles.resultBoxArtist}>
                    <Typography sx={styles.resultLabelArtist}>Artista</Typography>
                    <Typography sx={styles.resultValueArtist}>€{prezzoArtista.toFixed(2)}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={styles.resultBoxStudio}>
                    <Typography sx={styles.resultLabelStudio}>Studio</Typography>
                    <Typography sx={styles.resultValueStudio}>€{guadagno.toFixed(2)}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* DYNAMIC FIELDS ROW */}
            <Grid size={12}>
              {templates && templates.length > 1 && (
                <Box sx={{ mb: 1, maxWidth: 200 }}>
                  <FormSelect label="Template" value={formState.selectedTemplateId ?? ''} onChange={(v)=>dispatch({type:'SET_FIELD',field:'selectedTemplateId',payload:Number(v)})} options={templates.map(t=>({value:t.id.toString(), label:t.name}))} size="small" />
                </Box>
              )}
              <Grid container spacing={2}>
                {dynamicFields.map(f => (
                  <Grid key={f.name} size={{ xs: 12, sm: 3 }}>
                    {f.type === 'select' ? (
                      <FormSelect
                        label={f.label}
                        value={formState.dynamicValues[f.name] || ''}
                        onChange={(v)=>dispatch({type:'UPDATE_DYNAMIC_VALUE',payload:{name:f.name, value:v}})}
                        options={(f.options || []).map(o=>({value:o, label:o}))}
                        size="small"
                        placeholder="Seleziona..."
                      />
                    ) : (
                      <FormInput
                        label={f.label}
                        value={formState.dynamicValues[f.name] || ''}
                        onChange={(v)=>dispatch({type:'UPDATE_DYNAMIC_VALUE',payload:{name:f.name, value:v}})}
                        type={f.type === 'number'?'number':'text'}
                        size="sm"
                        placeholder={f.label}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* STATUS & NOTES ROW */}
            <Grid size={12} container spacing={2}>
              {booking?.id && (
                <Grid size={12}>
                  <Box sx={styles.statusGroup}>
                    {([
                      { v: 'CREATO', l: 'Creato', c: '#9e9e9e' },
                      { v: 'CONFERMATO', l: 'Confermato', c: theme.palette.primary.main },
                      { v: 'MODIFICATO', l: 'Modificato', c: '#ce93d8' },
                      { v: 'SPOSTATO', l: 'Spostato', c: theme.palette.warning.main },
                      { v: 'ANNULLATO', l: 'Annullato', c: theme.palette.error.main },
                      { v: 'COMPLETATO', l: 'Completato', c: theme.palette.success.main },
                    ]).map((opt) => (
                      <Box
                        key={opt.v}
                        component="button"
                        type="button"
                        onClick={()=>dispatch({type:'SET_FIELD',field:'status',payload:opt.v})}
                        sx={styles.statusButton(formState.status === opt.v, opt.c)}
                      >
                        {opt.l}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
              <Grid size={12}>
                <Box
                  component="textarea"
                  value={formState.notes}
                  onChange={(e)=>dispatch({type:'SET_FIELD',field:'notes',payload:e.target.value})}
                  placeholder="Note Interne (opzionali)..."
                  sx={styles.textarea}
                />
              </Grid>

            </Grid>
          </Grid>
        </Box>

        {!isSuperAdmin && (
          <PasswordConfirmModal
            isOpen={formState.showPasswordModal}
            onClose={() => { dispatch({type:'SET_FIELD',field:'showPasswordModal',payload:false}); dispatch({type:'SET_PENDING_DATA',payload:null}); }}
            onConfirm={async (pwd) => {
              dispatch({type:'SET_FIELD',field:'passwordLoading',payload:true});
              try { await bookingService.verifyPassword(pwd); dispatch({type:'SET_FIELD',field:'showPasswordModal',payload:false}); if(formState.pendingData) await executeBookingAction(formState.pendingData); }
              catch { throw new Error('Password errata'); }
              finally { dispatch({type:'SET_FIELD',field:'passwordLoading',payload:false}); }
            }}
            loading={formState.passwordLoading}
          />
        )}
        {/* Success Animation Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(10, 15, 25, 0.85)',
                backdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'inherit',
              }}
            >
              <Box
                component={motion.div}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)',
                  mb: 3,
                }}
              >
                <Check size={60} color="white" />
              </Box>
              <Typography
                component={motion.p}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '-0.02em',
                }}
              >
                {booking ? 'Modifica Salvata!' : 'Prenotazione Confermata!'}
              </Typography>
            </Box>
          )}
        </AnimatePresence>
      </SmartModal>

      {/* Consent Details Modal Trigger */}
      {SHOW_CONSENSI && isSuperAdmin && booking && (
        <ConsentModal
          open={consentOpen}
          onClose={() => setConsentOpen(false)}
          booking={booking}
        />
      )}
    </>
  );
}

const styles = {
  container: { p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0 },
  label: { fontSize: '0.625rem', fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.12em', mb: 0.75 },
  separator: { height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.05)', my: 0.25 },
  formControlLabel: { m: 0, flexDirection: 'row-reverse', gap: 1.5 },
  switch: {
    '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'primary.main', opacity: 0.5 }
  },
  switchLabel: (isActive: boolean) => ({ fontSize: '0.625rem', color: isActive ? 'primary.main' : 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }),
  newCustomerFields: (isActive: boolean) => ({
    p: 3, borderRadius: '16px', bgcolor: isActive ? 'rgba(0, 191, 255, 0.02)' : 'transparent',
    border: '1px solid', borderColor: isActive ? 'rgba(0, 191, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
    opacity: isActive ? 1 : 0.4, transition: 'all 0.3s ease', pointerEvents: isActive ? 'auto' : 'none',
    filter: isActive ? 'none' : 'grayscale(100%) brightness(0.8)',
  }),
  resultsRow: { display: 'flex', gap: 3, height: '100%' },
  resultBoxArtist: { flex: 1, p: 1.25, borderRadius: '12px', bgcolor: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  resultLabelArtist: { fontSize: '0.6rem', color: '#ff9800', textTransform: 'uppercase', fontWeight: 800, mb: 0.25 },
  resultValueArtist: { fontSize: '1.15rem', fontWeight: 900, color: '#ff9800' },
  resultBoxStudio: { flex: 1, p: 1.25, borderRadius: '12px', bgcolor: 'rgba(76, 175, 80, 0.05)', border: '1px solid rgba(76, 175, 80, 0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  resultLabelStudio: { fontSize: '0.6rem', color: '#4caf50', textTransform: 'uppercase', fontWeight: 800, mb: 0.25 },
  resultValueStudio: { fontSize: '1.15rem', fontWeight: 900, color: '#4caf50' },
  statusGroup: { display: 'flex', gap: 1, flexWrap: 'wrap' },
  statusButton: (isActive: boolean, color: string) => ({
    px: 2.5, py: 1.25, borderRadius: '12px', fontSize: '0.7rem', fontWeight: 900,
    border: '2px solid',
    borderColor: isActive ? color : 'rgba(255, 255, 255, 0.05)',
    backgroundColor: isActive ? `${color}40` : 'rgba(255, 255, 255, 0.02)',
    color: isActive ? '#ffffff' : 'text.secondary',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    boxShadow: isActive ? `0 0 25px ${color}60, inset 0 0 10px ${color}30` : 'none',
    transform: isActive ? 'translateY(-2px)' : 'none',
    textShadow: isActive ? `0 0 8px ${color}` : 'none',
    '&:hover': {
      backgroundColor: isActive ? `${color}50` : 'rgba(255, 255, 255, 0.05)',
      borderColor: isActive ? color : 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-2px)',
    }
  }),
  textarea: {
    width: '100%', borderRadius: '12px', border: '1px solid rgba(0, 191, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', px: 2, py: 2, fontSize: '0.9375rem',
    color: 'text.primary', outline: 'none', transition: 'all 0.3s ease', resize: 'vertical', minHeight: '100px', fontFamily: 'inherit'
  },
};
