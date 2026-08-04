"use client";

import { SaveButton } from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import { alpha, useTheme } from '@mui/material/styles';
import { useToast } from '@/common/hooks/useToast';
import { extractErrorMessage } from '@/common/shared/utils/extract-error';

export interface InlineAddFormProps {
  namePlaceholder: string;
  amountPlaceholder?: string;
  submitLabel?: string;
  onAdd: (data: { name: string; amount: number }) => Promise<void>;
  successMessage?: string;
}

export default function InlineAddForm({
  namePlaceholder,
  amountPlaceholder = 'Importo €',
  submitLabel = 'Aggiungi',
  onAdd,
  successMessage = 'Aggiunto con successo',
}: InlineAddFormProps) {
  const theme = useTheme();
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  const handleAmountChange = (raw: string) => {
    const cleaned = raw.replace(/\./g, ',');
    if (cleaned === '' || /^\d*(,\d{0,2})?$/.test(cleaned)) {
      setAmount(cleaned);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Importo non valido');
      return;
    }
    setIsAdding(true);
    try {
      await onAdd({ name: name.trim(), amount: parsed });
      setName('');
      setAmount('');
      nameRef.current?.focus();
      toast.success(successMessage);
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Errore nel salvataggio'));
    } finally {
      setIsAdding(false);
    }
  };

  const inputSx = {
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: alpha(theme.palette.common.white, 0.03),
    px: 2,
    height: '42px',
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '& .MuiInputBase-input::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 1,
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.05),
    },
    '&:focus-within': {
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  };

  return (
    <Box
      component="form"
      onSubmit={handleAdd}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.5,
        width: '100%',
        alignItems: 'center',
      }}
    >
      <InputBase
        inputRef={nameRef}
        type="text"
        placeholder={namePlaceholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        sx={{ flex: 1, width: '100%', ...inputSx }}
      />
      <InputBase
        type="text"
        placeholder={amountPlaceholder}
        value={amount}
        onChange={(e) => handleAmountChange(e.target.value)}
        inputProps={{ inputMode: 'decimal' }}
        required
        sx={{ width: { xs: '100%', sm: 140 }, ...inputSx }}
      />
      <SaveButton
        type="submit"
        variant="secondary"
        disabled={isAdding}
        isLoading={isAdding}
        loadingLabel="..."
        icon={isAdding ? undefined : <Icon name="plus" size={16} />}
        sx={{
          height: '42px',
          width: { xs: '100%', sm: 'auto' },
          px: 3,
          borderRadius: 2,
          fontWeight: 600,
        }}
      >
        {submitLabel}
      </SaveButton>
    </Box>
  );
}
