"use client";

import { Box } from '@mui/material';
import { useEntityForm } from '@/common/hooks/useEntityForm';
import { staffApi } from '@/modules/staff/api/staff.api';
import SmartModal from '@/common/components/common/SmartModal';
import FormInput from '@/common/components/forms/FormInput';
import { Lock } from '@/common/components/ui/Icon';

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

const initialValues: ResetPasswordFormData = {
  newPassword: '',
  confirmPassword: '',
};

export default function ResetPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  memberId,
  userName,
}: ResetPasswordModalProps) {
  const form = useEntityForm<null, ResetPasswordFormData, { password: string }>({
    entity: null,
    open: isOpen,
    initial: () => initialValues,
    validate: (data) => {
      if (!data.newPassword || data.newPassword.length < 6) {
        return 'La password deve contenere almeno 6 caratteri';
      }
      if (data.newPassword !== data.confirmPassword) {
        return 'Le password inserite non sono uguali';
      }
      return null;
    },
    buildPayload: (data) => ({ password: data.newPassword }),
    persist: async (payload) => {
      await staffApi.resetMemberPassword(memberId, payload.password);
    },
    successMessage: `Password di ${userName} resettata`,
    errorMessage: 'Errore durante il reset della password',
    onClose,
    onSuccess,
  });

  const { formData, handleChange, isLoading } = form;

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reset Password - ${userName}`}
      onSave={form.handleSubmit}
      isSaving={isLoading}
      saveLabel="Resetta Password"
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormInput
          label="Nuova Password"
          type="password"
          value={formData.newPassword}
          onChange={handleChange('newPassword')}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        <FormInput
          label="Conferma Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          placeholder="••••••••"
          icon={Lock}
          required
        />
      </Box>
    </SmartModal>
  );
}
