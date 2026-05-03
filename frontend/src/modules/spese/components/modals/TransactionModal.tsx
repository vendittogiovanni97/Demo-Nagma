"use client";

import StatePanel from '@/components/feedback/StatePanel';
import { useAuth } from '@/context/AuthContext';
import { useFormModal } from '@/hooks/useFormModal';
import { useToast } from '@/hooks/useToast';
import { createTransactionSchema } from '@/modules/spese/model/transaction.schema';
import { transactionApi } from '@/modules/spese/api/transaction.api';
import type { CreateTransactionData, TransactionType } from '@/modules/spese/model/spese.types';
import { validateData } from '@/shared/utils/validation';
import { useState } from 'react';
import SmartModal from '@/components/common/SmartModal';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import { Box } from '@mui/material';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionModal({ isOpen, onClose }: Props) {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');

  const { isLoading: loading, handleSubmit: submitForm } = useFormModal<CreateTransactionData>({
    onSubmit: async (data) => { await transactionApi.create(data); return; },
    onClose,
    successMessage: `${type === 'INCOME' ? 'Entrata' : 'Spesa'} di € ${Number(amount).toFixed(2)} registrata!`,
    errorMessage: 'Errore nel salvare la transazione',
  });

  const handleSave = async () => {
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
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuova Voce Spesa / Entrata"
      onSave={handleSave}
      isSaving={loading}
      saveLabel="Registra Transazione"
      maxWidth="sm"
    >
      {!isAdmin ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin e segreteria possono registrare movimenti finanziari."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormInput
            label="Descrizione"
            required
            value={desc}
            onChange={setDesc}
            placeholder="Es. Affitto, Colori, Acconto Cliente..."
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
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
          </Box>
        </Box>
      )}
    </SmartModal>
  );
}
