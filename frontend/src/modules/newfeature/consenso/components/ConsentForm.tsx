"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Collapse,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { ShieldCheck, Heart, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { consensusApi, PublicBookingData, MedicalAnswers } from '../api/consenso.api';
import ConsentCanvas from './ConsentCanvas';

interface ConsentFormProps {
  bookingId: number;
}

export default function ConsentForm({ bookingId }: ConsentFormProps) {
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
        const res = await consensusApi.getBookingPublic(bookingId);
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
      const res = await consensusApi.submitConsent(bookingId, {
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
        <CircularProgress size={45} sx={{ color: '#9155FD' }} />
        <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>
          Caricamento della scheda di consenso...
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack sx={{ minHeight: '60vh', justifyContent: 'center', alignItems: 'center', p: 3, textAlign: 'center' }} spacing={2}>
        <AlertCircle size={48} className="text-[#EF4444]" />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#EF4444' }}>
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
        <CheckCircle size={64} className="text-[#10B981] animate-bounce" />
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
      <Card sx={{ border: '1px solid var(--color-surface-border)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <ShieldCheck size={28} className="text-[#9155FD]" />
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                Consenso Informato
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Benvenuto da <strong>Nagma</strong>. Prima di procedere alla tua sessione di tatuaggio, è obbligatorio compilare questo modulo per confermare il tuo stato di salute e convalidare il consenso igienico-sanitario.
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Stack spacing={0.5} sx={{ pl: 1, borderLeft: '3px solid #9155FD' }}>
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
        </CardContent>
      </Card>

      {/* STEP 1: IDENTITY DOCUMENT */}
      <Card sx={{ border: '1px solid var(--color-surface-border)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <FileText size={18} className="text-[#9155FD]" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                1. Documento d'Identità
              </Typography>
            </Stack>
            <TextField
              required
              fullWidth
              label="Numero Carta d'Identità / Passaporto"
              placeholder="es: CA12345AB"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* STEP 2: HEALTH DECLARATIONS */}
      <Card sx={{ border: '1px solid var(--color-surface-border)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Heart size={18} className="text-[#9155FD]" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                2. Dichiarazioni Sanitarie
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Seleziona con attenzione ciascuna casella. Rispondere con onestà è fondamentale per la tua sicurezza durante l'esecuzione del tatuaggio.
            </Typography>

            <Divider />

            <FormGroup sx={{ gap: 1.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={medicalAnswers.maggiorenne}
                    onChange={handleCheckboxChange('maggiorenne')}
                    sx={{ color: '#9155FD', '&.Mui-checked': { color: '#9155FD' } }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Dichiaro di essere maggiorenne</Typography>}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={medicalAnswers.gravidanza}
                    onChange={handleCheckboxChange('gravidanza')}
                    sx={{ color: '#9155FD', '&.Mui-checked': { color: '#9155FD' } }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.85rem' }}>Ti trovi in stato di gravidanza o allattamento?</Typography>}
              />

              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={medicalAnswers.allergie}
                      onChange={handleCheckboxChange('allergie')}
                      sx={{ color: '#9155FD', '&.Mui-checked': { color: '#9155FD' } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: '0.85rem' }}>Soffri di allergie? (Nichel, Metalli, Lattice, Disinfettanti, ecc.)</Typography>}
                />
                <Collapse in={medicalAnswers.allergie}>
                  <Box sx={{ pl: 4, pt: 1, pb: 0.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Specifica le tue allergie"
                      placeholder="es: Allergico al Nichel e al Lattice"
                      value={medicalAnswers.allergieDettagli}
                      onChange={handleDetailChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                    />
                  </Box>
                </Collapse>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={medicalAnswers.anticoagulanti}
                    onChange={handleCheckboxChange('anticoagulanti')}
                    sx={{ color: '#9155FD', '&.Mui-checked': { color: '#9155FD' } }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.85rem' }}>Assumi farmaci anticoagulanti (cardioaspirina, ecc.)?</Typography>}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={medicalAnswers.cardiopatie}
                    onChange={handleCheckboxChange('cardiopatie')}
                    sx={{ color: '#9155FD', '&.Mui-checked': { color: '#9155FD' } }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.85rem' }}>Soffri di cardiopatie o patologie cardiovascolari?</Typography>}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={medicalAnswers.epilessia}
                    onChange={handleCheckboxChange('epilessia')}
                    sx={{ color: '#9155FD', '&.Mui-checked': { color: '#9155FD' } }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.85rem' }}>Soffri di epilessia?</Typography>}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={medicalAnswers.diabete}
                    onChange={handleCheckboxChange('diabete')}
                    sx={{ color: '#9155FD', '&.Mui-checked': { color: '#9155FD' } }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.85rem' }}>Soffri di diabete?</Typography>}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={medicalAnswers.malattieInfettive}
                    onChange={handleCheckboxChange('malattieInfettive')}
                    sx={{ color: '#9155FD', '&.Mui-checked': { color: '#9155FD' } }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.85rem' }}>Soffri di malattie infettive trasmissibili (Epatite, HIV)?</Typography>}
              />

              <Divider sx={{ my: 1 }} />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={medicalAnswers.accettaPermanenza}
                    onChange={handleCheckboxChange('accettaPermanenza')}
                    sx={{ color: '#9155FD', '&.Mui-checked': { color: '#9155FD' } }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Dichiaro di essere a conoscenza della permanenza del tatuaggio</Typography>}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={medicalAnswers.accettaPrivacy}
                    onChange={handleCheckboxChange('accettaPrivacy')}
                    sx={{ color: '#9155FD', '&.Mui-checked': { color: '#9155FD' } }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    Acconsento al trattamento dei dati personali sensibili ai sensi del GDPR 2016/679 per scopi sanitari ed archivistici.
                  </Typography>
                }
              />
            </FormGroup>
          </Stack>
        </CardContent>
      </Card>

      {/* STEP 3: SIGNATURE */}
      <Card sx={{ border: '1px solid var(--color-surface-border)', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <FileText size={18} className="text-[#9155FD]" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                3. Firma Grafica
              </Typography>
            </Stack>
            <ConsentCanvas onSignatureChange={setSignatureB64} />
          </Stack>
        </CardContent>
      </Card>

      {/* SUBMIT BUTTON */}
      <Button
        fullWidth
        type="submit"
        size="large"
        variant="contained"
        disabled={submitting}
        sx={{
          py: 1.8,
          borderRadius: '10px',
          backgroundColor: '#9155FD',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.95rem',
          letterSpacing: 0.5,
          boxShadow: '0 4px 14px 0 rgba(145, 85, 253, 0.4)',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#8040E6',
            boxShadow: '0 6px 20px 0 rgba(145, 85, 253, 0.5)',
          },
          '&.Mui-disabled': {
            backgroundColor: '#2D3748',
            color: 'var(--color-text-secondary)',
          }
        }}
      >
        {submitting ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <CircularProgress size={18} sx={{ color: 'white' }} />
            <span>Elaborazione e firma del documento in corso...</span>
          </Stack>
        ) : (
          "Sottoscrivi e Firma il Consenso"
        )}
      </Button>
    </Box>
  );
}
