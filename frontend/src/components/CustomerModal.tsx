"use client";

import { useState, useEffect } from 'react';
import { User, Phone, Mail, FileText, Save } from 'lucide-react';
import { customerService } from '@/services/customer.service';
import type { Customer, CreateCustomerData } from '@/types';
import Modal from '@/components/Modal';
import FormInput from '@/components/FormInput';
import FormTextarea from '@/components/FormTextarea';
import SubmitButton from '@/components/SubmitButton';
import toast from 'react-hot-toast';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null;
}

export default function CustomerModal({ isOpen, onClose, onSuccess, customer }: CustomerModalProps) {
  const [formData, setFormData] = useState<CreateCustomerData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        email: customer.email || '',
        notes: customer.notes || ''
      });
    } else {
      setFormData({ firstName: '', lastName: '', phone: '', email: '', notes: '' });
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (customer) {
        await customerService.update(customer.id, formData);
        toast.success('Cliente aggiornato');
      } else {
        await customerService.create(formData);
        toast.success('Cliente creato con successo');
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Errore durante l\'operazione';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? 'Modifica Cliente' : 'Nuovo Cliente'}>
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
    </Modal>
  );
}
