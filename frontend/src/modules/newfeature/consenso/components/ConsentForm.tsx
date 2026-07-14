"use client";

import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Collapse,
  FormGroup,
  Stack,
  Typography,
  Divider,
  useTheme,
} from '@mui/material';
import Button from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';
import CheckboxInput from '@/common/components/forms/CheckboxInput';
import FormInput from '@/common/components/forms/FormInput';
import Icon from '@/common/components/ui/Icon';
import { consensoService } from '../service/consenso.service';
import { PublicBookingData, MedicalAnswers, ConsentSubmission } from '../model/consenso.model';
import ConsentCanvas from './ConsentCanvas';
import { useEntityForm } from '@/common/hooks/useEntityForm';
import { useToast } from '@/common/hooks/useToast';

interface ConsentFormProps {
  bookingId: number;
}

interface ConsentFormData {
  documentId: string;
  medicalAnswers: MedicalAnswers;
  signatureB64: string | null;
}

const INITIAL_MEDICAL_ANSWERS: MedicalAnswers = {
  maggiorenne: false,
  gravidanza: false,
  allergie: false,
  allergieDettagli: '',
  anticoagulanti: false,
  cardiopatie: false,
  epilessia: false,
  malattieInfettive: false,
  diabete: false,
  accettaPermanenza: false,
  accettaPrivacy: false,
};

const INITIAL_FORM_DATA: ConsentFormData = {
  documentId: '',
  medicalAnswers: INITIAL_MEDICAL_ANSWERS,
  signatureB64: null,
};

export default function ConsentForm({ bookingId }: ConsentFormProps) {
  const theme = useTheme();
  const toast = useToast();

  // Loading state for initial data fetch
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<PublicBookingData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch booking data
  useEffect(() => {
    let cancelled = false;
    const fetchBooking = async () => {
      try {
        const res = await consensoService.getBookingPublic(bookingId);
        if (!cancelled) {
          if (res.success) {
            setBookingData(res.data);
          } else {
            setFetchError((res as any).message || 'Impossibile caricare i dati della prenotazione.');
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setFetchError(err?.message || 'Errore di connessione al server.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBooking();
    return () => { cancelled = true; };
  }, [bookingId]);

  // Form with useEntityForm (entity = bookingData for initial values)
  const form = useEntityForm<PublicBookingData | null, ConsentFormData>({
    entity: bookingData,
    open: !loading && !fetchError,
    initial: () => INITIAL_FORM_DATA,
    buildPayload: (formData): ConsentSubmission => ({
      documentId: formData.documentId,
      medicalAnswers: formData.medicalAnswers,
      signatureB64: formData.signatureB64 || '',
    }),
    persist: async (payload) => {
      const res = await consensoService.submitConsent(bookingId, payload);
      if (!res.success) throw new Error(res.message || 'Errore durante la registrazione del consenso.');
    },
    successMessage: 'Consenso registrato con successo!',
    errorMessage: 'Errore nel salvare il consenso',
    validate: (formData) => {
      if (!formData.documentId.trim()) return "Il numero del documento d'identità è obbligatorio.";
      if (!formData.medicalAnswers.maggiorenne) return "Devi dichiarare di essere maggiorenne (o legalmente autorizzato) per procedere.";
      if (!formData.medicalAnswers.accettaPermanenza) return "Devi dichiarare di essere a conoscenza della permanenza del tatuaggio.";
      if (!formData.medicalAnswers.accettaPrivacy) return "È necessario acconsentire al trattamento dei dati personali (GDPR).";
      if (formData.medicalAnswers.allergie && !formData.medicalAnswers.allergieDettagli?.trim()) return "Inserisci i dettagli delle tue allergie.";
      if (!formData.signatureB64) return "La firma grafica è obbligatoria per convalidare il documento.";
      return null;
    },
    onSuccess: () => {
      toast.success('Consenso registrato con successo!');
    },
    onClose: () => {},
  });

  // Helper handlers for checkboxes
  const handleCheckboxChange = (key: keyof MedicalAnswers) => (checked: boolean) => {
    form.setField('medicalAnswers', { ...form.formData.medicalAnswers, [key]: checked });
  };

  const handleDetailChange = (value: string) => {
    form.setField('medicalAnswers', { ...form.formData.medicalAnswers, allergieDettagli: value });
  };

  const handleDocumentIdChange = (value: string) => {
    form.setField('documentId', value);
  };

  const handleSignatureChange = (signatureB64: string | null) => {
    form.setField('signatureB64', signatureB64);
  };

  if (loading) {
    return (
      <Stack sx={{ minHeight: '60vh', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={45} sx={{ color: 'custom.purple' }} />
        <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>
          Caricamento della scheda di consenso...
        </Typography>
      </Stack>
    );
  }

  if (fetchError) {
    return (
      <Stack sx={{ minHeight: '60vh', justifyContent: 'center', alignItems: 'center', p: 3, textAlign: 'center' }} spacing={2}>
        <Icon name="alertCircle" size={48} color="error.main" />
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
          Attenzione
        </Typography>
        <Typography sx={{ color: 'text.secondary', maxWidth: 400 }}>
          {fetchError}
        </Typography>
      </Stack>
    );
  }

  if (form.isSubmitted) {
    return (
      <Stack sx={{ minHeight: '80vh', justifyContent: 'center', alignItems: 'center', p: 3, textAlign: 'center' }} spacing={3}>
        <Icon name="checkCircle" size={64} color="success.main" />
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Grazie, {bookingData?.customerName}!
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 450, fontSize: '0.95rem' }}>
          Il tuo Consenso Informato è stato registrato ed associato con successo alla tua prenotazione con l'artista <strong>{bookingData?.artistName}</strong>.
        </Typography>
        <Divider sx={{ width: '100%', maxWidth: 200, my: 1 }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Puoi chiudere questa pagina in sicurezza. Ti aspettiamo in studio! 🖤
        </Typography>
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={form.handleSubmit} sx={{ py: 4, px: 2, maxWidth: 640, mx: 'auto' }}>

      {/* HEADER CARD */}
      <Card variant="minimal" size="md" sx={{ border: '1px solid var(--color-surface-border)', mb: 3 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Icon name="shieldCheck" size={28} color="custom.purple" />
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                Consenso Informato
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Benvenuto da <strong>Nagma</strong>. Prima di procedere alla tua sessione di tatuaggio, è obbligatorio compilare questo modulo per confermare il tuo stato di salute e convalidare il consenso igienico-sanitario.
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Stack spacing={0.5} sx={{ pl: 1, borderLeft: `3px solid ${theme.palette.custom.purple}` }}>
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                Cliente: <Typography component="strong" sx={{ color: 'text.primary' }}>{bookingData?.customerName}</Typography>
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                Artista: <Typography component="strong" sx={{ color: 'text.primary' }}>{bookingData?.artistName}</Typography>
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                Data Sessione: <Typography component="strong" sx={{ color: 'text.primary' }}>{bookingData?.date ? new Date(bookingData.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</Typography>
              </Typography>
            </Stack>
          </Stack>
      </Card>

      {/* STEP 1: IDENTITY DOCUMENT */}
      <Card variant="minimal" size="md" sx={{ border: '1px solid var(--color-surface-border)', mb: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Icon name="fileText" size={18} color="custom.purple" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                1. Documento d'Identità
              </Typography>
            </Stack>
            <FormInput
              required
              label="Numero Carta d'Identità / Passaporto"
              placeholder="es: CA12345AB"
              value={form.formData.documentId}
              onChange={handleDocumentIdChange}
            />
          </Stack>
      </Card>

      {/* STEP 2: HEALTH DECLARATIONS */}
      <Card variant="minimal" size="md" sx={{ border: '1px solid var(--color-surface-border)', mb: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Icon name="heart" size={18} color="custom.purple" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                2. Dichiarazioni Sanitarie
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Seleziona con attenzione ciascuna casella. Rispondere con onestà è fondamentale per la tua sicurezza durante l'esecuzione del tatuaggio.
            </Typography>

            <Divider />

            <FormGroup sx={{ gap: 1.5 }}>
              <CheckboxInput
                label="Dichiaro di essere maggiorenne"
                checked={form.formData.medicalAnswers.maggiorenne}
                onChange={handleCheckboxChange('maggiorenne')}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <CheckboxInput
                label="Ti trovi in stato di gravidanza o allattamento?"
                checked={form.formData.medicalAnswers.gravidanza}
                onChange={handleCheckboxChange('gravidanza')}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <Box>
                <CheckboxInput
                  label="Soffri di allergie? (Nichel, Metalli, Lattice, Disinfettanti, ecc.)"
                  checked={form.formData.medicalAnswers.allergie}
                  onChange={handleCheckboxChange('allergie')}
                  sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
                />
                <Collapse in={form.formData.medicalAnswers.allergie}>
                  <Box sx={{ pl: 4, pt: 1, pb: 0.5 }}>
                    <FormInput
                      size="sm"
                      label="Specifica le tue allergie"
                      placeholder="es: Allergico al Nichel e al Lattice"
                      value={form.formData.medicalAnswers.allergieDettagli ?? ''}
                      onChange={handleDetailChange}
                    />
                  </Box>
                </Collapse>
              </Box>

              <CheckboxInput
                label="Assumi farmaci anticoagulanti (cardioaspirina, ecc.)?"
                checked={form.formData.medicalAnswers.anticoagulanti}
                onChange={handleCheckboxChange('anticoagulanti')}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <CheckboxInput
                label="Soffri di cardiopatie o patologie cardiovascolari?"
                checked={form.formData.medicalAnswers.cardiopatie}
                onChange={handleCheckboxChange('cardiopatie')}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <CheckboxInput
                label="Soffri di epilessia?"
                checked={form.formData.medicalAnswers.epilessia}
                onChange={handleCheckboxChange('epilessia')}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <CheckboxInput
                label="Soffri di diabete?"
                checked={form.formData.medicalAnswers.diabete}
                onChange={handleCheckboxChange('diabete')}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <CheckboxInput
                label="Soffri di malattie infettive trasmissibili (Epatite, HIV)?"
                checked={form.formData.medicalAnswers.malattieInfettive}
                onChange={handleCheckboxChange('malattieInfettive')}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <Divider sx={{ my: 1 }} />

              <CheckboxInput
                label="Dichiaro di essere a conoscenza della permanenza del tatuaggio"
                checked={form.formData.medicalAnswers.accettaPermanenza}
                onChange={handleCheckboxChange('accettaPermanenza')}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <CheckboxInput
                label="Acconsento al trattamento dei dati personali sensibili ai sensi del GDPR 2016/679 per scopi sanitari ed archivistici."
                checked={form.formData.medicalAnswers.accettaPrivacy}
                onChange={handleCheckboxChange('accettaPrivacy')}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />
            </FormGroup>
          </Stack>
      </Card>

      {/* STEP 3: SIGNATURE */}
      <Card variant="minimal" size="md" sx={{ border: '1px solid var(--color-surface-border)', mb: 4 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Icon name="fileText" size={18} color="custom.purple" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                3. Firma Grafica
              </Typography>
            </Stack>
            <ConsentCanvas onSignatureChange={handleSignatureChange} />
          </Stack>
      </Card>

      {/* SUBMIT BUTTON */}
      <Button
        variant="primary"
        size="lg"
        type="submit"
        fullWidth
        disabled={form.isLoading}
        loadingLabel="Elaborazione e firma del documento in corso..."
        isLoading={form.isLoading}
        sx={{
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '0.95rem',
        }}
      >
        {form.isLoading ? '' : "Sottoscrivi e Firma il Consenso"}
      </Button>
    </Box>
  );
}