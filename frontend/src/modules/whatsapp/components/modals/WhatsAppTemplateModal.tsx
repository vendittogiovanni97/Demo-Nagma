"use client";

import { Box, Typography, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

import Button from '@/common/components/ui/Button';
import FormInput from '@/common/components/forms/FormInput';
import FormTextarea from '@/common/components/forms/FormTextarea';
import SmartModal from '@/common/components/common/SmartModal';
import { useToast } from '@/common/hooks/useToast';
import { createWhatsAppTemplateSchema } from '@/modules/whatsapp/model/whatsapp.schema';
import { whatsappApi as whatsappService } from '../../api/whatsapp.api';
import type { CreateWhatsAppTemplateData, WhatsAppTemplate } from '../../model/whatsapp.types';
import SwitchInput from '@/common/components/forms/SwitchInput';
import { useFormModal } from '@/common/hooks/useFormModal';
import { validateData } from '@/common/shared/utils/validation';

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  template?: WhatsAppTemplate | null;
}

const QUICK_VARIABLES = [
  { label: '👤 Nome Cliente', value: '{{nome}}', color: '#00e5ff' },
  { label: '📅 Data Appt.', value: '{{data}}', color: '#ff007f' },
  { label: '⏰ Ora Appt.', value: '{{ora}}', color: '#7000ff' },
  { label: '🎨 Artista', value: '{{artista}}', color: '#ffaa00' },
  { label: '💰 Prezzo/Acconto', value: '{{prezzo}}', color: '#00ff66' },
];

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

  useEffect(() => {
    if (!isOpen) return;
    setName(template?.name || '');
    setCategory(template?.category || '');
    setBody(template?.body || '');
    setIsActive(template?.isActive ?? true);
  }, [isOpen, template]);

  const { isLoading, handleSubmit } = useFormModal({
    onSubmit: async () => {
      const payload: CreateWhatsAppTemplateData = {
        name,
        category: category || undefined,
        body,
        isActive,
      };
      if (template) {
        await whatsappService.updateTemplate(template.id, payload);
      } else {
        await whatsappService.createTemplate(payload);
      }
      onSuccess?.();
    },
    onClose,
    successMessage: template ? 'Template aggiornato' : 'Template creato',
    errorMessage: 'Errore durante il salvataggio del template',
  });

  const insertVariable = (variableVal: string) => {
    const textarea = document.getElementById('whatsapp-template-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newValue = before + variableVal + after;
      setBody(newValue);

      // Restore focus and selection position after state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableVal.length, start + variableVal.length);
      }, 0);
    } else {
      setBody((prev) => prev + variableVal);
    }
  };

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
    await handleSubmit();
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Modifica Template WhatsApp' : 'Nuovo Template WhatsApp'}
      onSave={handleSave}
      isSaving={isLoading}
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
          <SwitchInput
            checked={isActive}
            onChange={setIsActive}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormTextarea
            id="whatsapp-template-body"
            label="Corpo del Messaggio"
            value={body}
            onChange={setBody}
            rows={8}
            required
            placeholder={'Ciao {{nome}}, ti confermo l\'appuntamento del {{data}} alle {{ora}} con {{artista}}.'}
          />
          
          <Box
            sx={{
              mt: 1,
              borderRadius: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              px: 2.5,
              py: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: 'text.secondary',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 1.5,
              }}
            >
              🪄 Variabili Rapide (Fai click per inserire nel testo)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {QUICK_VARIABLES.map((v) => (
                <Tooltip key={v.value} title={`Inserisci ${v.value}`} arrow>
                  <Button
                    onClick={() => insertVariable(v.value)}
                    variant="ghost"
                    size="sm"
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      border: `1px solid rgba(255, 255, 255, 0.15)`,
                      background: 'rgba(255, 255, 255, 0.03)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: v.color,
                        background: `rgba(${parseInt(v.color.slice(1,3), 16)}, ${parseInt(v.color.slice(3,5), 16)}, ${parseInt(v.color.slice(5,7), 16)}, 0.1)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${v.color}25`,
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      }
                    }}
                  >
                    {v.label}
                  </Button>
                </Tooltip>
              ))}
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 1.5, opacity: 0.8 }}>
              Le variabili racchiuse tra doppi baffi <code>{'{{...}}'}</code> verranno compilate in automatico da Nagma prendendo i dati effettivi dell'appuntamento o del cliente al momento dell'invio.
            </Typography>
          </Box>
        </Box>
      </Box>
    </SmartModal>
  );
}
