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
import { useEffect, useMemo, useReducer, useState } from 'react';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import SmartModal from '@/components/common/SmartModal';
import FormAutocomplete from '@/components/forms/FormAutocomplete';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import PasswordConfirmModal from '@/components/modals/PasswordConfirmModal';

// Types & Config
import { PERCENTUALE_OPTIONS_VALUES } from '../../hooks/booking-config';
import { EXPORT_FETCH_LIMIT } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useCustomers } from '@/modules/customer/hooks/useCustomer';
import { useFormTemplates } from '@/modules/form-templates/hooks/useFormTemplates';
import { useToast } from '@/hooks/useToast';
import { bookingApi as bookingService } from '../../api/booking.api';
import { customerApi as customerService } from '@/modules/customer/api/customer.api';
import { staffApi as staffService } from '@/modules/team/api/staff.api';
import type { Booking, CreateBookingData, BookingStatus } from '@/modules/booking/model/booking.types';
import type { FieldDef } from '@/modules/form-templates/model/form-template.types';
import { extractErrorMessage } from '@/shared/utils/extract-error';

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
  customPercentuale: string;
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
  { value: '50', label: '50%' },
  { value: '60', label: '60%' },
  { value: '70', label: '70%' },
  { value: '80', label: '80%' },
  { value: '100', label: '100%' },
  { value: 'CUSTOM', label: 'Custom' },
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
  customPercentuale: '',
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
          customPercentuale,
          dynamicValues: booking.formData as Record<string, string> || {},
          status: booking.status ?? 'CONFERMATO',
          artists: preLoadedArtists,
          initialArtistLoaded: true,
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

  const { data: customerResult, isLoading: customersLoading, mutate: mutateCustomers } = useCustomers({ page: 1, limit: EXPORT_FETCH_LIMIT });
  const { data: templates } = useFormTemplates();
  const customers = customerResult?.data;

  useEffect(() => {
    if (isOpen) {
      if (booking && !formState.initialArtistLoaded) dispatch({ type: 'LOAD_BOOKING', payload: { booking, isOpen } });
      else if (!booking && formState.date === '' && formState.time === '') dispatch({ type: 'RESET_FORM', payload: { initialDate, initialTime } });
    }
  }, [booking, isOpen, initialDate, initialTime, formState.initialArtistLoaded]);

  useEffect(() => {
    let mounted = true;
    if (isOpen) {
      const fetchAllArtists = async () => {
        if (formState.artists.length > 0 && formState.initialArtistLoaded) return;
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

  const percentuale = formState.percentualeMode === 'CUSTOM' ? Number(formState.customPercentuale) || 0 : Number(formState.percentualeMode) || 0;
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
        const newCustomer = await customerService.create({
          firstName: formState.newCustomerFirstName, lastName: formState.newCustomerLastName,
          phone: formState.newCustomerPhone, email: formState.newCustomerEmail.trim() || undefined
        });
        customerId = newCustomer.id.toString();
        await mutateCustomers();
      } catch { toast.error('Errore creazione cliente'); dispatch({ type: 'SET_FIELD', field: 'loading', payload: false }); return; }
    }

    const data: CreateBookingData = {
      customerId: Number(customerId), artistId: Number(formState.artistId), date: bookingDate,
      duration: Number(formState.duration) || undefined, price: prezzoNum || undefined,
      deposit: Number(formState.deposit) || undefined, notes: formState.notes.trim() || undefined, formData,
    };

    if (booking?.id && !isSuperAdmin) {
      dispatch({ type: 'SET_PENDING_DATA', payload: { ...data, status: formState.status } });
      dispatch({ type: 'SET_FIELD', field: 'showPasswordModal', payload: true });
    } else {
      await executeBookingAction(data);
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const executeBookingAction = async (data: CreateBookingData & { status?: BookingStatus }) => {
    dispatch({ type: 'SET_FIELD', field: 'loading', payload: true });
    try {
      if (booking?.id) await bookingService.update(booking.id, data);
      else await bookingService.create(data);
      
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
        isOpen={isOpen} onClose={onClose} onSave={handleSave} isSaving={formState.loading} maxWidth="xl"
        title={booking ? 'Modifica Prenotazione' : 'Nuova Prenotazione'}
        saveLabel={booking ? 'Salva Modifiche' : 'Conferma Prenotazione'}
      >
        <Box sx={styles.container}>
          <Grid container spacing={2.5}>
            {/* PARTECIPANTI */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Box sx={styles.sectionHeader}>
                <Typography sx={styles.label}>Partecipanti</Typography>
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
                  sx={styles.formControlLabel}
                />
              </Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <FormAutocomplete
                    label="Cliente *" value={formState.customerId}
                    onChange={(val) => dispatch({ type: 'SET_FIELD', field: 'customerId', payload: val })}
                    disabled={customersLoading || formState.isNewCustomer}
                    loading={customersLoading}
                    placeholder={formState.isNewCustomer ? "Nuovo cliente attivo" : "Cerca cliente..."}
                    options={customerOptions}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormSelect
                    label="Artista *" value={formState.artistId}
                    onChange={(val) => dispatch({ type: 'SET_FIELD', field: 'artistId', payload: val })}
                    disabled={formState.loadingArtists}
                    placeholder="Seleziona..."
                    options={artistOptions}
                  />
                </Grid>
                {/* NEW CUSTOMER FIELDS */}
                <Grid size={12}>
                  <Box sx={styles.newCustomerFields(formState.isNewCustomer)}>
                    <Grid container spacing={3}>
                      <Grid size={6}>
                        <FormInput label="Nome *" value={formState.newCustomerFirstName} onChange={(v)=>dispatch({type:'SET_FIELD',field:'newCustomerFirstName',payload:v})} disabled={!formState.isNewCustomer} size="sm" placeholder="Nome cliente" />
                      </Grid>
                      <Grid size={6}>
                        <FormInput label="Cognome *" value={formState.newCustomerLastName} onChange={(v)=>dispatch({type:'SET_FIELD',field:'newCustomerLastName',payload:v})} disabled={!formState.isNewCustomer} size="sm" placeholder="Cognome cliente" />
                      </Grid>
                      <Grid size={6}>
                        <FormInput label="Telefono *" value={formState.newCustomerPhone} onChange={(v)=>dispatch({type:'SET_FIELD',field:'newCustomerPhone',payload:v})} disabled={!formState.isNewCustomer} size="sm" placeholder="Es: 340 123 4567" />
                      </Grid>
                      <Grid size={6}>
                        <FormInput label="Email" value={formState.newCustomerEmail} onChange={(v)=>dispatch({type:'SET_FIELD',field:'newCustomerEmail',payload:v})} disabled={!formState.isNewCustomer} size="sm" type="email" placeholder="Es: nome@email.com" />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* QUANDO */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <Typography sx={styles.label}>Quando</Typography>
              <Grid container spacing={3}>
                <Grid size={6}>
                  <FormInput label="Data *" type="date" value={formState.date} onChange={(v)=>dispatch({type:'SET_FIELD',field:'date',payload:v})} size="sm" />
                </Grid>
                <Grid size={6}>
                  <FormInput label="Ora *" type="time" value={formState.time} onChange={(v)=>dispatch({type:'SET_FIELD',field:'time',payload:v})} size="sm" />
                </Grid>
                <Grid size={12}>
                  <FormSelect label="Durata Sessione" value={formState.duration} onChange={(v)=>dispatch({type:'SET_FIELD',field:'duration',payload:v})} options={DURATION_OPTIONS} />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={12}><Box sx={styles.separator} /></Grid>

            {/* ECONOMICO */}
            <Grid size={12}>
              <Typography sx={styles.label}>Economico</Typography>
              <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Grid container spacing={3}>
                    <Grid size={4}><FormInput label="Prezzo (€)" type="number" value={formState.price} onChange={(v)=>dispatch({type:'SET_FIELD',field:'price',payload:v})} size="sm" placeholder="Es: 150" /></Grid>
                    <Grid size={4}><FormInput label="Acconto (€)" type="number" value={formState.deposit} onChange={(v)=>dispatch({type:'SET_FIELD',field:'deposit',payload:v})} size="sm" placeholder="Es: 50" /></Grid>
                    <Grid size={4}><FormSelect label="% Artista" value={formState.percentualeMode} onChange={(v)=>dispatch({type:'SET_FIELD',field:'percentualeMode',payload:v})} options={PERCENTUALE_OPTIONS} /></Grid>
                    {formState.percentualeMode === 'CUSTOM' && (
                      <Grid size={12}><FormInput label="Custom %" type="number" value={formState.customPercentuale} onChange={(v)=>dispatch({type:'SET_FIELD',field:'customPercentuale',payload:v})} size="sm" /></Grid>
                    )}
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Box sx={styles.resultsRow}>
                    <Box sx={styles.resultBoxArtist}>
                      <Typography sx={styles.resultLabelArtist}>Artista</Typography>
                      <Typography sx={styles.resultValueArtist}>€{prezzoArtista.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={styles.resultBoxStudio}>
                      <Typography sx={styles.resultLabelStudio}>Studio</Typography>
                      <Typography sx={styles.resultValueStudio}>€{guadagno.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid size={12}><Box sx={styles.separator} /></Grid>

            {/* DETTAGLI TATTOO */}
            <Grid size={12}>
              {templates && templates.length > 1 && (
                <Box sx={{ mb: 3, maxWidth: 300 }}>
                  <FormSelect label="Schema Campi" value={formState.selectedTemplateId ?? ''} onChange={(v)=>dispatch({type:'SET_FIELD',field:'selectedTemplateId',payload:Number(v)})} options={templates.map(t=>({value:t.id.toString(), label:t.name}))} />
                </Box>
              )}
              <Typography sx={styles.label}>Dettagli Tattoo</Typography>
              <Grid container spacing={3}>
                {dynamicFields.map(f => (
                  <Grid key={f.name} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
                        placeholder={`Es: ${f.label.toLowerCase()}...`}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* STATUS & NOTES */}
            <Grid size={12} container spacing={4}>
              {booking?.id && (
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Typography sx={styles.label}>Stato</Typography>
                  <Box sx={styles.statusGroup}>
                    {([
                      { v: 'CONFERMATO', l: 'Confermato', c: theme.palette.primary.main },
                      { v: 'COMPLETATO', l: 'Completato', c: theme.palette.success.main },
                      { v: 'SPOSTATO', l: 'Spostato', c: theme.palette.warning.main },
                      { v: 'ANNULLATO', l: 'Annullato', c: theme.palette.error.main },
                    ]).map((opt) => (
                      <Box key={opt.v} component="button" onClick={()=>dispatch({type:'SET_FIELD',field:'status',payload:opt.v})} sx={styles.statusButton(formState.status === opt.v, opt.c)}>
                        {opt.l}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
              <Grid size={{ xs: 12, lg: booking?.id ? 8 : 12 }}>
                <Typography sx={styles.label}>Note Interne</Typography>
                <Box 
                  component="textarea" 
                  value={formState.notes} 
                  onChange={(e)=>dispatch({type:'SET_FIELD',field:'notes',payload:e.target.value})} 
                  placeholder="Inserisci note aggiuntive sull'appuntamento..." 
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
    </>
  );
}

const styles = {
  container: { p: 1, display: 'flex', flexDirection: 'column', gap: 1 },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 },
  label: { fontSize: '0.625rem', fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.12em', mb: 1 },
  separator: { height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.05)', my: 0.5 },
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
  resultBoxArtist: { flex: 1, p: 2, borderRadius: '16px', bgcolor: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  resultLabelArtist: { fontSize: '0.6875rem', color: '#ff9800', textTransform: 'uppercase', fontWeight: 800, mb: 0.5 },
  resultValueArtist: { fontSize: '1.4rem', fontWeight: 900, color: '#ff9800' },
  resultBoxStudio: { flex: 1, p: 2, borderRadius: '16px', bgcolor: 'rgba(76, 175, 80, 0.05)', border: '1px solid rgba(76, 175, 80, 0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  resultLabelStudio: { fontSize: '0.6875rem', color: '#4caf50', textTransform: 'uppercase', fontWeight: 800, mb: 0.5 },
  resultValueStudio: { fontSize: '1.4rem', fontWeight: 900, color: '#4caf50' },
  statusGroup: { display: 'flex', gap: 1, flexWrap: 'wrap' },
  statusButton: (isActive: boolean, color: string) => ({
    px: 2, py: 0.75, borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800,
    border: `1px solid ${isActive ? `${color}cc` : 'rgba(255, 255, 255, 0.08)'}`,
    backgroundColor: isActive ? `${color}20` : 'rgba(255, 255, 255, 0.02)',
    color: isActive ? color : 'text.secondary', transition: 'all 0.2s ease', cursor: 'pointer', textTransform: 'uppercase'
  }),
  textarea: {
    width: '100%', borderRadius: '12px', border: '1px solid rgba(0, 191, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', px: 2, py: 2, fontSize: '0.9375rem',
    color: 'text.primary', outline: 'none', transition: 'all 0.3s ease', resize: 'vertical', minHeight: '100px', fontFamily: 'inherit'
  },
};
