"use client";

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/Button';

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
  // Blocca lo scroll del body quando il dialog è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Chiude con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Pannello centrale — stopPropagation per non chiudere cliccando dentro */}
      <div
        className="w-full max-w-sm mx-4 bg-[rgba(10,26,38,0.95)] border border-surface-border rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="text-white font-bold text-lg mb-3"
        >
          Conferma
        </h2>

        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Annulla
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            Elimina
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
