'use client';
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';

export interface ConfirmDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'primary' | 'error' | 'warning';
  isDangerous?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmDialog = ({
  open,
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  severity = 'primary',
  isDangerous = false,
  loading = false,
  children,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();
  const resolvedOpen = !!(open ?? isOpen);
  const resolvedClose = onClose ?? onCancel ?? (() => {});
  const resolvedTitle = title ?? t('Conferma') ?? 'Conferma';
  const resolvedConfirmText = confirmText ?? t('Conferma');
  const resolvedCancelText = cancelText ?? t('Annulla');
  const resolvedSeverity = severity === 'primary' && isDangerous ? 'error' : severity;
  return (
    <Dialog
      open={resolvedOpen}
      onClose={resolvedClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{resolvedTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">{message}</DialogContentText>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={resolvedClose} color="inherit" variant="outlined" disabled={loading}>
          {resolvedCancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={resolvedSeverity === 'error' ? 'error' : resolvedSeverity === 'warning' ? 'warning' : 'primary'}
          variant="contained"
          autoFocus
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {resolvedConfirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
