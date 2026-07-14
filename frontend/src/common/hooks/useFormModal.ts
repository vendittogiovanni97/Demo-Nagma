import { useState, useCallback } from 'react';
import { useToast } from '@/common/hooks/useToast';
import { extractErrorMessage } from '@/common/shared/utils/extract-error';

export interface UseFormModalOptions<T> {
  /** Valori iniziali del form */
  initial: T;
  /** Callback di submit */
  onSubmit: (data: T) => Promise<void>;
  /** Callback al successo */
  onSuccess?: () => void;
  /** Callback alla chiusura */
  onClose?: () => void;
  /** Messaggio di successo */
  successMessage?: string;
  /** Messaggio di errore personalizzato */
  errorMessage?: string;
}

export interface UseFormModalReturn<T> {
  /** Dati correnti del form */
  formData: T;
  /** Stato di loading */
  isLoading: boolean;
  /** Errore corrente */
  error: string | null;
  /** True se il form è stato inviato con successo */
  isSubmitted: boolean;
  /** Imposta un singolo campo */
  setField: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Imposta più campi insieme */
  setFields: (fields: Partial<T>) => void;
  /** Resetta il form ai valori iniziali */
  resetForm: () => void;
  /** Handler per onChange dei campi (compatibile con FormInput, FormSelect, ecc.) */
  handleChange: (key: keyof T) => (value: any) => void;
  /** Handler per submit - compatibile con form onSubmit */
  handleSubmit: (data?: T | React.FormEvent<HTMLFormElement>) => Promise<void>;
  /** Handler per chiusura */
  handleClose: () => void;
  /** Resetta stato loading/error */
  resetState: () => void;
}

export function useFormModal<T extends Record<string, any>>({
  initial,
  onSubmit,
  onSuccess,
  onClose,
  successMessage = 'Operazione completata',
  errorMessage,
}: UseFormModalOptions<T>): UseFormModalReturn<T> {
  const toast = useToast();
  const [formData, setFormData] = useState<T>(initial);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFields = useCallback((fields: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initial);
  }, [initial]);

  const handleChange = useCallback((key: keyof T) => (value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async (data?: T | React.FormEvent<HTMLFormElement>) => {
    // Se è un FormEvent (da onSubmit del form), previeni default e usa formData
    if (data && typeof data === 'object' && 'preventDefault' in data) {
      data.preventDefault();
    }
    const submitData = (data && !('preventDefault' in data)) ? data : formData;
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(submitData);
      setIsSubmitted(true);
      toast.success(successMessage);
      onSuccess?.();
      onClose?.();
    } catch (e: unknown) {
      const msg = errorMessage ?? extractErrorMessage(e);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [formData, onSubmit, onSuccess, onClose, successMessage, errorMessage, toast]);

  const handleClose = useCallback(() => {
    if (!isLoading) onClose?.();
  }, [isLoading, onClose]);

  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    formData,
    isLoading,
    error,
    isSubmitted,
    setField,
    setFields,
    resetForm,
    handleChange,
    handleSubmit,
    handleClose,
    resetState,
  };
}