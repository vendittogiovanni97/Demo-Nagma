"use client";

import { useToast } from '@/hooks/useToast';
import { formTemplateService } from '@/modules/form-templates/api/form-template.api';
import type { FieldDef, FormTemplate } from '@/modules/form-templates/model/form-template.types';
import { useState } from 'react';

function decodeFields(schemaB64: string): FieldDef[] {
  try {
    return JSON.parse(atob(schemaB64));
  } catch {
    return [];
  }
}

function encodeFields(fields: FieldDef[]): string {
  return btoa(JSON.stringify(fields));
}

interface UseFormTemplateEditorOptions {
  onMutate: () => Promise<unknown>;
}

export function useFormTemplateEditor({ onMutate }: UseFormTemplateEditorOptions) {
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectTemplate = (template: FormTemplate) => {
    setSelectedId(template.id);
    setTemplateName(template.name);
    setFields(decodeFields(template.schemaB64));
    setIsCreating(false);
  };

  const handleNewTemplate = () => {
    setSelectedId(null);
    setTemplateName('');
    setFields([]);
    setIsCreating(true);
  };

  const handleAddField = () => {
    setFields((prev) => [...prev, { type: 'text', name: '', label: '' }]);
  };

  const handleFieldChange = (index: number, updated: FieldDef) => {
    setFields((prev) => prev.map((f, i) => (i === index ? updated : f)));
  };

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCloseEditor = () => {
    setSelectedId(null);
    setIsCreating(false);
    setTemplateName('');
    setFields([]);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Inserisci un nome per il template prima di salvare.');
      return;
    }
    const invalidFields = fields.filter((f) => !f.name.trim() || !f.label.trim());
    if (invalidFields.length > 0) {
      toast.error('Ogni campo deve avere "Identificativo" e "Etichetta" compilati.');
      return;
    }

    setSaving(true);
    try {
      const schemaB64 = encodeFields(fields);
      if (isCreating) {
        await formTemplateService.create({ name: templateName, schemaB64 });
        toast.success('Nuovo template creato con successo.');
      } else if (selectedId) {
        await formTemplateService.update(selectedId, { name: templateName, schemaB64 });
        toast.success('Modifiche salvate.');
      }
      await onMutate();
      if (isCreating) setIsCreating(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nel salvataggio';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il template "${name}"?`)) return;
    try {
      await formTemplateService.delete(id);
      toast.success('Template eliminato.');
      if (selectedId === id) {
        handleCloseEditor();
      }
      await onMutate();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nella cancellazione';
      toast.error(errorMessage);
    }
  };

  return {
    selectedId,
    templateName,
    setTemplateName,
    fields,
    saving,
    isCreating,
    handleSelectTemplate,
    handleNewTemplate,
    handleAddField,
    handleFieldChange,
    handleRemoveField,
    handleCloseEditor,
    handleSave,
    handleDelete,
  };
}
