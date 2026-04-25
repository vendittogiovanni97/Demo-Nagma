"use client";

import { useState } from 'react';
import { Box, TextField, Typography, useTheme } from '@mui/material';
import Modal from './Modal';
import SubmitButton from '../forms/SubmitButton';
import { useToast } from '@/hooks/useToast';
import { teamService } from '@/services/team.service';
import { extractErrorMessage } from '@/utils/extract-error';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memberId: number;
  userName: string;
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  memberId,
  userName,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Le password inserite non sono uguali');
      return;
    }

    setLoading(true);
    try {
      await teamService.resetMemberPassword(memberId, newPassword);
      toast.success(`Password di ${userName} resettata`);
      setNewPassword('');
      setConfirmPassword('');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Errore durante il reset della password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reset Password - ${userName}`} maxWidth="sm">
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography sx={{ px: 0.5, fontSize: '0.75rem', fontWeight: 600, color: theme.palette.primary.main, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Nuova Password
          </Typography>
          <TextField
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            size="small"
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1.5, fontSize: '0.9375rem' } }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography sx={{ px: 0.5, fontSize: '0.75rem', fontWeight: 600, color: theme.palette.primary.main, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Conferma Password
          </Typography>
          <TextField
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            size="small"
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1.5, fontSize: '0.9375rem' } }}
          />
        </Box>

        <SubmitButton loading={loading} label="Resetta Password" />
      </Box>
    </Modal>
  );
}
