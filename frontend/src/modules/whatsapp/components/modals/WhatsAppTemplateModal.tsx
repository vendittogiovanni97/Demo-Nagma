"use client";

import { Box, Typography, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';

import Button from '@/common/components/ui/Button';
import FormInput from '@/common/components/forms/FormInput';
import TextareaInput from '@/common/components/forms/TextareaInput';
import SmartModal from '@/common/components/common/SmartModal';
import { useEntityForm } from '@/common/hooks/useEntityForm';
import { createWhatsAppTemplateSchema } from '@/modules/whatsapp/model/whatsapp.schema';
import { whatsappApi as whatsappService } from '../../api/whatsapp.api';
import type { CreateWhatsAppTemplateData, WhatsAppTemplate } from '../../model/whatsapp.types';
import SwitchInput from '@/common/components/forms/SwitchInput';
import { validateData } from '@/common/shared/utils/validation';

import { QuickVariablesBar } from '../QuickVariablesBar';

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  template?: WhatsAppTemplate | null;
}

interface TemplateFormData {
  name: string;
  category: string;
  body: string;
  isActive: boolean;
}

const getInitialValues = (template: WhatsAppTemplate | null): TemplateFormData => ({
  name: template?.name ?? '',
  category: template?.category ?? '',
  body: template?.body ?? '',
  isActive: template?.isActive ?? true,
});

const buildPayload = (data: TemplateFormData): CreateWhatsAppTemplateData => ({
  name: data.name,
  category: data.category || undefined,
  body: data.body,
  isActive: data.isActive,
});

const persistTemplate = (payload: CreateWhatsAppTemplateData, template: WhatsAppTemplate | null) =>
  template
    ? whatsappService.updateTemplate(template.id, payload)
    : whatsappService.createTemplate(payload);

const validateTemplate = (data: TemplateFormData) =>
  validateData(createWhatsAppTemplateSchema, buildPayload(data));

export default function WhatsAppTemplateModal({
  isOpen,
  onClose,
  onSuccess,
  template,
}: WhatsAppTemplateModalProps) {
  const form = useEntityForm({
    entity: template ?? null,
    open: isOpen,
    initial: getInitialValues,
    buildPayload,
    persist: persistTemplate,
    validate: validateTemplate,
    onSuccess,
    onClose,
    successMessage: (isEdit) => isEdit ? 'Template aggiornato' : 'Template creato',
    errorMessage: 'Errore durante il salvataggio del template',
  });

  const { formData, setField, isLoading } = form;

  const insertVariable = (variableVal: string) => {
    const textarea = document.getElementById('whatsapp-template-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newValue = before + variableVal + after;
      setField('body', newValue);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableVal.length, start + variableVal.length);
      }, 0);
    } else {
      setField('body', formData.body + variableVal);
    }
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Modifica Template WhatsApp' : 'Nuovo Template WhatsApp'}
      onSave={() => form.handleSubmit()}
      isSaving={isLoading}
      saveLabel={template ? 'Salva modifiche' : 'Crea template'}
      maxWidth="md"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <FormInput label="Nome template" value={formData.name} onChange={form.handleChange('name')} required />
          <FormInput
            label="Categoria"
            value={formData.category}
            onChange={form.handleChange('category')}
            placeholder="Conferma, post tattoo, recupero..."
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'action.hover',
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
            checked={formData.isActive}
            onChange={form.handleChange('isActive')}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextareaInput
            id="whatsapp-template-body"
            label="Corpo del Messaggio"
            value={formData.body}
            onChange={form.handleChange('body')}
            rows={8}
            required
            placeholder={'Ciao {{nome}}, ti confermo l\'appuntamento del {{data}} alle {{ora}} con {{artista}}.'}
          />
          
          <Box
            sx={{
              mt: 1,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'action.hover',
              px: 2.5,
              py: 2,
            }}
          >
            <QuickVariablesBar onInsertVariable={(val) => insertVariable(val)} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 1.5, opacity: 0.8 }}>
              Le variabili racchiuse tra doppi baffi <code>{'{{...}}'}</code> verranno compilate in automatico da Nagma prendendo i dati effettivi dell'appuntamento o del cliente al momento dell'invio.
            </Typography>
          </Box>
        </Box>
      </Box>
    </SmartModal>
  );
}
