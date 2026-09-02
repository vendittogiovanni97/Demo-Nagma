"use client";

import { useState } from 'react';
import { authService } from '@/modules/auth/api/auth.api';
import { useToast } from '@/common/hooks/useToast';

export function useChangePassword() {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  const handleSave = async () => {
    const nextErrors: { current?: string; next?: string; confirm?: string } = {};
    if (!currentPassword) nextErrors.current = 'Password attuale richiesta';
    if (!newPassword) nextErrors.next = 'Nuova password richiesta';
    else if (newPassword.length < 6) nextErrors.next = 'Minimo 6 caratteri';
    if (newPassword && confirmPassword !== newPassword) nextErrors.confirm = 'Le password non coincidono';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password aggiornata con successo');
      reset();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Errore durante il cambio password';
      toast.error(message);
      // Evidenzia il campo "password attuale" solo quando è davvero quella errata,
      // non per errori di rete/validazione/server.
      if (/attuale|current/i.test(message)) {
        setErrors({ current: message });
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    errors,
    saving,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleSave,
  };
}
