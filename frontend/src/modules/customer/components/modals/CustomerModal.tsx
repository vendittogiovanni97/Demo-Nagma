"use client";

import SmartModal from '@/common/components/common/SmartModal';
import StatePanel from '@/common/components/feedback/StatePanel';
import { useAuth } from '@/common/context/AuthContext';
import { useEntityForm } from '@/common/hooks/useEntityForm';
import { createCustomerSchema } from '@/modules/customer/model/customer.schema';
import { customerApi as customerService } from '@/modules/customer/api/customer.api';
import type { CreateCustomerRequest as CreateCustomerData } from '@/modules/customer/api/customer.types';
import type { CustomerModel as Customer } from '@/modules/customer/model/customer.model';
import { validateData } from '@/common/shared/utils/validation';
import { Mail, Phone, User } from '@/common/components/ui/Icon';
import { Box } from '@mui/material';
import FormInput from '@/common/components/forms/FormInput';
import TextareaInput from '@/common/components/forms/TextareaInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null;
}

export default function CustomerModal({ isOpen, onClose, onSuccess, customer }: Props) {
  const { isAdmin } = useAuth();

  const formatPhone = (rawPhone: string) => {
    let clean = rawPhone.trim().replace(/\s+/g, '');
    if (clean && !clean.startsWith('+') && !clean.startsWith('00')) {
      clean = '+39' + clean;
    }
    return clean;
  };

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
    validate: (formData) => {
      const dataToValidate = { ...formData, phone: formatPhone(formData.phone) };
      return validateData(createCustomerSchema, dataToValidate);
    },
    buildPayload: (formData) => ({
      ...formData,
      phone: formatPhone(formData.phone),
    }),
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

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Modifica Cliente' : 'Nuovo Cliente'}
      onSave={form.handleSubmit}
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

          <TextareaInput
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
