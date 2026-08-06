"use client";

import { useAuth } from '@/common/context/AuthContext';
import { useEntityForm } from '@/common/hooks/useEntityForm';
import SmartModal from '@/common/components/common/SmartModal';
import StatePanel from '@/common/components/feedback/StatePanel';
import FormInput from '@/common/components/forms/FormInput';
import DatePicker from '@/common/components/forms/DatePicker';
import FormSelect from '@/common/components/forms/FormSelect';
import { Box } from '@mui/material';
import { financeApi } from '@/modules/finance/api/finance.api';
import type { CreateTransactionData, Transaction, TransactionType } from '@/common/shared/types/transaction';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  transaction: Transaction | null;
}

const CATEGORIES = {
  ENTRATA: ['Servizi', 'Vendita Prodotti', 'Corsi', 'Acconto', 'Altro'],
  USCITA: ['Affitto', 'Forniture', 'Marketing', 'Utenze', 'Pulizie', 'Stipendi', 'Tasse', 'Altro'],
} satisfies Record<TransactionType, string[]>;

interface TransactionFormData {
  description: string;
  amount: string;
  type: TransactionType;
  category: string;
  date: string;
}

export default function TransactionModal({ isOpen, onClose, onSuccess, transaction }: Props) {
  const { isAdmin } = useAuth();
  const isEdit = Boolean(transaction);

  const initial = (entity: Transaction | null): TransactionFormData => ({
    description: entity?.description ?? '',
    amount: entity?.amount?.toString() ?? '',
    type: entity?.type ?? 'USCITA',
    category: entity?.category ?? 'Altro',
    date: entity?.date ? entity.date.split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const buildPayload = (formData: TransactionFormData): CreateTransactionData => ({
    description: formData.description,
    amount: Number(formData.amount.replace(',', '.')),
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
    const amount = Number(formData.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return 'Importo deve essere maggiore di 0';
    return null;
  };

  const form = useEntityForm<Transaction, TransactionFormData, CreateTransactionData>({
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

  const handleTypeChange = (newType: TransactionType) => {
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
              required
              inputMode="decimal"
              value={form.formData.amount}
              onChange={(val) => {
                const cleaned = val.replace(/\./g, ',');
                if (cleaned === '' || /^\d*(,\d{0,2})?$/.test(cleaned)) {
                  form.setField('amount', cleaned);
                }
              }}
              placeholder="0,00"
            />
            <FormSelect
              label="Tipo"
              value={form.formData.type}
              onChange={(v) => handleTypeChange(v as TransactionType)}
              options={[
                { value: 'USCITA', label: 'Spesa (Uscita)' },
                { value: 'ENTRATA', label: 'Entrata' },
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
            <DatePicker
              label="Data"
              required
              value={form.formData.date}
              onChange={(val) => form.setField('date', val)}
            />
          </Box>
        </Box>
      )}
    </SmartModal>
  );
}
