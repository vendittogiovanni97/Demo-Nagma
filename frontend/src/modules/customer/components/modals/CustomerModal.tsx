"use client";

import SmartModal from '@/common/components/common/SmartModal';
import StatePanel from '@/common/components/feedback/StatePanel';
import { useAuth } from '@/common/context/AuthContext';
import { useEntityForm } from '@/common/hooks/useEntityForm';
import { useToast } from '@/common/hooks/useToast';
import { createCustomerSchema } from '@/modules/customer/model/customer.schema';
import { customerApi as customerService } from '@/modules/customer/api/customer.api';
import type { CreateCustomerRequest as CreateCustomerData } from '@/modules/customer/api/customer.types';
import type { CustomerModel as Customer } from '@/modules/customer/model/customer.model';
import { extractErrorMessage } from '@/common/shared/utils/extract-error';
import { validateData } from '@/common/shared/utils/validation';
import Icon, { Mail, Phone, User } from '@/common/components/ui/Icon';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import FormInput from '@/common/components/forms/FormInput';
import FormTextarea from '@/common/components/forms/FormTextarea';

import { configService } from '@/common/shared/services/config.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null;
}

export default function CustomerModal({ isOpen, onClose, onSuccess, customer }: Props) {
  const toast = useToast();
  const { isAdmin } = useAuth();

  const form = useEntityForm<Customer | null, CreateCustomerData>({
    entity: customer ?? null,
    open: isOpen,
    initial: (entity) =>
      entity
        ? {
            firstName: entity.firstName,
            lastName: entity.lastName,
            phone: entity.phone,
            email: entity.email ?? '',
            notes: entity.notes ?? '',
          }
        : { firstName: '', lastName: '', phone: '', email: '', notes: '' },
    buildPayload: (data) => data,
    persist: async (payload, entity) => {
      if (entity) {
        await customerService.update(entity.id, payload);
      } else {
        await customerService.create(payload);
      }
    },
    successMessage: customer ? 'Cliente aggiornato' : 'Cliente creato',
    onSuccess,
    onClose,
  });

  const handleSave = async () => {
    let cleanPhone = form.formData.phone.trim().replace(/\s+/g, '');
    if (cleanPhone && !cleanPhone.startsWith('+') && !cleanPhone.startsWith('00')) {
      try {
        const res = await configService.getConfig();
        const prefix = res.DEFAULT_PHONE_PREFIX || '+39';
        cleanPhone = prefix + cleanPhone;
      } catch {
        cleanPhone = '+39' + cleanPhone;
      }
    }

    const updatedData = {
      ...form.formData,
      phone: cleanPhone,
    };

    const validationError = validateData(createCustomerSchema, updatedData);
    if (validationError) {
      toast.error(extractErrorMessage(new Error(validationError), validationError));
      return;
    }
    await form.handleSubmit(updatedData);
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Modifica Cliente' : 'Nuovo Cliente'}
      onSave={handleSave}
      isSaving={form.isLoading}
      saveLabel={customer ? 'Salva Modifiche' : 'Crea Cliente'}
      maxWidth="sm"
    >
      {!isAdmin ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin e segreteria possono modificare l'anagrafica clienti."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
            }}
          >
            <FormInput
              label="Nome"
              value={form.formData.firstName}
              onChange={(v) => form.setField('firstName', v)}
              placeholder="Nome"
              icon={User}
              required
            />

            <FormInput
              label="Cognome"
              value={form.formData.lastName}
              onChange={(v) => form.setField('lastName', v)}
              placeholder="Cognome"
              icon={User}
              required
            />
          </Box>

          <FormInput
            label="Telefono"
            value={form.formData.phone}
            onChange={(v) => form.setField('phone', v)}
            placeholder="Telefono"
            icon={Phone}
            required
          />

          <FormInput
            label="Email"
            type="email"
            value={form.formData.email || ''}
            onChange={(v) => form.setField('email', v)}
            placeholder="Email opzionale"
            icon={Mail}
          />

          <FormTextarea
            label="Note"
            value={form.formData.notes || ''}
            onChange={(v) => form.setField('notes', v)}
            placeholder="Note, allergie, consensi..."
            rows={4}
          />
        </Box>
      )}
    </SmartModal>
  );
}