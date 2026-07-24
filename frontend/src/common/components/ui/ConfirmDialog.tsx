'use client';
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Icon from '@/common/components/ui/Icon';
import Button, {
  CancelButton,
  DeleteButton,
  OkButton,
} from '@/common/components/ui/Button';

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
  const theme = useTheme();
  const resolvedOpen = !!(open ?? isOpen);
  const resolvedClose = onClose ?? onCancel ?? (() => {});
  const resolvedTitle = title ?? t('Conferma') ?? 'Conferma';
  const resolvedConfirmText = confirmText ?? t('Conferma');
  const resolvedCancelText = cancelText ?? t('Annulla');
  const resolvedSeverity = severity === 'primary' && isDangerous ? 'error' : severity;
  const severityColor = theme.palette[resolvedSeverity].main;
  const ConfirmButton = resolvedSeverity === 'error'
    ? DeleteButton
    : resolvedSeverity === 'primary'
      ? OkButton
      : Button;

  return (
    <Dialog
      open={resolvedOpen}
      onClose={resolvedClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      fullWidth
      maxWidth="xs"
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: alpha(theme.palette.common.black, 0.72),
            backdropFilter: 'blur(4px)',
          },
        },
        paper: {
          sx: {
            m: 2,
            borderRadius: 3,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            border: `1px solid ${alpha(severityColor, 0.42)}`,
            boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.5)}`,
            overflow: 'hidden',
          },
        },
      }}
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 2.5, sm: 3 },
          py: 2.25,
          color: 'text.primary',
          fontSize: '1.05rem',
          fontWeight: 800,
          borderBottom: `1px solid ${alpha(severityColor, 0.2)}`,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 2,
            color: severityColor,
            bgcolor: alpha(severityColor, 0.12),
            border: `1px solid ${alpha(severityColor, 0.28)}`,
          }}
        >
          <Icon
            name={resolvedSeverity === 'error' ? 'alertTriangle' : 'info'}
            size={21}
          />
        </Box>
        {resolvedTitle}
      </DialogTitle>

      <DialogContent
        sx={{
          pl: { xs: 9, sm: 9.5 },
          pr: { xs: 2.5, sm: 3 },
          py: 2.25,
          minHeight: 72,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 1.5,
        }}
      >
        <DialogContentText
          id="confirm-dialog-description"
          sx={{
            m: 0,
            color: 'text.primary',
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}
        >
          {message}
        </DialogContentText>
        {children}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2.25,
          gap: 1.25,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CancelButton
          onClick={resolvedClose}
          disabled={loading}
          variant="secondary"
          sx={{ minWidth: 112, minHeight: 44 }}
        >
          {resolvedCancelText}
        </CancelButton>
        <ConfirmButton
          onClick={onConfirm}
          variant={resolvedSeverity === 'warning' ? 'secondary' : undefined}
          autoFocus
          isLoading={loading}
          loadingLabel={resolvedConfirmText}
          icon={<Icon name={resolvedSeverity === 'error' ? 'trash2' : 'check'} size={17} />}
          sx={{
            minWidth: 124,
            minHeight: 44,
            ...(resolvedSeverity === 'warning' && {
              bgcolor: theme.palette.warning.main,
              color: theme.palette.warning.contrastText,
              '&:hover': { bgcolor: theme.palette.warning.dark },
            }),
          }}
        >
          {resolvedConfirmText}
        </ConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
