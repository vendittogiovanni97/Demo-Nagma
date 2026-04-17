import { useState } from 'react';
import { useToast } from './useToast';

interface DeleteConfirmOptions {
  confirmMessage: string;
  action: () => Promise<unknown>;
  successMessage: string;
  errorMessage?: string;
  onSuccess?: (() => void) | (() => Promise<unknown>);
}

interface UseDeleteConfirmReturn {
  deleteItem: (options: DeleteConfirmOptions) => Promise<void>;
  isDeleting: boolean;
}

export function useDeleteConfirm(): UseDeleteConfirmReturn {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteItem = async ({
    confirmMessage,
    action,
    successMessage,
    errorMessage = 'Errore durante l\'eliminazione',
    onSuccess,
  }: DeleteConfirmOptions): Promise<void> => {
    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      await action();
      toast.success(successMessage);
      if (onSuccess) {
        await onSuccess();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteItem, isDeleting };
}
