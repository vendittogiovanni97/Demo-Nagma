"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";
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
          sx: {
            width: "100%",
            maxWidth: 400,
            backgroundColor: "rgba(10, 26, 38, 0.95)",
            border: 1,
            borderColor: "divider",
            borderRadius: 4,
          },
        },
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{ fontWeight: 700, fontSize: "1.125rem", pb: 1 }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography
          sx={{ color: "text.secondary", fontSize: "0.875rem", lineHeight: 1.6 }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
        <Button variant="outlined" size="small" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={isDangerous ? "error" : "primary"}
          size="small"
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
