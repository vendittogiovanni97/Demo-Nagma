"use client";

import StatePanel from '@/components/feedback/StatePanel';
import { useAuth } from '@/context/AuthContext';
import { useFormModal } from '@/hooks/useFormModal';
import { useToast } from '@/hooks/useToast';
import { createCustomerSchema } from '@/schemas';
import { customerService } from '@/services/customer.service';
import type { CreateCustomerData, Customer } from '@/types/customer';
import { extractErrorMessage } from '@/utils/extract-error';
import { validateData } from '@/utils/validation';
import { FileText, Mail, Phone, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import FormInput from '../forms/FormInput';
import FormTextarea from '../forms/FormTextarea';
import SubmitButton from '../forms/SubmitButton';
import Modal from './Modal';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateData(createCustomerSchema, formData);
    if (validationError) {
      toast.error(extractErrorMessage(new Error(validationError), validationError));
      return;
    }
    await submitForm(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? 'Modifica Cliente' : 'Nuovo Cliente'}>
      {!isAdmin ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin e segreteria possono modificare l'anagrafica clienti."
        />
      ) : (
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Nome"
            icon={User}
            required
            value={formData.firstName}
            onChange={(v) => setFormData({ ...formData, firstName: v })}
          />
          <FormInput
            label="Cognome"
            icon={User}
            required
            value={formData.lastName}
            onChange={(v) => setFormData({ ...formData, lastName: v })}
          />
        </div>

        <FormInput
          label="Telefono"
          icon={Phone}
          required
          value={formData.phone}
          onChange={(v) => setFormData({ ...formData, phone: v })}
        />

        <FormInput
          label="Email (Opzionale)"
          icon={Mail}
          type="email"
          value={formData.email || ''}
          onChange={(v) => setFormData({ ...formData, email: v })}
        />

        <FormTextarea
          label="Note / Allergie / Consensi"
          icon={FileText}
          value={formData.notes || ''}
          onChange={(v) => setFormData({ ...formData, notes: v })}
        />

        <SubmitButton
          loading={loading}
          label={customer ? 'Salva Modifiche' : 'Crea Cliente'}
          icon={Save}
        />
      </form>
      )}
    </Modal>
  );
}
