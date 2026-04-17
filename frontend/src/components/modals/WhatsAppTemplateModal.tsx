"use client";

import { useEffect, useState } from 'react';

import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import SubmitButton from '@/components/forms/SubmitButton';
import Modal from '@/components/modals/Modal';
import { useToast } from '@/hooks/useToast';
import { whatsappService } from '@/services/whatsapp.service';
import type { CreateWhatsAppTemplateData, WhatsAppTemplate } from '@/types/whatsapp';
import { validateData } from '@/utils/validation';
import { createWhatsAppTemplateSchema } from '@/schemas';

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

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
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il salvataggio del template';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Modifica Template WhatsApp' : 'Nuovo Template WhatsApp'}
      maxWidth="max-w-2xl"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput label="Nome template" value={name} onChange={setName} required />
          <FormInput
            label="Categoria"
            value={category}
            onChange={setCategory}
            placeholder="Conferma, post tattoo, recupero..."
          />
        </div>

        <label className="flex items-center justify-between rounded-2xl border border-surface-border bg-white/[0.03] px-4 py-3 text-sm text-white">
          <span>Template attivo</span>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
        </label>

        <FormTextarea
          label="Messaggio"
          value={body}
          onChange={setBody}
          rows={8}
          required
          placeholder={'Ciao {{nome}}, ti confermo l\'appuntamento del {{data}} alle {{ora}} con {{artista}}.'}
        />

        <div className="rounded-2xl border border-surface-border bg-white/[0.03] px-4 py-3 text-sm text-text-secondary">
          Variabili supportate: usa placeholder come <code>{'{{nome}}'}</code>, <code>{'{{data}}'}</code>,
          <code>{' {{ora}}'}</code>, <code>{'{{artista}}'}</code>. Le compileremo al momento dell&apos;invio.
        </div>

        <SubmitButton
          loading={loading}
          label={template ? 'Salva modifiche' : 'Crea template'}
          loadingLabel="Salvataggio template..."
        />
      </form>
    </Modal>
  );
}
