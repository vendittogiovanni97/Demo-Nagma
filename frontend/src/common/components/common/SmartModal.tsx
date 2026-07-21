"use client";

import Button from '@/common/components/ui/Button';
import { alpha } from '@mui/material/styles';
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
  useTheme,
} from '@mui/material';
import Icon from '@/common/components/ui/Icon';
import { ReactNode } from 'react';

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
  initialLoading?: boolean;
  error?: string | null;
  showFooter?: boolean;
  extraActions?: ReactNode;
  headerAction?: ReactNode;
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
  initialLoading = false,
  error = null,
  showFooter = true,
  extraActions,
  headerAction,
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
        paper: { sx: (t: Theme) => styles.paper(t) },
        backdrop: { sx: styles.backdrop },
      }}
    >
      <DialogTitle sx={(t: Theme) => styles.titleWrapper(t)}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={styles.titleText}>{title}</Box>
          {headerAction}
        </Box>
        <IconButton
          onClick={onClose}
          disabled={isSaving}
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
            {error && (
              <Box sx={(t: Theme) => styles.errorBox(t)}>
                {error}
              </Box>
            )}
            {children}
          </>
        )}
      </DialogContent>

      {showFooter && (
        <DialogActions sx={(t: Theme) => styles.actions(t)}>
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
              disabled={saveDisabled || isSaving || initialLoading}
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
    backdropFilter: 'blur(4px)'
  }),
  titleWrapper: (theme: Theme) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    px: 3, py: 2.5, borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, m: 0,
    backgroundColor: 'transparent',
  }),
  titleText: {
    fontSize: '1.25rem', fontWeight: 700, color: 'primary.main',
    fontFamily: 'Outfit, sans-serif',
  } as SxProps<Theme>,
  closeButton: (theme: Theme) => ({
    color: 'text.secondary',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      color: 'primary.main',
    }
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
      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.4) }
    }
  }),
  actions: (theme: Theme) => ({
    px: 3, py: 2.5, borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    gap: 1.5, justifyContent: 'flex-end',
  }),
  errorBox: (theme: Theme) => ({
    p: 2, mb: 2, borderRadius: 2,
    bgcolor: alpha(theme.palette.error.main, 0.1),
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
    color: 'error.main',
    fontSize: '0.85rem',
    fontWeight: 500,
  }),
};
