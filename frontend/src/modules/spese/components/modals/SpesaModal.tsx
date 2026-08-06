"use client";

import Box from '@mui/material/Box';
import SmartModal from '@/common/components/common/SmartModal';
import FormInput from '@/common/components/forms/FormInput';
import { useEntityForm } from '@/common/hooks/useEntityForm';
import { spesaLiberaApi } from '../../api/spesa-libera.api';

interface SpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SpesaFormData {
  name: string;
  amount: string;
}

const initialValues: SpesaFormData = {
  name: '',
  amount: '',
};

export default function SpesaModal({ isOpen, onClose, onSuccess }: SpesaModalProps) {
  const form = useEntityForm<null, SpesaFormData, { name: string; price: number }, void>({
    entity: null,
    open: isOpen,
    initial: () => initialValues,
    validate: (data) => {
      if (!data.name.trim()) return 'Inserisci il nome della spesa';
      const parsed = parseFloat(data.amount.replace(',', '.'));
      if (isNaN(parsed) || parsed <= 0) return 'Inserisci un importo valido';
      return null;
    },
    buildPayload: (data) => ({
      name: data.name.trim(),
      price: parseFloat(data.amount.replace(',', '.')),
    }),
    persist: async (payload) => {
      await spesaLiberaApi.create(payload);
    },
    successMessage: 'Spesa aggiunta',
    errorMessage: 'Errore nel salvataggio della spesa',
    onClose,
    onSuccess,
  });

  const { formData, setField, isLoading, handleChange } = form;

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuova Spesa"
      maxWidth="xs"
      onSave={() => form.handleSubmit()}
      isSaving={isLoading}
      saveLabel="Aggiungi Spesa"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormInput
          label="Nome spesa"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="es. Caffè, Affitto, Materiale..."
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
