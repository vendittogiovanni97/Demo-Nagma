import { useCallback, useState } from 'react';
import { useToast } from '@/common/hooks/useToast';
import { extractErrorMessage } from '@/common/shared/utils/extract-error';

type FormEvent = React.FormEvent<HTMLFormElement>;

export interface UseFormModalOptions<TFormData, TResult = void> {
  initial?: TFormData;
  onSubmit: (data: TFormData) => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
  onClose?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export interface UseFormModalReturn<TFormData, TResult = void> {
  formData: TFormData;
  isLoading: boolean;
  error: string | null;
  isSubmitted: boolean;
  setField: <K extends keyof TFormData>(key: K, value: TFormData[K]) => void;
  setFields: (fields: Partial<TFormData>) => void;
  replaceFormData: (data: TFormData) => void;
  resetForm: () => void;
  handleChange: <K extends keyof TFormData>(key: K) => (value: TFormData[K]) => void;
  handleSubmit: (data?: TFormData | FormEvent) => Promise<TResult | undefined>;
  handleClose: () => void;
  resetState: () => void;
}

function isFormEvent<TFormData>(value: TFormData | FormEvent): value is FormEvent {
  return typeof value === 'object' && value !== null && 'preventDefault' in value;
}

export function useFormModal<TFormData extends object, TResult = void>({
  initial = {} as TFormData,
  onSubmit,
  onSuccess,
  onClose,
  successMessage = 'Operazione completata',
  errorMessage,
}: UseFormModalOptions<TFormData, TResult>): UseFormModalReturn<TFormData, TResult> {
  const toast = useToast();
  const [formData, setFormData] = useState<TFormData>(initial);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const setField = useCallback(<K extends keyof TFormData>(key: K, value: TFormData[K]) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  }, []);

  const setFields = useCallback((fields: Partial<TFormData>) => {
    setFormData((previous) => ({ ...previous, ...fields }));
  }, []);

  const replaceFormData = useCallback((data: TFormData) => {
    setFormData(data);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initial);
  }, [initial]);

  const handleChange = useCallback(
    <K extends keyof TFormData>(key: K) => (value: TFormData[K]) => {
      setField(key, value);
    },
    [setField],
  );

  const handleSubmit = useCallback(async (data?: TFormData | FormEvent) => {
    if (data && isFormEvent(data)) data.preventDefault();
    const submitData = data && !isFormEvent(data) ? data : formData;

    setIsLoading(true);
    setError(null);
    try {
      const result = await onSubmit(submitData);
      setIsSubmitted(true);
      toast.success(successMessage);
      onSuccess?.(result);
      onClose?.();
      return result;
    } catch (caught: unknown) {
      const message = extractErrorMessage(caught, errorMessage);
      setError(message);
      toast.error(message);
      return undefined;
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
    setIsSubmitted(false);
  }, []);

  return {
    formData,
    isLoading,
    error,
    isSubmitted,
    setField,
    setFields,
    replaceFormData,
    resetForm,
    handleChange,
    handleSubmit,
    handleClose,
    resetState,
  };
}
