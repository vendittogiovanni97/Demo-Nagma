"use client";

import React, { type FormEvent, type ReactNode, useCallback, useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  SxProps,
  Theme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import Button from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import { StatusChip } from '@/common/components/ui/StatusChip';
import { ConfirmDialog } from '@/common/components/ui/ConfirmDialog';

export type SmartModalMode = 'create' | 'edit' | 'read';

export interface SmartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  mode?: SmartModalMode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onSave?: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
  isSaving?: boolean;
  initialLoading?: boolean;
  error?: string | null;
  showFooter?: boolean;
  extraActions?: ReactNode;
  headerAction?: ReactNode;
  isDirty?: boolean;
  confirmCloseOnDirty?: boolean;
  fullScreenOnMobile?: boolean;
}

export default function SmartModal({
  isOpen,
  onClose,
  title,
  children,
  mode = 'create',
  maxWidth = 'sm',
  onSave,
  saveLabel = 'Salva',
  saveDisabled = false,
  isSaving = false,
  initialLoading = false,
  error = null,
  showFooter = true,
  extraActions,
  headerAction,
  isDirty = false,
  confirmCloseOnDirty = true,
  fullScreenOnMobile = true,
}: SmartModalProps) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [showDirtyConfirm, setShowDirtyConfirm] = useState(false);

  const isReadMode = mode === 'read';
  const effectiveSaveLabel = saveLabel === 'Salva' && mode === 'edit' ? 'Salva Modifiche' : saveLabel;

  const handleRequestClose = useCallback(() => {
    if (isSaving) return;
    if (isDirty && confirmCloseOnDirty && !isReadMode) {
      setShowDirtyConfirm(true);
    } else {
      onClose();
    }
  }, [isSaving, isDirty, confirmCloseOnDirty, isReadMode, onClose]);

  const handleSubmit = (event: FormEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isReadMode && !saveDisabled && !isSaving && !initialLoading) {
      onSave?.();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setShowDirtyConfirm(false);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (!isReadMode && !saveDisabled && !isSaving && !initialLoading && onSave) {
          event.preventDefault();
          onSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isReadMode, saveDisabled, isSaving, initialLoading, onSave]);

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleRequestClose}
        maxWidth={maxWidth}
        fullWidth
        fullScreen={isSmall && fullScreenOnMobile}
        scroll="paper"
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: handleSubmit,
            sx: (t: Theme) => styles.paper(t),
          },
          backdrop: { sx: styles.backdrop },
        }}
      >
        <DialogTitle sx={(t: Theme) => styles.titleWrapper(t)}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={styles.titleText}>{title}</Box>
            {isReadMode && (
              <Box
                sx={{
                  fontSize: '0.75rem',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '6px',
                  bgcolor: (t: Theme) => alpha(t.palette.text.primary, 0.08),
                  color: 'text.secondary',
                  fontWeight: 600,
                }}
              >
                Lettura
              </Box>
            )}
            {headerAction}
          </Box>
          <IconButton
            autoFocus
            onClick={handleRequestClose}
            disabled={isSaving}
            aria-label="Chiudi finestra"
            sx={(t: Theme) => styles.closeButton(t)}
            size="small"
          >
            <Icon name="x" size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={(t: Theme) => styles.content(t)}>
          {initialLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={40} sx={{ color: 'primary.main' }} />
            </Box>
          ) : (
            <>
              {error && <Box sx={(t: Theme) => styles.errorBox(t)}>{error}</Box>}
              {children}
            </>
          )}
        </DialogContent>

        {showFooter && (
          <DialogActions sx={(t: Theme) => styles.actions(t)}>
            {extraActions}
            <Button
              variant="ghost"
              onClick={handleRequestClose}
              disabled={isSaving}
              sx={{ fontWeight: 500 }}
            >
              {isReadMode ? 'Chiudi' : 'Annulla'}
            </Button>

            {!isReadMode && onSave && (
              <Button
                type="submit"
                variant="primary"
                disabled={saveDisabled || isSaving || initialLoading}
                sx={{ minWidth: 110, position: 'relative' }}
              >
                {isSaving ? (
                  <CircularProgress size={20} sx={{ color: 'inherit' }} />
                ) : (
                  effectiveSaveLabel
                )}
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>

      <ConfirmDialog
        open={showDirtyConfirm}
        onClose={() => setShowDirtyConfirm(false)}
        onConfirm={() => {
          setShowDirtyConfirm(false);
          onClose();
        }}
        title="Modifiche non salvate"
        message="Ci sono modifiche non salvate nella finestra. Sei sicuro di voler uscire e scartarle?"
        confirmText="Scarta modifiche"
        cancelText="Continua modifiche"
        severity="warning"
      />
    </>
  );
}

const styles = {
  paper: (theme: Theme) => ({
    backgroundColor: theme.palette.background.default,
    backdropFilter: 'blur(40px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    borderRadius: '16px',
    boxShadow: `0px 24px 64px ${alpha(theme.palette.common.black, 0.6)}, 0px 0px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
    backgroundImage: 'none',
    overflow: 'hidden',
  }),
  backdrop: (theme: Theme) => ({
    backgroundColor: alpha(theme.palette.common.black, 0.8),
    backdropFilter: 'blur(4px)',
  }),
  titleWrapper: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 3,
    py: 2.5,
    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    m: 0,
    backgroundColor: 'transparent',
  }),
  titleText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'primary.main',
    fontFamily: 'Outfit, sans-serif',
  } as SxProps<Theme>,
  closeButton: (theme: Theme) => ({
    color: 'text.secondary',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      color: 'primary.main',
    },
  }),
  content: (theme: Theme) => ({
    px: 3,
    pt: '16px !important',
    pb: 3,
    backgroundColor: 'transparent',
    '&::-webkit-scrollbar': { width: '6px' },
    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
      borderRadius: '10px',
      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.4) },
    },
  }),
  actions: (theme: Theme) => ({
    px: 3,
    py: 2.5,
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    gap: 1.5,
    justifyContent: 'flex-end',
  }),
  errorBox: (theme: Theme) => ({
    p: 2,
    mb: 2,
    borderRadius: 2,
    bgcolor: alpha(theme.palette.error.main, 0.1),
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
    color: 'error.main',
    fontSize: '0.85rem',
    fontWeight: 500,
  }),
};
