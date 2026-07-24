'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFormModal, type UseFormModalReturn } from './useFormModal';

export interface UseEntityFormOptions<TEntity, TFormData, TPayload, TResult> {
  entity: TEntity | null;
  open: boolean;
  initial: (entity: TEntity | null) => TFormData;
  buildPayload: (formData: TFormData, entity: TEntity | null) => TPayload;
  persist: (payload: TPayload, entity: TEntity | null) => Promise<TResult>;
  successMessage?: string | ((isEdit: boolean) => string);
  errorMessage?: string;
  validate?: (formData: TFormData) => string | null;
  onOpen?: () => void;
  onClose?: () => void;
  onSuccess?: (result: TResult) => void;
}

export interface UseEntityFormReturn<TFormData, TResult = void>
  extends UseFormModalReturn<TFormData, TResult> {
  isDirty: boolean;
  initialValues: TFormData;
}

export function useEntityForm<
  TEntity,
  TFormData extends object,
  TPayload = TFormData,
  TResult = void,
>({
  entity,
  open,
  initial,
  buildPayload,
  persist,
  successMessage,
  errorMessage,
  validate,
  onOpen,
  onClose,
  onSuccess,
}: UseEntityFormOptions<TEntity, TFormData, TPayload, TResult>): UseEntityFormReturn<TFormData, TResult> {
  const initialValues = useMemo(() => initial(entity), [entity, initial]);

  const submit = useCallback(async (data: TFormData) => {
    const validationError = validate?.(data);
    if (validationError) throw new Error(validationError);
    return persist(buildPayload(data, entity), entity);
  }, [buildPayload, entity, persist, validate]);

  const form = useFormModal<TFormData, TResult>({
    initial: initialValues,
    onSubmit: submit,
    onSuccess,
    onClose,
    successMessage: typeof successMessage === 'function'
      ? successMessage(entity !== null)
      : successMessage ?? (entity ? 'Aggiornato' : 'Creato'),
    errorMessage,
  });

  const previousOpen = useRef(open);
  const previousEntity = useRef(entity);
  const replaceFormData = form.replaceFormData;
  const resetState = form.resetState;

  useEffect(() => {
    const hasOpened = open && !previousOpen.current;
    const hasChangedEntity = open && entity !== previousEntity.current;

    if (hasOpened || hasChangedEntity) {
      replaceFormData(initialValues);
      resetState();
      onOpen?.();
    }

    previousOpen.current = open;
    previousEntity.current = entity;
  }, [entity, initialValues, onOpen, open, replaceFormData, resetState]);

  const isDirty = useMemo(
    () => JSON.stringify(form.formData) !== JSON.stringify(initialValues),
    [form.formData, initialValues],
  );

  return {
    ...form,
    isDirty,
    initialValues,
  };
}
