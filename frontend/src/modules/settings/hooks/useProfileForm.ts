"use client";

import { useState } from 'react';

import { useToast } from '@/hooks/useToast';
import { authService } from '@/modules/auth/api/auth.api';
import { extractErrorMessage } from '@/shared/utils/extract-error';

interface UseProfileFormOptions {
  initialName?: string;
}

export function useProfileForm({ initialName = '' }: UseProfileFormOptions = {}) {
  const toast = useToast();

  const [profileName, setProfileName] = useState(initialName);
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await authService.updateMe({ name: profileName, phone: profilePhone });
      toast.success('Profilo aggiornato');
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, "Errore durante l'aggiornamento del profilo"));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Le password inserite non sono uguali');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password cambiata');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Errore durante il cambio della password'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return {
    profileName,
    setProfileName,
    profilePhone,
    setProfilePhone,
    profileLoading,
    handleUpdateProfile,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordLoading,
    handleChangePassword,
  };
}
