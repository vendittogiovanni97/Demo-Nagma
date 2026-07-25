"use client";

import React, { useState, type ReactNode } from 'react';
import { Typography, SxProps, Theme } from '@mui/material';
import SmartModal from '@/common/components/common/SmartModal';
import FormInput from '@/common/components/forms/FormInput';
import Icon, { Lock } from '@/common/components/ui/Icon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  loading?: boolean;
  title?: string;
  description?: string;
  extra?: ReactNode;
}

export default function PasswordConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = 'Conferma Modifica',
  description = 'Inserisci la password per confermare la modifica della prenotazione.',
  extra,
}: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    if (!password) {
      setError('Password richiesta');
      return;
    }

    try {
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Password non corretta');
    }
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      onSave={handleSave}
      isSaving={loading}
      saveLabel="Conferma"
    >
      <Typography sx={styles.description}>
        {description}
      </Typography>

      {extra}

      <FormInput
        label="Password"
        type="text"
        value={password}
        onChange={setPassword}
        placeholder="Inserisci password..."
        icon={Lock}
        error={error}
        name="conferma-password"
        autoComplete="off"
        sx={{ '& input': { WebkitTextSecurity: 'disc' } as React.CSSProperties }}
      />
    </SmartModal>
  );
}

const styles = {
  description: {
    fontSize: '0.875rem', color: 'text.secondary', mb: 3
  } as SxProps<Theme>,
};
