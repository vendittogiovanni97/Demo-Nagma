"use client";

import { Box, Typography } from '@mui/material';
import Card from '@/common/components/ui/Card';
import FormInput from '@/common/components/forms/FormInput';
import { SaveButton } from '@/common/components/ui/Button';
import { Lock } from '@/common/components/ui/Icon';
import { useChangePassword } from '../hooks/useChangePassword';

export default function ChangePasswordCard() {
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    errors,
    saving,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleSave,
  } = useChangePassword();

  return (
    <Card variant="glass" size="lg" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box>
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: 'text.primary' }}>
          Cambia Password
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: 0.5 }}>
          Aggiorna la password del tuo account.
        </Typography>
      </Box>

      <FormInput
        label="Password attuale"
        type="password"
        value={currentPassword}
        onChange={setCurrentPassword}
        placeholder="Inserisci la password attuale..."
        icon={Lock}
        error={errors.current}
        name="settings-current-password"
        autoComplete="current-password"
      />
      <FormInput
        label="Nuova password"
        type="password"
        value={newPassword}
        onChange={setNewPassword}
        placeholder="Almeno 6 caratteri..."
        icon={Lock}
        error={errors.next}
        name="settings-new-password"
        autoComplete="new-password"
      />
      <FormInput
        label="Conferma nuova password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="Ripeti la nuova password..."
        icon={Lock}
        error={errors.confirm}
        name="settings-confirm-password"
        autoComplete="new-password"
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveButton onClick={handleSave} isLoading={saving}>
          Aggiorna password
        </SaveButton>
      </Box>
    </Card>
  );
}
