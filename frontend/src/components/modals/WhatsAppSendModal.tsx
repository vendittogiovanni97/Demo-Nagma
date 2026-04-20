"use client";

import { useEffect, useMemo, useState } from 'react';

import { EXPORT_FETCH_LIMIT } from '@/config/defaults';
import StatePanel from '@/components/feedback/StatePanel';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import Modal from '@/components/modals/Modal';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useCustomers, useWhatsAppTemplates } from '@/hooks/domain';
import { useWhatsAppComposer } from '@/hooks/useWhatsAppComposer';
import { whatsappService } from '@/services/whatsapp.service';
import type { Booking } from '@/types/booking';
import type { Customer } from '@/types/customer';
import { notifyError, notifySuccess } from '@/utils/toast';
import { validateData } from '@/utils/validation';
import { sendWhatsAppMessageSchema } from '@/schemas';

interface WhatsAppSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customer?: Customer | null;
  booking?: Booking | null;
}

export default function WhatsAppSendModal({
  isOpen,
  onClose,
  onSuccess,
  customer,
  booking,
}: WhatsAppSendModalProps) {
  const { can } = useAuth();
  const canSend = can.sendWhatsApp;
  // Keep as string for FormSelect compatibility; convert to number when sending
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    customer?.id?.toString() || booking?.customer?.id?.toString() || ''
  );
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { data: templates, isLoading: templatesLoading, error: templatesError } = useWhatsAppTemplates({
    enabled: isOpen && canSend,
  });
  const { data: customersResult } = useCustomers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen && canSend });
  const customers = useMemo(() => customersResult?.data || [], [customersResult]);

  const selectedCustomer = useMemo(
    () =>
      customers.find((entry) => entry.id.toString() === selectedCustomerId) ||
      customer ||
      (booking?.customer
        ? {
            id: booking.customer.id,
            firstName: booking.customer.firstName,
            lastName: booking.customer.lastName,
            phone: booking.customer.phone || '',
            createdAt: '',
          }
        : null),
    [customers, selectedCustomerId, customer, booking]
  );

  const selectedTemplate = templates?.find((template) => template.id.toString() === selectedTemplateId) || null;
  const {
    variables,
    setVariables,
    messageDraft,
    setMessageDraft,
    setMessageDirty,
    templateVariables,
    previewMessage,
    resetComposer,
  } = useWhatsAppComposer({
    selectedTemplate,
    selectedCustomer: selectedCustomer as Customer | null,
    booking,
    mode: 'modal',
  });

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCustomerId(customer?.id?.toString() || booking?.customer?.id?.toString() || '');
    setRecipientName(
      customer
        ? `${customer.firstName} ${customer.lastName}`.trim()
        : booking?.customer
          ? `${booking.customer.firstName} ${booking.customer.lastName}`.trim()
          : ''
    );
    setRecipientPhone(customer?.phone || booking?.customer?.phone || '');
    resetComposer();
  }, [isOpen, customer, booking, resetComposer]);

  useEffect(() => {
    if (!templates?.length || selectedTemplateId) return;
    setSelectedTemplateId(templates[0].id.toString());
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    if (!selectedCustomer) return;
    const fullName = `${selectedCustomer.firstName} ${selectedCustomer.lastName}`.trim();
    setRecipientName((current) => current || fullName);
    setRecipientPhone((current) => current || selectedCustomer.phone || '');
  }, [selectedCustomer]);

  const handleSend = async () => {
    if (!selectedTemplate) {
      notifyError(new Error('Seleziona un template'), 'Seleziona un template');
      return;
    }

    const payload = {
      templateId: selectedTemplate.id,
      customerId: selectedCustomerId ? Number(selectedCustomerId) : (customer?.id || booking?.customer?.id || undefined),
      bookingId: booking?.id || undefined,
      recipientName: recipientName || undefined,
      recipientPhone,
      message: messageDraft,
      variables,
    };

    const validationError = validateData(sendWhatsAppMessageSchema, payload);
    if (validationError) {
      notifyError(new Error(validationError), validationError);
      return;
    }

    setIsSending(true);
    try {
      const response = await whatsappService.sendManualMessage(payload);
      notifySuccess('Messaggio preparato. Apro WhatsApp Web.');
      window.open(response.whatsappUrl, '_blank', 'noopener,noreferrer');
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      notifyError(error, 'Errore durante la preparazione del messaggio');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invio WhatsApp Manuale" maxWidth="max-w-4xl">
      {!canSend ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin e segreteria possono preparare messaggi WhatsApp."
        />
      ) : templatesLoading ? (
        <StatePanel
          variant="loading"
          title="Carico i template"
          description="Sto preparando il flusso WhatsApp."
        />
      ) : templatesError ? (
        <StatePanel
          variant="error"
          title="Impossibile caricare i template"
          description="Riprova tra poco o aggiorna la pagina."
        />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <FormSelect
              label="Template"
              value={selectedTemplateId}
              onChange={setSelectedTemplateId}
              placeholder="Seleziona template..."
              options={(templates || [])
                .filter((template) => template.isActive)
                .map((template) => ({
                  value: template.id.toString(),
                  label: template.name,
                }))}
            />
            <FormSelect
              label="Cliente"
              value={selectedCustomerId}
              onChange={setSelectedCustomerId}
              placeholder="Seleziona cliente..."
              options={customers.map((entry) => ({
                value: entry.id.toString(),
                label: `${entry.firstName} ${entry.lastName}`,
              }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormInput label="Nome destinatario" value={recipientName} onChange={setRecipientName} />
            <FormInput label="Telefono destinatario" value={recipientPhone} onChange={setRecipientPhone} required />
          </div>

          {templateVariables.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {templateVariables.map((key) => (
                <FormInput
                  key={key}
                  label={`Variabile: ${key}`}
                  value={variables[key] || ''}
                  onChange={(value) =>
                    setVariables((current) => ({
                      ...current,
                      [key]: value,
                    }))
                  }
                />
              ))}
            </div>
          ) : null}

          <div className="rounded-[28px] border border-surface-border bg-[#081018] p-5">
            <div className="mb-3 text-sm font-semibold text-white">Anteprima messaggio</div>
            <div className="rounded-3xl border border-surface-border bg-[#10202e] p-4 text-sm leading-6 text-white/90">
              {selectedTemplate ? previewMessage : 'Seleziona prima un template.'}
            </div>
          </div>

          <FormTextarea
            label="Modifica rapida messaggio"
            value={messageDraft}
            onChange={(value) => {
              setMessageDirty(true);
              setMessageDraft(value);
            }}
            rows={7}
            disabled={!selectedTemplate}
            placeholder="Qui puoi rifinire il messaggio prima di aprire WhatsApp."
          />

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => void handleSend()}
              disabled={isSending || !selectedTemplate}
              isLoading={isSending}
              loadingLabel="Apro WhatsApp..."
            >
              Apri WhatsApp
            </Button>
            <Button
              variant="glass"
              size="md"
              onClick={onClose}
            >
              Chiudi
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
