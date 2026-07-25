"use client";

import { Box, Typography } from '@mui/material';
import Card from '@/common/components/ui/Card';
import TextareaInput from '@/common/components/forms/TextareaInput';
import { SaveButton } from '@/common/components/ui/Button';
import { useTattooStyleEditor } from '../hooks/useTattooStyleEditor';

export default function TattooStyleCard() {
  const { isLoading, hasError, hasTemplate, optionsText, setOptionsText, saving, handleSave } =
    useTattooStyleEditor();

  return (
    <Card variant="glass" size="lg" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box>
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: 'text.primary' }}>
          Stile Tatuaggio
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: 0.5 }}>
          Gestisci gli stili disponibili nella scheda di prenotazione. Un valore per riga.
        </Typography>
      </Box>

      {isLoading ? (
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Caricamento…</Typography>
      ) : hasError ? (
        <Typography sx={{ fontSize: '0.85rem', color: 'error.main' }}>
          Impossibile caricare gli stili. Riprova.
        </Typography>
      ) : !hasTemplate ? (
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
          Nessuna scheda con il campo “Stile Tatuaggio” trovata.
        </Typography>
      ) : (
        <>
          <TextareaInput
            label="Stili disponibili"
            name="tattoo-style-options"
            value={optionsText}
            onChange={setOptionsText}
            rows={8}
            placeholder={'Realistico,\nTradizionale,\nMinimal,\nAltro'}
            helperText="Uno stile per riga. La virgola finale è solo per leggibilità e viene ignorata al salvataggio."
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SaveButton onClick={handleSave} isLoading={saving}>
              Salva stili
            </SaveButton>
          </Box>
        </>
      )}
    </Card>
  );
}
