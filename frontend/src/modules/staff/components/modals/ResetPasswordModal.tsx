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

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  memberId,
  userName,
}: ResetPasswordModalProps) {
  const toast = useToast();

  const form = useFormModal<ResetPasswordFormData>({
    initial: { newPassword: '', confirmPassword: '' },
    onSubmit: async (data) => {
      await staffApi.resetMemberPassword(memberId, data.newPassword);
      onSuccess();
    },
    onClose,
    successMessage: `Password di ${userName} resettata`,
    errorMessage: 'Errore durante il reset della password',
  });

  const handleSave = async () => {
    if (form.formData.newPassword !== form.formData.confirmPassword) {
      toast.error('Le password inserite non sono uguali');
      return;
    }
    await form.handleSubmit();
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reset Password - ${userName}`}
      onSave={handleSave}
      isSaving={form.isLoading}
      saveLabel="Resetta Password"
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormInput
          label="Nuova Password"
          type="password"
          value={form.formData.newPassword}
          onChange={form.handleChange('newPassword')}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        <FormInput
          label="Conferma Password"
          type="password"
          value={form.formData.confirmPassword}
          onChange={form.handleChange('confirmPassword')}
          placeholder="••••••••"
          icon={Lock}
          required
        />
      </Box>
    </SmartModal>
  );
}
