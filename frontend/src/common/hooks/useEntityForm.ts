"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFormModal, UseFormModalOptions, UseFormModalReturn } from './useFormModal';

export interface UseEntityFormOptions<TEntity, TFormData> {
  /** Entità in modifica (null = creazione) */
  entity: TEntity | null;
  /** Modal aperta? */
  open: boolean;
  /** Callback per costruire i dati iniziali del form dall'entità */
  initial: (entity: TEntity | null) => TFormData;
  /** Callback per trasformare i dati del form nel payload API */
  buildPayload: (formData: TFormData, entity: TEntity | null) => any;
  /** Funzione di persistenza (create o update) */
  persist: (payload: any, entity: TEntity | null) => Promise<any>;
  /** Messaggio di successo (opzionale, default basato su create/update). Può essere stringa o funzione che riceve isEdit */
  successMessage?: string | ((isEdit: boolean) => string);
  /** Messaggio di errore personalizzato */
  errorMessage?: string;
  /** Validazione custom prima del submit (restituisce stringa errore o null) */
  validate?: (formData: TFormData) => string | null;
  /** Callback all'apertura/chiusura */
  onOpen?: () => void;
  onClose?: () => void;
  onSuccess?: (result: any) => void;
}

export interface UseEntityFormReturn<TFormData> extends UseFormModalReturn<TFormData> {
  /** Dati correnti del form */
  formData: TFormData;
  /** Aggiorna un singolo campo del form */
  setField: <K extends keyof TFormData>(key: K, value: TFormData[K]) => void;
  /** Aggiorna più campi insieme */
  setFields: (fields: Partial<TFormData>) => void;
  /** Reset del form ai valori iniziali */
  resetForm: () => void;
  /** Indica se il form è "dirty" (modificato rispetto all'iniziale) */
  isDirty: boolean;
  /** Valori iniziali correnti */
  initialValues: TFormData;
  /** True se il form è stato inviato con successo */
  isSubmitted: boolean;
  /** Handler per onChange dei campi (compatibile con FormInput, FormSelect, ecc.) */
  handleChange: (key: keyof TFormData) => (value: any) => void;
  /** Apri il form in modalità creazione */
  openCreate: () => void;
  /** Apri il form in modalità modifica per un'entità */
  openEdit: () => void;
  /** Chiudi il form */
  closeForm: () => void;
}

export function useEntityForm<TEntity, TFormData extends Record<string, any>>({
  entity,
  open,
  initial,
  buildPayload,
  persist,
  successMessage,
  errorMessage,
  onOpen,
  onClose,
  onSuccess,
}: UseEntityFormOptions<TEntity, TFormData>): UseEntityFormReturn<TFormData> {
  // Valori iniziali calcolati dall'entità corrente
  const initialValues = useMemo(() => initial(entity), [entity, initial]);

  // Form data state
  const [formData, setFormData] = useState<TFormData>(initialValues);
  const [isDirty, setIsDirty] = useState(false);

  // Sync formData con initialValues quando cambia l'entità o la modal si apre
  useEffect(() => {
    if (open) {
      setFormData(initialValues);
      setIsDirty(false);
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [open, initialValues, entity, onOpen, onClose]);

  // Submit handler per useFormModal
  const handleSubmit = useCallback(
    async (data: TFormData) => {
      const payload = buildPayload(data, entity);
      await persist(payload, entity);
    },
    [buildPayload, persist, entity]
  );

  // useFormModal per loading/error/toast/submit
  const formModal = useFormModal<TFormData>({
    initial: initialValues,
    onSubmit: handleSubmit,
    onSuccess: () => {
      onSuccess?.(undefined);
    },
    onClose: () => {
      // onClose viene gestito dall'effect sopra
    },
    successMessage: typeof successMessage === 'function' ? successMessage(entity !== null) : (successMessage || (entity ? 'Aggiornato' : 'Creato')),
    errorMessage,
  });

  // Setter per singolo campo
  const setField = useCallback(<K extends keyof TFormData>(key: K, value: TFormData[K]) => {
    setFormData(prev => {
      const next = { ...prev, [key]: value };
      setIsDirty(JSON.stringify(next) !== JSON.stringify(initialValues));
      return next;
    });
  }, [initialValues]);

  // Setter per più campi
  const setFields = useCallback((fields: Partial<TFormData>) => {
    setFormData(prev => {
      const next = { ...prev, ...fields };
      setIsDirty(JSON.stringify(next) !== JSON.stringify(initialValues));
      return next;
    });
  }, [initialValues]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setIsDirty(false);
  }, [initialValues]);

  // Helper per onChange generico per componenti form
  const handleChange = useCallback((key: keyof TFormData) => (value: any) => {
    setField(key, value);
  }, [setField]);

  // Helper per aprire in creazione
  const openCreate = useCallback(() => {
    // L'apertura è controllata dal parent via prop `open` e `entity={null}`
    // Questo è solo per compatibilità API
  }, []);

  // Helper per aprire in modifica
  const openEdit = useCallback(() => {
    // L'apertura è controllata dal parent via prop `open` e `entity`
  }, []);

  // Helper per chiudere
  const closeForm = useCallback(() => {
    // La chiusura è controllata dal parent
  }, []);

  return {
    ...formModal,
    formData,
    setField,
    setFields,
    resetForm,
    isDirty,
    initialValues,
    handleChange,
    openCreate,
    openEdit,
    closeForm,
  };
}