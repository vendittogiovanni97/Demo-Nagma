"use client";

import { useAuth } from '@/common/context/AuthContext';
import { useToast } from '@/common/hooks/useToast';
import { useEntityForm } from '@/common/hooks/useEntityForm';
import SmartModal from '@/common/components/common/SmartModal';
import StatePanel from '@/common/components/feedback/StatePanel';
import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';
import { Box } from '@mui/material';
import { financeApi, Transaction, CreateTransactionData } from '@/modules/finance/api/finance.api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  transaction: Transaction | null;
}

const CATEGORIES = {
  INCOME: ['Servizi', 'Vendita Prodotti', 'Corsi', 'Acconto', 'Altro'],
  EXPENSE: ['Affitto', 'Forniture', 'Marketing', 'Utenze', 'Pulizie', 'Stipendi', 'Tasse', 'Altro']
};

interface TransactionFormData {
  description: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
}

export default function TransactionModal({ isOpen, onClose, onSuccess, transaction }: Props) {
  const { isAdmin } = useAuth();
  const isEdit = Boolean(transaction);

  const initial = (entity: Transaction | null): TransactionFormData => ({
    description: entity?.description ?? '',
    amount: entity?.amount?.toString() ?? '',
    type: entity?.type ?? 'EXPENSE',
    category: entity?.category ?? 'Altro',
    date: entity?.date ? entity.date.split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const buildPayload = (formData: TransactionFormData): CreateTransactionData => ({
    description: formData.description,
    amount: Number(formData.amount),
    type: formData.type,
    category: formData.category,
    date: new Date(formData.date).toISOString(),
  });

  const persist = async (payload: CreateTransactionData, entity: Transaction | null) => {
    if (entity) {
      await financeApi.update(entity.id, payload);
    } else {
      await financeApi.create(payload);
    }
  };

  const validate = (formData: TransactionFormData): string | null => {
    if (!formData.description.trim()) return 'Descrizione obbligatoria';
    const amount = Number(formData.amount);
    if (isNaN(amount) || amount <= 0) return 'Importo deve essere maggiore di 0';
    return null;
  };

  const form = useEntityForm<Transaction, TransactionFormData>({
    entity: transaction,
    open: isOpen,
    initial,
    buildPayload,
    persist,
    successMessage: (isEdit) => (isEdit ? 'Transazione aggiornata!' : 'Transazione registrata!'),
    onSuccess,
    onClose,
    validate,
    errorMessage: 'Errore nel salvare la transazione',
  });

  const handleTypeChange = (newType: 'INCOME' | 'EXPENSE') => {
    form.setFields({ type: newType, category: CATEGORIES[newType][0] });
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={form.handleClose}
      title={isEdit ? 'Modifica Transazione' : 'Nuova Voce Spesa / Entrata'}
      onSave={form.handleSubmit}
      isSaving={form.isLoading}
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
            value={form.formData.description}
            onChange={form.handleChange('description')}
            placeholder="Es. Affitto, Colori, Acconto Cliente..."
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormInput
              label="Importo (€)"
              type="number"
              required
              value={form.formData.amount}
              onChange={form.handleChange('amount')}
              placeholder="0.00"
              step="0.01"
              min={0}
            />
            <FormSelect
              label="Tipo"
              value={form.formData.type}
              onChange={(v) => handleTypeChange(v as 'INCOME' | 'EXPENSE')}
              options={[
                { value: 'EXPENSE', label: 'Spesa (Uscita)' },
                { value: 'INCOME', label: 'Entrata' },
              ]}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormSelect
              label="Categoria"
              value={form.formData.category}
              onChange={(v) => form.setField('category', v as string)}
              options={CATEGORIES[form.formData.type].map((c) => ({ value: c, label: c }))}
            />
            <FormInput
              label="Data"
              type="date"
              required
              value={form.formData.date}
              onChange={form.handleChange('date')}
            />
          </Box>
        </Box>
      )}
    </SmartModal>
  );
}