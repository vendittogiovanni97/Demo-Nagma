"use client";

import { useState } from 'react';
import { transactionService } from '@/services/transaction.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { useFormModal } from '@/hooks/useFormModal';
import type { CreateTransactionData, TransactionType } from '@/types/transaction';
import Modal from './Modal';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import SubmitButton from '../forms/SubmitButton';
import StatePanel from '@/components/feedback/StatePanel';
import { validateData } from '@/utils/validation';
import { createTransactionSchema } from '@/schemas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionModal({ isOpen, onClose }: Props) {
  const toast = useToast();
  const { can } = useAuth();
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');

  const { isLoading: loading, handleSubmit: submitForm } = useFormModal<CreateTransactionData>({
    onSubmit: async (data) => { await transactionService.create(data); return; },
    onClose,
    successMessage: `${type === 'INCOME' ? 'Entrata' : 'Spesa'} di € ${Number(amount).toFixed(2)} registrata!`,
    errorMessage: 'Errore nel salvare la transazione',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateTransactionData = {
      description: desc,
      amount: Number(amount),
      type,
      category: type === 'INCOME' ? 'Servizi' : 'Forniture',
    };
    const validationError = validateData(createTransactionSchema, data);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setDesc('');
    setAmount('');
    setType('EXPENSE');
    await submitForm(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuova Voce Spesa / Entrata">
      {!can.manageFinance ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin e segreteria possono registrare movimenti finanziari."
        />
      ) : (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Descrizione"
          required
          value={desc}
          onChange={setDesc}
          placeholder="Es. Affitto, Colori, Acconto Cliente..."
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Importo (€)"
            type="number"
            required
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
            step="0.01"
            min={0}
          />
          <FormSelect
            label="Tipo"
            value={type}
            onChange={(v) => setType(v as TransactionType)}
            options={[
              { value: 'EXPENSE', label: 'Spesa (Uscita)' },
              { value: 'INCOME', label: 'Entrata' },
            ]}
          />
        </div>

        <SubmitButton loading={loading} label="Registra Transazione" loadingLabel="Registrazione in corso..." />
      </form>
      )}
    </Modal>
  );
}
