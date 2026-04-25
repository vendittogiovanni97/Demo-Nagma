"use client";

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Alert, Box, IconButton, InputAdornment, Stack, TextField, Typography, useTheme } from '@mui/material';
import Button from '@/components/ui/Button';
import Modal from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  loading?: boolean;
}

export default function PasswordConfirmModal({ isOpen, onClose, onConfirm, loading }: Props) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password richiesta');
      return;
    }

    try {
      await onConfirm(password);
      setPassword('');
    } catch (err: any) {
      setError(err?.message || 'Password non corretta');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Conferma Modifica" maxWidth="sm">
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} onSubmit={handleSubmit}>
        <Typography sx={{ fontSize: '0.8125rem', color: theme.palette.text.secondary }}>
          Inserisci la password per confermare la modifica della prenotazione.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography sx={{ px: 0.5, fontSize: '0.75rem', fontWeight: 600, color: theme.palette.primary.main, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Password
          </Typography>
          <TextField
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Inserisci password..."
            size="small"
            fullWidth
            error={!!error}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowPassword(!showPassword)} title={showPassword ? 'Nascondi' : 'Mostra'}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1.5, fontSize: '0.9375rem' } }}
          />
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Stack direction="row" useFlexGap sx={{ gap: 1, justifyContent: 'flex-end', pt: 1 }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            Conferma
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
