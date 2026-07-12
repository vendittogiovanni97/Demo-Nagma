"use client";
import Button from "@/common/components/ui/Button";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SxProps,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import { AlertCircle, HelpCircle } from "lucide-react";
import { useEffect } from "react";

interface ConfirmDialogProps {
  open?: boolean;
  isOpen?: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  isOpen: isOpenFromProps,
  title = "Conferma",
  message,
  confirmText = "Conferma",
  cancelText = "Annulla",
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();
  const isDialogOpen = open ?? isOpenFromProps ?? false;

  useEffect(() => {
    if (!isDialogOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDialogOpen, onCancel]);

  const iconWrapper = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: '10px',
    bgcolor: isDangerous ? alpha(theme.palette.error.main, 0.15) : alpha(theme.palette.primary.main, 0.15),
    color: isDangerous ? theme.palette.error.main : theme.palette.primary.main,
  };

  const paperStyles = {
    width: "100%",
    maxWidth: 400,
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    backdropFilter: "blur(20px)",
    border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
    borderRadius: '20px',
    boxShadow: `0px 24px 48px ${alpha(theme.palette.common.black, 0.5)}`,
    overflow: 'hidden',
    backgroundImage: 'none',
  } as SxProps<Theme>;

  const backdropStyles = {
    backgroundColor: alpha(theme.palette.common.black, 0.8),
    backdropFilter: "blur(4px)",
  } as SxProps<Theme>;

  const actionsStyles = {
    px: 3,
    py: 2.5,
    gap: 1.5,
    justifyContent: 'flex-end',
    bgcolor: alpha(theme.palette.common.white, 0.02),
    borderTop: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
  } as SxProps<Theme>;

  return (
    <Dialog
      open={isDialogOpen}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      slotProps={{
        paper: {
          sx: paperStyles,
        },
        backdrop: {
          sx: backdropStyles,
        },
      }}
    >
      <DialogTitle id="confirm-dialog-title" sx={titleStyles}>
        <Box sx={iconWrapper}>
          {isDangerous ? <AlertCircle size={20} /> : <HelpCircle size={20} />}
        </Box>
        <Typography sx={titleTextStyles}>{title}</Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 1, px: 3 }}>
        <Typography sx={messageStyles}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={actionsStyles}>
        <Button
          variant="ghost"
          onClick={onCancel}
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          {cancelText}
        </Button>
        <Button
          variant={isDangerous ? 'danger' : 'primary'}
          onClick={onConfirm}
          sx={{ minWidth: 100 }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const titleStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  pt: 3,
  pb: 1.5,
  px: 3,
} as SxProps<Theme>;

const titleTextStyles = {
  fontSize: '1.125rem',
  fontWeight: 700,
  color: 'text.primary',
  fontFamily: 'Outfit, sans-serif',
} as SxProps<Theme>;

const messageStyles = {
  color: "text.secondary",
  fontSize: "0.9375rem",
  lineHeight: 1.6,
  fontFamily: 'Inter, sans-serif',
} as SxProps<Theme>;
