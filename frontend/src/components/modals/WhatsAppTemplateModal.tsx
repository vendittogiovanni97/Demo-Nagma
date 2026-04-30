"use client";

import { Box, Typography, FormControlLabel, Switch } from '@mui/material';
import { useEffect, useState } from 'react';

import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import SmartModal from '@/components/common/SmartModal';
import { useToast } from '@/hooks/useToast';
import { createWhatsAppTemplateSchema } from '@/schemas/whatsapp';
import { whatsappService } from '@/services/whatsapp.service';
import type { CreateWhatsAppTemplateData, WhatsAppTemplate } from '@/types/whatsapp';
import { extractErrorMessage } from '@/utils/extract-error';
import { validateData } from '@/utils/validation';

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  template?: WhatsAppTemplate | null;
}

export default function WhatsAppTemplateModal({
  isOpen,
  onClose,
  onSuccess,
  template,
}: WhatsAppTemplateModalProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [body, setBody] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(template?.name || '');
    setCategory(template?.category || '');
    setBody(template?.body || '');
    setIsActive(template?.isActive ?? true);
  }, [isOpen, template]);

  const handleSave = async () => {
    const payload: CreateWhatsAppTemplateData = {
      name,
      category: category || undefined,
      body,
      isActive,
    };

    const validationError = validateData(createWhatsAppTemplateSchema, payload);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      if (template) {
        await whatsappService.updateTemplate(template.id, payload);
        toast.success('Template aggiornato');
      } else {
        await whatsappService.createTemplate(payload);
        toast.success('Template creato');
      }

      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, 'Errore durante il salvataggio del template');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Modifica Template WhatsApp' : 'Nuovo Template WhatsApp'}
      onSave={handleSave}
      isSaving={loading}
      saveLabel={template ? 'Salva modifiche' : 'Crea template'}
      maxWidth="md"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <FormInput label="Nome template" value={name} onChange={setName} required />
          <FormInput
            label="Categoria"
            value={category}
            onChange={setCategory}
            placeholder="Conferma, post tattoo, recupero..."
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            px: 2.5,
            py: 1.5,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              Stato Template
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              I template disattivati non saranno visibili durante l'invio manuale
            </Typography>
          </Box>
          <Switch
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            color="primary"
          />
        </Box>

        <FormTextarea
          label="Corpo del Messaggio"
          value={body}
          onChange={setBody}
          rows={8}
          required
          placeholder={'Ciao {{nome}}, ti confermo l\'appuntamento del {{data}} alle {{ora}} con {{artista}}.'}
        />

        <Box
          sx={{
            borderRadius: 2,
            border: '1px solid rgba(0, 191, 255, 0.1)',
            backgroundColor: 'rgba(0, 191, 255, 0.03)',
            px: 2.5,
            py: 2,
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(0, 191, 255, 0.9)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
            Variabili supportate
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Usa placeholder come <code>{'{{nome}}'}</code>, <code>{'{{data}}'}</code>, <code>{'{{ora}}'}</code>, <code>{'{{artista}}'}</code>. 
            Le compileremo automaticamente al momento dell'invio basandoci sui dati della prenotazione.
          </Typography>
        </Box>
      </Box>
    </SmartModal>
  );
}
