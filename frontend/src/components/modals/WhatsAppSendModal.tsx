"use client";

import { Box, Typography, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import StatePanel from '@/components/feedback/StatePanel';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import SmartModal from '@/components/common/SmartModal';
import { EXPORT_FETCH_LIMIT } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useCustomers } from '@/hooks/domain/useCustomers';
import { useWhatsAppTemplates } from '@/hooks/domain/useWhatsApp';
import { useToast } from '@/hooks/useToast';
import { useWhatsAppComposer } from '@/hooks/useWhatsAppComposer';
import { sendWhatsAppMessageSchema } from '@/schemas/whatsapp';
import { whatsappService } from '@/services/whatsapp.service';
import type { Booking } from '@/types/booking';
import type { Customer } from '@/types/customer';
import { extractErrorMessage } from '@/utils/extract-error';
import { validateData } from '@/utils/validation';

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
  const theme = useTheme();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const canSend = isAdmin;
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { data: templates, isLoading: templatesLoading, error: templatesError } = useWhatsAppTemplates({
    enabled: isOpen && canSend,
  });
  const { data: customersResult } = useCustomers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen && canSend });
  const customers = useMemo(() => customersResult?.data || [], [customersResult]);

  useEffect(() => {
    if (!isOpen) return;
    if (customer?.id) {
      setSelectedCustomerId(customer.id.toString());
      setRecipientName(`${customer.firstName} ${customer.lastName}`);
      setRecipientPhone(customer.phone || '');
    } else if (booking?.customer?.id) {
      setSelectedCustomerId(booking.customer.id.toString());
      setRecipientName(`${booking.customer.firstName} ${booking.customer.lastName}`);
      setRecipientPhone(booking.customer.phone || '');
    }
    if (templates?.length) {
      setSelectedTemplateId(templates[0].id.toString());
    }
  }, [isOpen, templates, customer, booking]);

  const templateOptions = useMemo(
    () =>
      (templates || [])
        .filter((template) => template.isActive)
        .map((template) => ({
          value: template.id.toString(),
          label: template.name,
        })),
    [templates]
  );

  const customerOptions = useMemo(
    () =>
      customers.map((entry) => ({
        value: entry.id.toString(),
        label: `${entry.firstName} ${entry.lastName}`,
      })),
    [customers]
  );

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
    templateVariables,
    previewMessage,
  } = useWhatsAppComposer({
    selectedTemplate,
    selectedCustomer: selectedCustomer as Customer | null,
    booking,
    mode: 'modal',
  });

  const handleSend = async () => {
    if (!selectedTemplate) {
      toast.error('Seleziona un template');
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
      toast.error(validationError);
      return;
    }

    setIsSending(true);
    try {
      const response = await whatsappService.sendManualMessage(payload);
      toast.success('Messaggio preparato. Apro WhatsApp Web.');
      window.open(response.whatsappUrl, '_blank', 'noopener,noreferrer');
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Errore durante la preparazione del messaggio'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title="Invio WhatsApp Manuale"
      maxWidth="md"
      onSave={handleSend}
      isSaving={isSending}
      saveLabel="Apri WhatsApp"
    >
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <FormSelect
              label="Template"
              value={selectedTemplateId}
              onChange={setSelectedTemplateId}
              placeholder="Seleziona template..."
              options={templateOptions}
            />
            <FormSelect
              label="Cliente"
              value={selectedCustomerId}
              onChange={setSelectedCustomerId}
              placeholder="Seleziona cliente..."
              options={customerOptions}
            />
          </Box>

          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <FormInput label="Nome destinatario" value={recipientName} onChange={setRecipientName} />
            <FormInput label="Telefono destinatario" value={recipientPhone} onChange={setRecipientPhone} required />
          </Box>

          {templateVariables.length > 0 ? (
            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
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
            </Box>
          ) : null}

          <Box
            sx={{
              borderRadius: '16px',
              border: '1px solid rgba(0, 191, 255, 0.15)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              p: 3,
            }}
          >
            <Typography
              sx={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: theme.palette.primary.main, 
                textTransform: 'uppercase', 
                letterSpacing: '0.12em',
                mb: 2 
              }}
            >
              Anteprima messaggio
            </Typography>
            <Box
              sx={{
                borderRadius: '12px',
                border: '1px solid rgba(0, 191, 255, 0.1)',
                backgroundColor: 'rgba(10, 26, 38, 0.5)',
                p: 2.5,
                minHeight: '80px'
              }}
            >
              <Typography
                variant="body2"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.85)', 
                  lineHeight: 1.6, 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {selectedTemplate ? previewMessage : 'Seleziona un template per vedere l\'anteprima.'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </SmartModal>
  );
}
