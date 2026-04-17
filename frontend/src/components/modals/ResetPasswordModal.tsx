"use client";

import { useState } from 'react';
import Modal from './Modal';
import FormInput from '../forms/FormInput';
import SubmitButton from '../forms/SubmitButton';
import { teamService } from '@/services/team.service';
import { notifyError, notifySuccess } from '@/utils/toast';

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      notifyError(new Error('Le password non corrispondono'), 'Le password inserite non sono uguali');
      return;
    }

    setLoading(true);
    try {
      await teamService.resetMemberPassword(memberId, newPassword);
      notifySuccess(`Password di ${userName} resettata`);
      setNewPassword('');
      setConfirmPassword('');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      notifyError(error, 'Errore durante il reset della password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reset Password - ${userName}`} maxWidth="max-w-md">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Nuova Password"
          type="password"
          required
          value={newPassword}
          onChange={setNewPassword}
          placeholder="••••••••"
        />

        <FormInput
          label="Conferma Password"
          type="password"
          required
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="••••••••"
        />

        <SubmitButton loading={loading} label="Resetta Password" />
      </form>
    </Modal>
  );
}
