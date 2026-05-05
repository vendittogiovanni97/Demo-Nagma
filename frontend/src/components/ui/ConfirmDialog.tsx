"use client";
import Button from "@/components/ui/Button";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SxProps,
  Theme,
  Typography
} from "@mui/material";
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
  const isDialogOpen = open ?? isOpenFromProps ?? false;

  useEffect(() => {
    if (!isDialogOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDialogOpen, onCancel]);

  return (
    <Dialog
      open={isDialogOpen}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      slotProps={{
        paper: {
          sx: styles.paper,
        },
        backdrop: {
          sx: styles.backdrop,
        },
      }}
    >
      <DialogTitle id="confirm-dialog-title" sx={styles.title}>
        <Box sx={styles.iconWrapper(isDangerous)}>
          {isDangerous ? <AlertCircle size={20} /> : <HelpCircle size={20} />}
        </Box>
        <Typography sx={styles.titleText}>{title}</Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 1, px: 3 }}>
        <Typography sx={styles.messageText}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={styles.actions}>
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

const styles = {
  paper: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(13, 31, 45, 0.95)",
    backdropFilter: "blur(20px)",
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    backgroundImage: 'none',
  } as SxProps<Theme>,
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(4px)",
  } as SxProps<Theme>,
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    pt: 3,
    pb: 1.5,
    px: 3,
  } as SxProps<Theme>,
  iconWrapper: (isDangerous: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: '10px',
    bgcolor: isDangerous ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 191, 255, 0.15)',
    color: isDangerous ? '#ef4444' : '#00bfff',
  }),
  titleText: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: 'text.primary',
    fontFamily: 'Outfit, sans-serif',
  } as SxProps<Theme>,
  messageText: {
    color: "text.secondary",
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    fontFamily: 'Inter, sans-serif',
  } as SxProps<Theme>,
  actions: {
    px: 3,
    py: 2.5,
    gap: 1.5,
    justifyContent: 'flex-end',
    bgcolor: 'rgba(255, 255, 255, 0.02)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  } as SxProps<Theme>,
};
