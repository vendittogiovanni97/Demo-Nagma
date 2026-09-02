"use client";

import Box from '@mui/material/Box';
import SmartModal from '@/common/components/common/SmartModal';
import FormInput from '@/common/components/forms/FormInput';
import { useEntityForm } from '@/common/hooks/useEntityForm';

interface LiberaMovimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title: string;
  saveLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  invalidNameMessage: string;
  successMessage: string;
  errorMessage: string;
  onCreate: (values: { name: string; amount: number }) => Promise<unknown>;
  initialName?: string;
  initialAmount?: number;
}

interface FormData {
  name: string;
  amount: string;
}

/**
 * Modale condiviso per aggiungere un movimento "libero" (spesa/entrata).
 * La pagina fornisce testi e la funzione onCreate, che mappa l'importo sul
 * campo del proprio dominio (price/amount).
 */
export default function LiberaMovimentoModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  saveLabel,
  nameLabel,
  namePlaceholder,
  invalidNameMessage,
  successMessage,
  errorMessage,
  onCreate,
  initialName,
  initialAmount,
}: LiberaMovimentoModalProps) {
  const form = useEntityForm<null, FormData, { name: string; amount: number }, void>({
    entity: null,
    open: isOpen,
    initial: () => ({
      name: initialName || '',
      amount: initialAmount ? String(initialAmount) : '',
    }),
    validate: (data) => {
      if (!data.name.trim()) return invalidNameMessage;
      const parsed = parseFloat(data.amount.replace(',', '.'));
      if (isNaN(parsed) || parsed <= 0) return 'Inserisci un importo valido';
      return null;
    },
    buildPayload: (data) => ({
      name: data.name.trim(),
      amount: parseFloat(data.amount.replace(',', '.')),
    }),
    persist: async (payload) => {
      await onCreate(payload);
    },
    successMessage,
    errorMessage,
    onClose,
    onSuccess,
  });

  const { formData, setField, isLoading, handleChange } = form;

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      onSave={() => form.handleSubmit()}
      isSaving={isLoading}
      saveLabel={saveLabel}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormInput
          label={nameLabel}
          value={formData.name}
          onChange={handleChange('name')}
          placeholder={namePlaceholder}
          required
        />
        <FormInput
          label="Importo (€)"
          value={formData.amount}
          onChange={(val) => {
            const cleaned = val.replace(/\./g, ',');
            if (cleaned === '' || /^\d*(,\d{0,2})?$/.test(cleaned)) {
              setField('amount', cleaned);
            }
          }}
          placeholder="0,00"
          inputMode="decimal"
          required
        />
      </Box>
    </SmartModal>
  );
}
