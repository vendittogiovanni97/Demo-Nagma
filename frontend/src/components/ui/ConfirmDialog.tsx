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
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <Dialog
      open={isOpen}
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
        Conferma
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
          Annulla
        </Button>
        <Button variant="contained" color="error" size="small" onClick={onConfirm}>
          Elimina
        </Button>
      </DialogActions>
    </Dialog>
  );
}
