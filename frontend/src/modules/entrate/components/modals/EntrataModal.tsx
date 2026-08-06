"use client";

import Box from '@mui/material/Box';
import SmartModal from '@/common/components/common/SmartModal';
import FormInput from '@/common/components/forms/FormInput';
import { useEntityForm } from '@/common/hooks/useEntityForm';
import { entrataLiberaApi } from '../../api/entrata-libera.api';

interface EntrataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EntrataFormData {
  name: string;
  amount: string;
}

const initialValues: EntrataFormData = {
  name: '',
  amount: '',
};

export default function EntrataModal({ isOpen, onClose, onSuccess }: EntrataModalProps) {
  const form = useEntityForm<null, EntrataFormData, { name: string; amount: number }, void>({
    entity: null,
    open: isOpen,
    initial: () => initialValues,
    validate: (data) => {
      if (!data.name.trim()) return "Inserisci il nome dell'entrata";
      const parsed = parseFloat(data.amount.replace(',', '.'));
      if (isNaN(parsed) || parsed <= 0) return 'Inserisci un importo valido';
      return null;
    },
    buildPayload: (data) => ({
      name: data.name.trim(),
      amount: parseFloat(data.amount.replace(',', '.')),
    }),
    persist: async (payload) => {
      await entrataLiberaApi.create(payload);
    },
    successMessage: 'Entrata aggiunta',
    errorMessage: 'Errore nel salvataggio dell\'entrata',
    onClose,
    onSuccess,
  });

  const { formData, setField, isLoading, handleChange } = form;

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuova Entrata"
      maxWidth="xs"
      onSave={() => form.handleSubmit()}
      isSaving={isLoading}
      saveLabel="Aggiungi Entrata"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormInput
          label="Nome entrata"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="es. Rimborso, Extra, Vendita..."
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
