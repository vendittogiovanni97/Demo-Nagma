import { useRef, useState, useCallback } from 'react';
import { useToast } from './useToast';
import { extractErrorMessage } from '@/common/shared/utils/extract-error';

interface DeleteConfirmOptions {
  confirmMessage: string;
  action: () => Promise<unknown>;
  successMessage: string;
  errorMessage?: string;
  onSuccess?: (() => void) | (() => Promise<unknown>);
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface UseDeleteConfirmReturn {
  deleteItem: (options: DeleteConfirmOptions) => Promise<void>;
  isDeleting: boolean;
  confirmDialogProps: ConfirmDialogProps;
}

export function useDeleteConfirm(): UseDeleteConfirmReturn {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingOptions, setPendingOptions] = useState<DeleteConfirmOptions | null>(null);
  
  // Use ref to avoid self-referential dependency in useCallback
  // This prevents handleConfirm from being recreated when pendingOptions changes
  const pendingOptionsRef = useRef<DeleteConfirmOptions | null>(null);

  const deleteItem = useCallback(async (options: DeleteConfirmOptions): Promise<void> => {
    pendingOptionsRef.current = options;
    setPendingOptions(options);
  }, []);

  // handleConfirm only depends on stable dependencies (toast)
  // pendingOptionsRef gives us access to fresh state without dependency
  const handleConfirm = useCallback(async () => {
    const options = pendingOptionsRef.current;
    if (!options) return;
    
    setPendingOptions(null);
    pendingOptionsRef.current = null;

    setIsDeleting(true);
    try {
      await options.action();
      toast.success(options.successMessage);
      if (options.onSuccess) {
        await options.onSuccess();
      }
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, options.errorMessage ?? 'Errore durante l\'eliminazione');
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  }, [toast]);

  const handleCancel = useCallback(() => {
    setPendingOptions(null);
    pendingOptionsRef.current = null;
  }, []);

  const confirmDialogProps: ConfirmDialogProps = {
    isOpen: pendingOptions !== null,
    message: pendingOptions?.confirmMessage ?? '',
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };

  return { deleteItem, isDeleting, confirmDialogProps };
}
