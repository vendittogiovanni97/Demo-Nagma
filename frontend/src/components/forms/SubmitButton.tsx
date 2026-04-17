"use client";

import { ReactNode } from 'react';
import Button from '@/components/ui/Button';

interface SubmitButtonProps {
  loading: boolean;
  label: string;
  loadingLabel?: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export default function SubmitButton({
  loading,
  label,
  loadingLabel,
  icon,
  variant = 'primary',
  disabled = false,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant={variant}
      size="lg"
      isLoading={loading}
      loadingLabel={loadingLabel || 'Salvataggio...'}
      icon={icon}
      fullWidth
      disabled={disabled}
    >
      {label}
    </Button>
  );
}
