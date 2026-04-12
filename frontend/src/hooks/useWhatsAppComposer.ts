"use client";

import { useMemo, useState } from 'react';

import type { Booking } from '@/types/booking';
import type { Customer } from '@/types/customer';
import type { WhatsAppTemplate } from '@/types/whatsapp';
import {
  extractTemplateVariables,
  getBookingVariableValue,
  getSuggestedVariableValue,
  renderTemplatePreview,
} from '@/utils/whatsapp';

interface UseWhatsAppComposerOptions {
  selectedTemplate: WhatsAppTemplate | null;
  selectedCustomer: Customer | null;
  queryValues?: Record<string, string>;
  booking?: Booking | null;
  mode: 'page' | 'modal';
}

export function useWhatsAppComposer({
  selectedTemplate,
  selectedCustomer,
  queryValues = {},
  booking,
  mode,
}: UseWhatsAppComposerOptions) {
  const [variableOverrides, setVariableOverrides] = useState<Record<string, string>>({});
  const [messageDraft, setMessageDraft] = useState('');
  const [messageDirty, setMessageDirty] = useState(false);

  const templateVariables = useMemo(
    () => (selectedTemplate ? extractTemplateVariables(selectedTemplate.body) : []),
    [selectedTemplate]
  );

  const variables = useMemo(() => {
    if (!selectedTemplate) return {};

    const nextValues: Record<string, string> = {};

    templateVariables.forEach((key) => {
      nextValues[key] =
        variableOverrides[key] ||
        (mode === 'page'
          ? getSuggestedVariableValue(key, selectedCustomer, queryValues)
          : getBookingVariableValue(key, selectedCustomer, booking));
    });

    return nextValues;
  }, [selectedTemplate, templateVariables, variableOverrides, mode, selectedCustomer, queryValues, booking]);

  const previewMessage = useMemo(() => {
    if (!selectedTemplate) return '';
    if (messageDirty) return messageDraft;
    return renderTemplatePreview(selectedTemplate.body, variables);
  }, [selectedTemplate, messageDirty, messageDraft, variables]);

  return {
    variables,
    setVariables: setVariableOverrides,
    messageDraft,
    setMessageDraft,
    messageDirty,
    setMessageDirty,
    templateVariables,
    previewMessage,
    resetComposer() {
      setVariableOverrides({});
      setMessageDraft('');
      setMessageDirty(false);
    },
  };
}
