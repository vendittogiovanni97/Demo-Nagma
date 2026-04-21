import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import { extractErrorMessage } from '@/utils/extract-error';

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

  const deleteItem = useCallback(async (options: DeleteConfirmOptions): Promise<void> => {
    setPendingOptions(options);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!pendingOptions) return;
    const options = pendingOptions;
    setPendingOptions(null);

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
  }, [pendingOptions, toast]);

  const handleCancel = useCallback(() => {
    setPendingOptions(null);
  }, []);

  const confirmDialogProps: ConfirmDialogProps = {
    isOpen: pendingOptions !== null,
    message: pendingOptions?.confirmMessage ?? '',
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };

  return { deleteItem, isDeleting, confirmDialogProps };
}
