"use client";

import StatePanel from '@/common/components/feedback/StatePanel';
import { useAuth } from '@/common/context/AuthContext';
import { useFormModal } from '@/common/hooks/useFormModal';
import { useToast } from '@/common/hooks/useToast';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import SmartModal from '@/common/components/common/SmartModal';
import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';
import { Box } from '@mui/material';
import { financeApi, Transaction } from '@/modules/finance/api/finance.api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  transaction?: Transaction | null;
}

const CATEGORIES = {
  INCOME: ['Servizi', 'Vendita Prodotti', 'Corsi', 'Acconto', 'Altro'],
  EXPENSE: ['Affitto', 'Forniture', 'Marketing', 'Utenze', 'Pulizie', 'Stipendi', 'Tasse', 'Altro']
};

export default function TransactionModal({ isOpen, onClose, onSuccess, transaction }: Props) {
  const isEdit = Boolean(transaction);
  const toast = useToast();
  const { isAdmin } = useAuth();
  
  const [desc, setDesc] = useState(transaction?.description ?? '');
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? '');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(transaction?.type ?? 'EXPENSE');
  const [category, setCategory] = useState(transaction?.category ?? 'Altro');
  const [date, setDate] = useState(transaction?.date ? format(new Date(transaction.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (transaction) {
      setDesc(transaction.description);
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      setCategory(transaction.category);
      setDate(format(new Date(transaction.date), 'yyyy-MM-dd'));
    } else {
      setDesc('');
      setAmount('');
      setType('EXPENSE');
      setCategory('Altro');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [transaction, isOpen]);

  const { isLoading: loading, handleSubmit: submitForm } = useFormModal<any>({
    onSubmit: async (data) => { 
      if (isEdit && transaction) {
        await financeApi.update(transaction.id, data);
      } else {
        await financeApi.create(data);
      }
      onSuccess?.();
    },
    onClose,
    successMessage: isEdit ? 'Transazione aggiornata!' : 'Transazione registrata!',
    errorMessage: 'Errore nel salvare la transazione',
  });

  const handleSave = async () => {
    const data = {
      description: desc,
      amount: Number(amount),
      type,
      category,
      date: new Date(date).toISOString(),
    };

    if (!desc || !amount || Number(amount) <= 0) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    await submitForm(data);
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Modifica Transazione' : 'Nuova Voce Spesa / Entrata'}
      onSave={handleSave}
      isSaving={loading}
      saveLabel={isEdit ? 'Salva Modifiche' : 'Registra Transazione'}
      maxWidth="sm"
    >
      {!isAdmin ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin possono registrare movimenti finanziari."
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
              onChange={(v) => {
                const newType = v as 'INCOME' | 'EXPENSE';
                setType(newType);
                setCategory(CATEGORIES[newType][0]);
              }}
              options={[
                { value: 'EXPENSE', label: 'Spesa (Uscita)' },
                { value: 'INCOME', label: 'Entrata' },
              ]}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormSelect
              label="Categoria"
              value={category}
              onChange={(v) => setCategory(v as string)}
              options={CATEGORIES[type].map(c => ({ value: c, label: c }))}
            />
            <FormInput
              label="Data"
              type="date"
              required
              value={date}
              onChange={setDate}
            />
          </Box>
        </Box>
      )}
    </SmartModal>
  );
}

