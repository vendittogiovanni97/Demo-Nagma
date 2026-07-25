"use client";

import { useEffect, useState } from 'react';
import { useToast } from '@/common/hooks/useToast';
import { formTemplateService } from '@/modules/form-templates/api/form-template.api';
import { useFormTemplates } from '@/modules/form-templates/hooks/useFormTemplates';
import type { FieldDef } from '@/modules/form-templates/model/form-template.types';

const TATTOO_STYLE_FIELD = 'tattooStyle';

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

export function useTattooStyleEditor() {
  const toast = useToast();
  const { data: templates, isLoading, error, mutate } = useFormTemplates();

  const [templateId, setTemplateId] = useState<number | null>(null);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [optionsText, setOptionsText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!templates) return;
    const match = templates.find((t) =>
      decodeFields(t.schemaB64).some((f) => f.name === TATTOO_STYLE_FIELD),
    );
    if (!match) {
      setTemplateId(null);
      setFields([]);
      setOptionsText('');
      return;
    }
    const decoded = decodeFields(match.schemaB64);
    const styleField = decoded.find((f) => f.name === TATTOO_STYLE_FIELD);
    setTemplateId(match.id);
    setFields(decoded);
    setOptionsText((styleField?.options ?? []).join(',\n'));
  }, [templates]);

  const handleSave = async () => {
    if (!templateId) return;
    const normalized = optionsText
      .split('\n')
      .map((o) => o.replace(/,+\s*$/, '').trim())
      .filter(Boolean);
    if (normalized.length === 0) {
      toast.error('Inserisci almeno uno stile.');
      return;
    }

    setSaving(true);
    try {
      const updatedFields = fields.map((f) =>
        f.name === TATTOO_STYLE_FIELD ? { ...f, options: normalized } : f,
      );
      await formTemplateService.update(templateId, { schemaB64: encodeFields(updatedFields) });
      toast.success('Stili tatuaggio aggiornati');
      await mutate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore durante il salvataggio';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return {
    isLoading,
    hasError: !!error,
    hasTemplate: templateId !== null,
    optionsText,
    setOptionsText,
    saving,
    handleSave,
  };
}
