"use client";

import React, { ReactNode } from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
  CircularProgress,
  SxProps,
  Theme,
} from '@mui/material';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface SmartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onSave?: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
  isSaving?: boolean;
  showFooter?: boolean;
  extraActions?: ReactNode;
}

export default function SmartModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  onSave,
  saveLabel = 'Salva',
  saveDisabled = false,
  isSaving = false,
  showFooter = true,
  extraActions,
}: SmartModalProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={isOpen}
      onClose={isSaving ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      scroll="paper"
      slotProps={{
        paper: { sx: styles.paper },
        backdrop: { sx: styles.backdrop },
      }}
    >
      <DialogTitle sx={styles.titleWrapper}>
        <Box sx={styles.titleText}>{title}</Box>
        <IconButton
          onClick={onClose}
          disabled={isSaving}
          sx={styles.closeButton}
          size="small"
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={styles.content}>
        {children}
      </DialogContent>

      {showFooter && (
        <DialogActions sx={styles.actions}>
          {extraActions}
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
            sx={{ fontWeight: 500 }}
          >
            Annulla
          </Button>

          {onSave && (
            <Button
              variant="primary"
              onClick={onSave}
              disabled={saveDisabled || isSaving}
              sx={{ minWidth: 100, position: 'relative' }}
            >
              {isSaving ? (
                <CircularProgress size={20} sx={{ color: 'inherit' }} />
              ) : (
                saveLabel
              )}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}

const styles = {
  paper: {
    backgroundColor: 'rgba(10, 26, 38, 0.95)',
    backdropFilter: 'blur(40px)',
    border: '1px solid rgba(0, 191, 255, 0.12)',
    borderRadius: '16px',
    boxShadow: '0px 24px 64px rgba(0, 0, 0, 0.6), 0px 0px 32px rgba(0, 191, 255, 0.1)',
    backgroundImage: 'none',
    overflow: 'hidden',
  } as SxProps<Theme>,
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(4px)'
  } as SxProps<Theme>,
  titleWrapper: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    px: 3, py: 2.5, borderBottom: '1px solid rgba(0, 191, 255, 0.1)', m: 0
  } as SxProps<Theme>,
  titleText: {
    fontSize: '1.25rem', fontWeight: 700, color: 'primary.main',
    fontFamily: 'Outfit, sans-serif',
  } as SxProps<Theme>,
  closeButton: {
    color: 'text.secondary',
    '&:hover': {
      backgroundColor: 'rgba(0, 191, 255, 0.1)',
      color: 'primary.main',
    }
  } as SxProps<Theme>,
  content: {
    px: 3, py: 3,
    '&::-webkit-scrollbar': { width: '6px' },
    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0, 191, 255, 0.2)',
      borderRadius: '10px',
      '&:hover': { backgroundColor: 'rgba(0, 191, 255, 0.4)' }
    }
  } as SxProps<Theme>,
  actions: {
    px: 3, py: 2.5, borderTop: '1px solid rgba(0, 191, 255, 0.1)',
    gap: 1.5, justifyContent: 'flex-end',
  } as SxProps<Theme>,
};
