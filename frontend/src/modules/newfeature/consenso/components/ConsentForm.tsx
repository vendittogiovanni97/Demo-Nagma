"use client";

import React, { useState, useEffect } from 'react';
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
import { PublicBookingData, MedicalAnswers } from '../model/consenso.model';
import ConsentCanvas from './ConsentCanvas';

interface ConsentFormProps {
  bookingId: number;
}

export default function ConsentForm({ bookingId }: ConsentFormProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<PublicBookingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [documentId, setDocumentId] = useState('');
  const [medicalAnswers, setMedicalAnswers] = useState<MedicalAnswers>({
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
  });
  const [signatureB64, setSignatureB64] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load Booking public details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await consensoService.getBookingPublic(bookingId);
        if (res.success) {
          setBookingData(res.data);
        } else {
          setError((res as any).message || 'Impossibile caricare i dati della prenotazione.');
        }
      } catch (err: any) {
        setError(err?.message || 'Errore di connessione al server.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleCheckboxChange = (key: keyof MedicalAnswers) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setMedicalAnswers(prev => ({
      ...prev,
      [key]: e.target.checked
    }));
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMedicalAnswers(prev => ({
      ...prev,
      allergieDettagli: e.target.value
    }));
  };

  const validateForm = (): string | null => {
    if (!documentId.trim()) return "Il numero del documento d'identità è obbligatorio.";
    if (!medicalAnswers.maggiorenne) return "Devi dichiarare di essere maggiorenne (o legalmente autorizzato) per procedere.";
    if (!medicalAnswers.accettaPermanenza) return "Devi dichiarare di essere a conoscenza della permanenza del tatuaggio.";
    if (!medicalAnswers.accettaPrivacy) return "È necessario acconsentire al trattamento dei dati personali (GDPR).";
    if (medicalAnswers.allergie && !medicalAnswers.allergieDettagli?.trim()) return "Inserisci i dettagli delle tue allergie.";
    if (!signatureB64) return "La firma grafica è obbligatoria per convalidare il documento.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await consensoService.submitConsent(bookingId, {
        documentId,
        medicalAnswers,
        signatureB64: signatureB64 || '',
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        alert(res.message || 'Errore durante la registrazione del consenso.');
      }
    } catch (err: any) {
      alert(err?.message || 'Errore imprevisto durante l\'invio del consenso.');
    } finally {
      setSubmitting(false);
    }
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

  if (error) {
    return (
      <Stack sx={{ minHeight: '60vh', justifyContent: 'center', alignItems: 'center', p: 3, textAlign: 'center' }} spacing={2}>
        <Icon name="alertCircle" size={48} className="text-[#EF4444]" />
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
          Attenzione
        </Typography>
        <Typography sx={{ color: 'text.secondary', maxWidth: 400 }}>
          {error}
        </Typography>
      </Stack>
    );
  }

  if (submitted) {
    return (
      <Stack sx={{ minHeight: '80vh', justifyContent: 'center', alignItems: 'center', p: 3, textAlign: 'center' }} spacing={3}>
        <Icon name="checkCircle" size={64} className="text-[#10B981] animate-bounce" />
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
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
    <Box component="form" onSubmit={handleSubmit} sx={{ py: 4, px: 2, maxWidth: 640, mx: 'auto' }}>
      
      {/* HEADER CARD */}
      <Card variant="minimal" size="md" sx={{ border: '1px solid var(--color-surface-border)', mb: 3 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Icon name="shieldCheck" size={28} className="text-[#9155FD]" />
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                Consenso Informato
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Benvenuto da <strong>Nagma</strong>. Prima di procedere alla tua sessione di tatuaggio, è obbligatorio compilare questo modulo per confermare il tuo stato di salute e convalidare il consenso igienico-sanitario.
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Stack spacing={0.5} sx={(theme) => ({ pl: 1, borderLeft: `3px solid ${theme.palette.custom.purple}` })}>
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                Cliente: <strong className="text-white">{bookingData?.customerName}</strong>
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                Artista: <strong className="text-white">{bookingData?.artistName}</strong>
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                Data Sessione: <strong className="text-white">{bookingData?.date ? new Date(bookingData.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</strong>
              </Typography>
            </Stack>
          </Stack>
      </Card>

      {/* STEP 1: IDENTITY DOCUMENT */}
      <Card variant="minimal" size="md" sx={{ border: '1px solid var(--color-surface-border)', mb: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Icon name="fileText" size={18} className="text-[#9155FD]" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                1. Documento d'Identità
              </Typography>
            </Stack>
            <FormInput
              required
              label="Numero Carta d'Identità / Passaporto"
              placeholder="es: CA12345AB"
              value={documentId}
              onChange={setDocumentId}
            />
          </Stack>
      </Card>

      {/* STEP 2: HEALTH DECLARATIONS */}
      <Card variant="minimal" size="md" sx={{ border: '1px solid var(--color-surface-border)', mb: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Icon name="heart" size={18} className="text-[#9155FD]" />
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
                checked={medicalAnswers.maggiorenne}
                onChange={(checked) => setMedicalAnswers(prev => ({ ...prev, maggiorenne: checked }))}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <CheckboxInput
                label="Ti trovi in stato di gravidanza o allattamento?"
                checked={medicalAnswers.gravidanza}
                onChange={(checked) => setMedicalAnswers(prev => ({ ...prev, gravidanza: checked }))}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <Box>
                <CheckboxInput
                  label="Soffri di allergie? (Nichel, Metalli, Lattice, Disinfettanti, ecc.)"
                  checked={medicalAnswers.allergie}
                  onChange={(checked) => setMedicalAnswers(prev => ({ ...prev, allergie: checked }))}
                  sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
                />
                <Collapse in={medicalAnswers.allergie}>
                  <Box sx={{ pl: 4, pt: 1, pb: 0.5 }}>
                    <FormInput
                      size="sm"
                      label="Specifica le tue allergie"
                      placeholder="es: Allergico al Nichel e al Lattice"
                      value={medicalAnswers.allergieDettagli ?? ''}
                      onChange={(v) => setMedicalAnswers(prev => ({ ...prev, allergieDettagli: String(v) }))}
                    />
                  </Box>
                </Collapse>
              </Box>

              <CheckboxInput
                label="Assumi farmaci anticoagulanti (cardioaspirina, ecc.)?"
                checked={medicalAnswers.anticoagulanti}
                onChange={(checked) => setMedicalAnswers(prev => ({ ...prev, anticoagulanti: checked }))}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <CheckboxInput
                label="Soffri di cardiopatie o patologie cardiovascolari?"
                checked={medicalAnswers.cardiopatie}
                onChange={(checked) => setMedicalAnswers(prev => ({ ...prev, cardiopatie: checked }))}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <CheckboxInput
                label="Soffri di epilessia?"
                checked={medicalAnswers.epilessia}
                onChange={(checked) => setMedicalAnswers(prev => ({ ...prev, epilessia: checked }))}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <CheckboxInput
                label="Soffri di diabete?"
                checked={medicalAnswers.diabete}
                onChange={(checked) => setMedicalAnswers(prev => ({ ...prev, diabete: checked }))}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <CheckboxInput
                label="Soffri di malattie infettive trasmissibili (Epatite, HIV)?"
                checked={medicalAnswers.malattieInfettive}
                onChange={(checked) => setMedicalAnswers(prev => ({ ...prev, malattieInfettive: checked }))}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <Divider sx={{ my: 1 }} />

              <CheckboxInput
                label="Dichiaro di essere a conoscenza della permanenza del tatuaggio"
                checked={medicalAnswers.accettaPermanenza}
                onChange={(checked) => setMedicalAnswers(prev => ({ ...prev, accettaPermanenza: checked }))}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />

              <CheckboxInput
                label="Acconsento al trattamento dei dati personali sensibili ai sensi del GDPR 2016/679 per scopi sanitari ed archivistici."
                checked={medicalAnswers.accettaPrivacy}
                onChange={(checked) => setMedicalAnswers(prev => ({ ...prev, accettaPrivacy: checked }))}
                sx={{ color: 'custom.purple', '&.Mui-checked': { color: 'custom.purple' } }}
              />
            </FormGroup>
          </Stack>
      </Card>

      {/* STEP 3: SIGNATURE */}
      <Card variant="minimal" size="md" sx={{ border: '1px solid var(--color-surface-border)', mb: 4 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Icon name="fileText" size={18} className="text-[#9155FD]" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                3. Firma Grafica
              </Typography>
            </Stack>
            <ConsentCanvas onSignatureChange={setSignatureB64} />
          </Stack>
      </Card>

      {/* SUBMIT BUTTON */}
      <Button
        variant="primary"
        size="lg"
        type="submit"
        fullWidth
        disabled={submitting}
        loadingLabel="Elaborazione e firma del documento in corso..."
        isLoading={submitting}
        sx={{
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '0.95rem',
        }}
      >
        {submitting ? '' : "Sottoscrivi e Firma il Consenso"}
      </Button>
    </Box>
  );
}
