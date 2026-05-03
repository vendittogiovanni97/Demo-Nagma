"use client";

import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import { useTheme } from '@mui/material/styles';
import { spesaLiberaApi } from '../api/spesa-libera.api';
import { useToast } from '@/hooks/useToast';
import { extractErrorMessage } from '@/shared/utils/extract-error';
interface SpesaFormProps {
  monthStr: string;
  onSuccess?: () => void;
}

const glassPanelBaseSx = {
  backgroundColor: 'background.paper',
  backdropFilter: 'blur(20px)',
  border: 1,
  borderColor: 'divider',
  borderRadius: 3,
  transition: 'all 0.2s ease',
};

export default function SpesaForm({ monthStr, onSuccess }: SpesaFormProps) {
  const theme = useTheme();
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    const parsed = parseFloat(price);
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Prezzo non valido');
      return;
    }
    setIsAdding(true);
    try {
      await spesaLiberaApi.create({ name: name.trim(), price: parsed });
      onSuccess?.();
      setName('');
      setPrice('');
      nameRef.current?.focus();
      toast.success('Spesa aggiunta');
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Errore nel salvataggio'));
    } finally {
      setIsAdding(false);
    }
  };

  const inputSx = {
    borderRadius: 2,
    border: 1,
    borderColor: 'divider',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    px: 2,
    py: 1.5,
    color: theme.palette.text.primary,
    '& .MuiInputBase-input::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 1,
    },
    '&:focus-within': {
      borderColor: theme.palette.primary.main,
    },
    transition: 'border-color 0.2s ease',
  };

  return (
    <Box
      component="form"
      onSubmit={handleAdd}
      sx={{
        ...glassPanelBaseSx,
        p: 2.5,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.5,
        '&:hover': { transform: 'none' },
      }}
    >
      <InputBase
        inputRef={nameRef}
        type="text"
        placeholder="Nome spesa"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        sx={{ flex: 1, ...inputSx }}
      />
      <InputBase
        type="number"
        placeholder="Prezzo €"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        inputProps={{ step: '0.01', min: '0' }}
        required
        sx={{ width: { xs: '100%', sm: 144 }, ...inputSx }}
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={isAdding}
        isLoading={isAdding}
        loadingLabel="Aggiungo..."
        icon={isAdding ? undefined : <Plus size={18} />}
      >
        Aggiungi
      </Button>
    </Box>
  );
}
