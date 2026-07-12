"use client";

import { useState } from 'react';
import { Box } from '@mui/material';

import { useFormModal } from '@/common/hooks/useFormModal';
import { useToast } from '@/common/hooks/useToast';
import { staffApi } from '@/modules/staff/api/staff.api';
import SmartModal from '@/common/components/common/SmartModal';
import FormInput from '@/common/components/forms/FormInput';
import Icon, { Lock } from '@/common/components/ui/Icon';

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

  const { isLoading, handleSubmit } = useFormModal({
    onSubmit: async () => {
      await staffApi.resetMemberPassword(memberId, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      onSuccess();
    },
    onClose,
    successMessage: `Password di ${userName} resettata`,
    errorMessage: 'Errore durante il reset della password',
  });

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Le password inserite non sono uguali');
      return;
    }
    await handleSubmit();
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reset Password - ${userName}`}
      onSave={handleSave}
      isSaving={isLoading}
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
