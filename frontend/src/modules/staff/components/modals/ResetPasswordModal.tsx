"use client";

import { useState } from 'react';
import { Box } from '@mui/material';

import { useToast } from '@/hooks/useToast';
import { teamApi } from '@/modules/staff/api/staff.api';
import { extractErrorMessage } from '@/shared/utils/extract-error';
import SmartModal from '@/components/common/SmartModal';
import FormInput from '@/components/forms/FormInput';
import { Lock } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Le password inserite non sono uguali');
      return;
    }

    setLoading(true);
    try {
      await teamApi.resetMemberPassword(memberId, newPassword);
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
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reset Password - ${userName}`}
      onSave={handleSave}
      isSaving={loading}
      saveLabel="Resetta Password"
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormInput
          label="Nuova Password"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        <FormInput
          label="Conferma Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="••••••••"
          icon={Lock}
          required
        />
      </Box>
    </SmartModal>
  );
}
