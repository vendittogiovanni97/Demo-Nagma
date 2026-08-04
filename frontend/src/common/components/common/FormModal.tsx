"use client";

import SmartModal from '@/common/components/common/SmartModal';
import SaveButton, { CancelButton } from '@/common/components/ui/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (e?: any) => void | Promise<any>;
  children: ReactNode;
}

export default function FormModal({
  isOpen,
  onClose,
  title,
  maxWidth = 'sm',
  isSubmitting = false,
  submitLabel = 'Salva',
  cancelLabel = 'Annulla',
  onSubmit,
  children,
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
      showFooter={false}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {children}
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', pt: 1 }}>
            <CancelButton onClick={onClose} disabled={isSubmitting}>
              {cancelLabel}
            </CancelButton>
            <SaveButton
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {submitLabel}
            </SaveButton>
          </Stack>
        </Stack>
      </Box>
    </SmartModal>
  );
}
