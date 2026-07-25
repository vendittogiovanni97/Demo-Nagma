"use client";

import SwitchInput from '@/common/components/forms/SwitchInput';
import Icon from '@/common/components/ui/Icon';
import {
  alpha,
  Box,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';

// Components
import SmartModal from '@/common/components/common/SmartModal';
import FormAutocomplete from '@/common/components/forms/FormAutocomplete';
import FormInput from '@/common/components/forms/FormInput';
import DateInput from '@/common/components/forms/DateInput';
import TimeInput from '@/common/components/forms/TimeInput';
import FormSelect from '@/common/components/forms/FormSelect';
import PasswordConfirmModal from '@/common/components/modals/PasswordConfirmModal';
import Badge from '@/common/components/ui/Badge';

// Types & Config
import { useAuth } from '@/common/context/AuthContext';
import { useToast } from '@/common/hooks/useToast';
import type { Booking, BookingStatus } from '@/modules/booking/model/booking.types';
import { useBookingForm } from '../../hooks/useBookingForm';
import { BOOKING_STATUS_CONFIG } from '@/common/config/status-config';

export interface ArtistOption {
  id: number;
  name: string;
  color?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onUpdateLocalState?: (id: number, fields: Partial<any>) => void;
  booking: Booking | null;
  initialDate?: string;
  initialTime?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  onSuccess,
  onUpdateLocalState,
  booking = null,
  initialDate,
  initialTime
}: Props) {
  const toast = useToast();
  const theme = useTheme();
  const { isSuperAdmin } = useAuth();

  const form = useBookingForm({
    isOpen,
    booking,
    initialDate,
    initialTime,
    onSuccess,
    onClose,
    isSuperAdmin,
    onUpdateLocalState,
  });

  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSave = async () => {
    await form.handleSave();
  };

  const handlePasswordConfirm = async (password: string) => {
    await form.handlePasswordConfirm(password);
  };

  return (
    <>
      <SmartModal
        isOpen={isOpen}
        onClose={form.handleClose}
        onSave={handleSave}
        isSaving={form.isLoading}
        maxWidth="lg"
        title={booking ? 'Modifica Prenotazione' : 'Nuova Prenotazione'}
        saveLabel={booking ? 'Salva Modifiche' : 'Conferma Prenotazione'}
        headerAction={!booking && (
          <SwitchInput
            label="Nuovo Cliente"
            checked={form.formData.isNewCustomer}
            onChange={(checked) => form.setField('isNewCustomer', checked)}
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
                </Grid>
              </Grid>
            )}

            {/* ROW 2: CUSTOMER SELECTION IF NEW */}
            {!booking && (
              <>
                {!form.formData.isNewCustomer && (
                  <Grid size={12}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <FormAutocomplete
                          label="Cerca Cliente *"
                          value={form.formData.customerId}
                          onChange={(val) => form.setField('customerId', val)}
                          disabled={form.customersLoading}
                          loading={form.customersLoading}
                          placeholder="Cerca per nome o telefono..."
                          options={form.customerOptions}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {/* NEW CUSTOMER FIELDS (ONLY VISIBLE IF TOGGLE IS ON) */}
                {form.formData.isNewCustomer && (
                  <Grid size={12}>
                    <Box sx={styles.newCustomerFields(true)}>
                      <Grid container spacing={2}>
                        <Grid size={3}>
                          <FormInput
                            label="Nome *"
                            value={form.formData.newCustomerFirstName}
                            onChange={(v) => form.setField('newCustomerFirstName', v)}
                            size="sm"
                            placeholder="Nome"
                          />
                        </Grid>
                        <Grid size={3}>
                          <FormInput
                            label="Cognome *"
                            value={form.formData.newCustomerLastName}
                            onChange={(v) => form.setField('newCustomerLastName', v)}
                            size="sm"
                            placeholder="Cognome"
                          />
                        </Grid>
                        <Grid size={3}>
                          <FormInput
                            label="Telefono *"
                            value={form.formData.newCustomerPhone}
                            onChange={(v) => form.setField('newCustomerPhone', v)}
                            size="sm"
                            placeholder="Telefono"
                          />
                        </Grid>
                        <Grid size={3}>
                          <FormInput
                            label="Email"
                            value={form.formData.newCustomerEmail}
                            onChange={(v) => form.setField('newCustomerEmail', v)}
                            size="sm"
                            type="email"
                            placeholder="Email"
                          />
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
                    label="Artista *"
                    value={form.formData.artistId}
                    onChange={(val) => form.setField('artistId', val)}
                    disabled={form.loadingArtists}
                    placeholder="Seleziona..."
                    options={form.artistOptions}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <DateInput label="Data *" value={form.formData.date} onChange={(v) => form.setField('date', v)} size="sm" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TimeInput label="Ora *" value={form.formData.time} onChange={(v) => form.setField('time', v)} size="sm" />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormSelect label="Durata" value={form.formData.duration} onChange={(v) => form.setField('duration', v)} options={DURATION_OPTIONS} />
                </Grid>
              </Grid>
            </Grid>

            {/* ECONOMIC ROW */}
            <Grid size={12}>
              <Grid container spacing={2} sx={{ alignItems: 'flex-end' }}>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <FormInput label="Prezzo" type="number" value={form.formData.price} onChange={(v) => form.setField('price', v)} size="sm" placeholder="€" />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <FormInput label="Acconto" type="number" value={form.formData.deposit} onChange={(v) => form.setField('deposit', v)} size="sm" placeholder="€" />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <FormSelect label="% Artista" value={form.formData.percentualeMode} onChange={(v) => form.setField('percentualeMode', v)} options={PERCENTUALE_OPTIONS} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={styles.resultBoxArtist}>
                    <Typography sx={styles.resultLabelArtist}>Artista</Typography>
                    <Typography sx={styles.resultValueArtist}>€{form.prezzoArtista.toFixed(2)}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={styles.resultBoxStudio}>
                    <Typography sx={styles.resultLabelStudio}>Studio</Typography>
                    <Typography sx={styles.resultValueStudio}>€{form.guadagno.toFixed(2)}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* DYNAMIC FIELDS ROW */}
            <Grid size={12}>
              {form.templates && form.templates.length > 1 && (
                <Box sx={{ mb: 1, maxWidth: 200 }}>
                  <FormSelect
                    label="Template"
                    value={form.formData.selectedTemplateId ?? ''}
                    onChange={(v) => form.setField('selectedTemplateId', Number(v))}
                    options={form.templates.map(t => ({ value: t.id.toString(), label: t.name }))}
                    size="small"
                  />
                </Box>
              )}
              <Grid container spacing={2}>
                {form.dynamicFields.map(f => (
                  <Grid key={f.name} size={{ xs: 12, sm: 3 }}>
                    {f.type === 'select' ? (
                      <FormSelect
                        label={f.label}
                        value={form.formData.dynamicValues[f.name] || ''}
                        onChange={(v) => form.setField('dynamicValues', { ...form.formData.dynamicValues, [f.name]: v })}
                        options={(f.options || []).map(o => ({ value: o, label: o }))}
                        size="small"
                        placeholder="Seleziona..."
                      />
                    ) : (
                      <FormInput
                        label={f.label}
                        value={form.formData.dynamicValues[f.name] || ''}
                        onChange={(v) => form.setField('dynamicValues', { ...form.formData.dynamicValues, [f.name]: v })}
                        type={f.type === 'number' ? 'number' : 'text'}
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
                    {(Object.entries(BOOKING_STATUS_CONFIG) as Array<[
                      BookingStatus,
                      (typeof BOOKING_STATUS_CONFIG)[string],
                    ]>).map(([status, config]) => (
                      <Box
                        key={status}
                        component="button"
                        type="button"
                        aria-pressed={form.formData.status === status}
                        aria-label={`Imposta stato ${config.label}`}
                        onClick={() => form.setField('status', status)}
                        sx={styles.statusButton(form.formData.status === status)}
                      >
                        <Badge
                          variant={config.badgeVariant}
                          size="lg"
                          sx={{
                            width: '100%',
                            height: 40,
                            pointerEvents: 'none',
                            '& .MuiChip-label': {
                              width: '100%',
                              textAlign: 'center',
                            },
                          }}
                        >
                          {config.label}
                        </Badge>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
              <Grid size={12}>
                <Box
                  component="textarea"
                  value={form.formData.notes}
                  onChange={(e) => form.setField('notes', e.target.value)}
                  placeholder="Note Interne (opzionali)..."
                  sx={styles.textarea}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {!isSuperAdmin && (
          <PasswordConfirmModal
            isOpen={form.showPasswordModal}
            onClose={() => { form.setShowPasswordModal(false); form.setPendingData(null); }}
            onConfirm={handlePasswordConfirm}
            loading={form.passwordLoading}
          />
        )}

        {/* Success Animation Overlay */}
        <AnimatePresence>
          {form.showSuccess && (
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
                bgcolor: alpha(theme.palette.common.black, 0.85),
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
                  boxShadow: `0 0 40px ${alpha(theme.palette.success.main, 0.4)}`,
                  mb: 3,
                }}
              >
                <Icon name="check" size={60} color="white" />
              </Box>
              <Typography
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                variant="h6"
                sx={{ fontWeight: 800, color: 'common.white' }}
              >
                {booking ? 'Modifiche salvate!' : 'Prenotazione confermata!'}
              </Typography>
            </Box>
          )}
        </AnimatePresence>
      </SmartModal>
    </>
  );
}

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

function createStyles(theme: any) {
  return {
    container: {
      p: 1,
    },
    newCustomerFields: (isNew: boolean) => ({
      mt: 2,
      mb: 1,
      p: 2,
      borderRadius: 2,
      backgroundColor: isNew ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
      border: `1px solid ${isNew ? theme.palette.primary.main : alpha(theme.palette.divider, 0.3)}`,
      transition: 'all 0.2s',
    }),
    resultBoxArtist: {
      p: 1.5,
      borderRadius: 1.5,
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    resultLabelArtist: {
      fontSize: '0.65rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: theme.palette.primary.main,
      mb: 0.25,
    },
    resultValueArtist: {
      fontSize: '1.1rem',
      fontWeight: 800,
      color: theme.palette.primary.main,
    },
    resultBoxStudio: {
      p: 1.5,
      borderRadius: 1.5,
      backgroundColor: alpha(theme.palette.success.main, 0.1),
      border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    resultLabelStudio: {
      fontSize: '0.65rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: theme.palette.success.main,
      mb: 0.25,
    },
    resultValueStudio: {
      fontSize: '1.1rem',
      fontWeight: 800,
      color: theme.palette.success.main,
    },
    statusGroup: {
      display: 'grid',
      gridTemplateColumns: {
        xs: 'repeat(2, minmax(0, 1fr))',
        sm: 'repeat(4, minmax(0, 1fr))',
        lg: 'repeat(7, minmax(0, 1fr))',
      },
      gap: 1,
    },
    statusButton: (active: boolean) => ({
      minWidth: 0,
      p: 0,
      border: 0,
      borderRadius: 2,
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: theme.transitions.create(['transform', 'box-shadow'], {
        duration: theme.transitions.duration.shorter,
      }),
      outline: active ? `2px solid ${theme.palette.text.primary}` : '2px solid transparent',
      outlineOffset: 2,
      boxShadow: active
        ? `0 4px 14px ${alpha(theme.palette.common.black, 0.28)}`
        : 'none',
      transform: active ? 'translateY(-1px)' : 'none',
      '&:hover': {
        transform: 'translateY(-1px)',
      },
      '&:focus-visible': {
        outlineColor: theme.palette.primary.main,
      },
    }),
    textarea: {
      width: '100%',
      minHeight: 80,
      p: 1.5,
      borderRadius: 1.5,
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: alpha(theme.palette.common.white, 0.03),
      color: theme.palette.text.primary,
      fontFamily: 'inherit',
      fontSize: '0.875rem',
      resize: 'vertical',
      '&:focus': {
        outline: 'none',
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
      },
    },
  };
}
