import { useState, useCallback } from 'react';
import { useToast } from '@/common/hooks/useToast';
import { extractErrorMessage } from '@/common/shared/utils/extract-error';

interface UseFormModalOptions<T> {
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onClose: () => void;
  successMessage?: string;
  errorMessage?: string;
}

interface UseFormModalReturn<T> {
  isLoading: boolean;
  error: string | null;
  handleSubmit: (data: T) => Promise<void>;
  handleClose: () => void;
  resetState: () => void;
}

export function useFormModal<T = void>({
  onSubmit,
  onSuccess,
  onClose,
  successMessage = 'Operazione completata',
  errorMessage,
}: UseFormModalOptions<T>): UseFormModalReturn<T> {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (data: T) => {
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(data);
      toast.success(successMessage);
      onSuccess?.();
      onClose();
    } catch (e: unknown) {
      const msg = errorMessage ?? extractErrorMessage(e);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit, onSuccess, onClose, successMessage, errorMessage, toast]);

  const handleClose = useCallback(() => {
    if (!isLoading) onClose();
  }, [isLoading, onClose]);

  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return { isLoading, error, handleSubmit, handleClose, resetState };
}
