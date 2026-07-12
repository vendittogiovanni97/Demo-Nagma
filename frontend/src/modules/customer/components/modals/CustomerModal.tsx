"use client";

import SmartModal from '@/common/components/common/SmartModal';
import StatePanel from '@/common/components/feedback/StatePanel';
import { useAuth } from '@/common/context/AuthContext';
import { useFormModal } from '@/common/hooks/useFormModal';
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
  const [formData, setFormData] = useState<CreateCustomerData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: ''
  });

  const submitCustomer = async (data: CreateCustomerData) => {
    if (customer) {
      await customerService.update(customer.id, data);
    } else {
      await customerService.create(data);
    }
  };

  const { isLoading: loading, handleSubmit: submitForm } = useFormModal<CreateCustomerData>({
    onSubmit: submitCustomer,
    onSuccess,
    onClose,
    successMessage: customer ? 'Cliente aggiornato' : 'Cliente creato',
  });

  useEffect(() => {
    setFormData(customer
      ? { firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone, email: customer.email ?? '', notes: customer.notes ?? '' }
      : { firstName: '', lastName: '', phone: '', email: '', notes: '' }
    );
  }, [customer, isOpen]);

  const handleSave = async () => {
    let cleanPhone = formData.phone.trim().replace(/\s+/g, '');
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
      ...formData,
      phone: cleanPhone,
    };

    const validationError = validateData(createCustomerSchema, updatedData);
    if (validationError) {
      toast.error(extractErrorMessage(new Error(validationError), validationError));
      return;
    }
    await submitForm(updatedData);
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Modifica Cliente' : 'Nuovo Cliente'}
      onSave={handleSave}
      isSaving={loading}
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
              value={formData.firstName}
              onChange={(v) => setFormData({ ...formData, firstName: v })}
              placeholder="Nome"
              icon={User}
              required
            />

            <FormInput
              label="Cognome"
              value={formData.lastName}
              onChange={(v) => setFormData({ ...formData, lastName: v })}
              placeholder="Cognome"
              icon={User}
              required
            />
          </Box>

          <FormInput
            label="Telefono"
            value={formData.phone}
            onChange={(v) => setFormData({ ...formData, phone: v })}
            placeholder="Telefono"
              icon={Phone}
            required
          />

          <FormInput
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(v) => setFormData({ ...formData, email: v })}
            placeholder="Email opzionale"
            icon={Mail}
          />

          <FormTextarea
            label="Note"
            value={formData.notes || ''}
            onChange={(v) => setFormData({ ...formData, notes: v })}
            placeholder="Note, allergie, consensi..."
            rows={4}
          />
        </Box>
      )}
    </SmartModal>
  );
}
