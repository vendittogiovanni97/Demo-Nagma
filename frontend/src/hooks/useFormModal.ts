import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import { extractErrorMessage } from '@/utils/extract-error';

interface UseFormModalOptions<T> {
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onClose: () => void;
  successMessage?: string;
  errorMessage?: string;
}

interface UseFormModalReturn<T> {
  isLoading: boolean;
  handleSubmit: (data: T) => Promise<void>;
  handleClose: () => void;
}

export function useFormModal<T>({
  onSubmit,
  onSuccess,
  onClose,
  successMessage = 'Operazione completata',
  errorMessage,
}: UseFormModalOptions<T>): UseFormModalReturn<T> {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (data: T) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      toast.success(successMessage);
      onSuccess?.();
      onClose();
    } catch (e: unknown) {
      toast.error(errorMessage ?? extractErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit, onSuccess, onClose, successMessage, errorMessage, toast]);

  const handleClose = useCallback(() => {
    if (!isLoading) onClose();
  }, [isLoading, onClose]);

  return { isLoading, handleSubmit, handleClose };
}
