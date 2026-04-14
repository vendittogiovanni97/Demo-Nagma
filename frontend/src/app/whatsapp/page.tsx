"use client";

import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Edit, MessageCircle, Plus, Search, Send, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import PaginationControls from '@/components/feedback/PaginationControls';
import StatePanel from '@/components/feedback/StatePanel';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import WhatsAppTemplateModal from '@/components/modals/WhatsAppTemplateModal';
import { EXPORT_FETCH_LIMIT } from '@/config/defaults';
import { useAuth } from '@/context/AuthContext';
import { useCustomers, useWhatsAppLogs, useWhatsAppTemplates } from '@/hooks/domain';
import { useWhatsAppComposer } from '@/hooks/useWhatsAppComposer';
import { whatsappService } from '@/services/whatsapp.service';
import type { WhatsAppTemplate } from '@/types/whatsapp';
import { canManageWhatsAppTemplates, canSendWhatsApp } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';
import { validateWhatsAppSendData } from '@/utils/validation';

export default function WhatsAppPage() {
  const { user } = useAuth();
  const canManageTemplates = canManageWhatsAppTemplates(user?.role);
  const canSend = canSendWhatsApp(user?.role);

  const [templateSearch, setTemplateSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);

  const { data: templates, mutate: mutateTemplates, isLoading: templatesLoading } =
    useWhatsAppTemplates({ search: templateSearch });
  const { data: customersResult } = useCustomers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: canSend });
  const customers = customersResult?.data || [];
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) || null;

  const {
    data: logsResult,
    mutate: mutateLogs,
    isLoading: logsLoading,
  } = useWhatsAppLogs({
    search: logSearch,
    page: logPage,
    limit: 10,
    enabled: canSend,
  });

  const allTemplates = templates || [];

  const filteredTemplates = useMemo(
    () => allTemplates,
    [allTemplates]
  );

  const selectedTemplate = filteredTemplates.find((template) => template.id === selectedTemplateId) || null;

  const {
    variables,
    setVariables,
    messageDraft,
    setMessageDraft,
    templateVariables,
    previewMessage,
  } = useWhatsAppComposer({
    selectedTemplate,
    selectedCustomer,
    queryValues: {},
    mode: 'page',
  });

  useEffect(() => {
    if (!selectedCustomer) return;
    setRecipientName(`${selectedCustomer.firstName} ${selectedCustomer.lastName}`.trim());
    setRecipientPhone(selectedCustomer.phone || '');
  }, [selectedCustomer]);

  useEffect(() => {
    if (filteredTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(filteredTemplates[0].id);
    }
  }, [filteredTemplates, selectedTemplateId]);

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Eliminare questo template?')) return;
    try {
      await whatsappService.deleteTemplate(templateId);
      notifySuccess('Template eliminato');
      if (selectedTemplateId === templateId) setSelectedTemplateId('');
      void mutateTemplates();
    } catch (error: unknown) {
      notifyError(error, 'Errore durante l\'eliminazione');
    }
  };

  const handleSend = async () => {
    if (!selectedTemplate) {
      notifyError(new Error('Seleziona un template'), 'Seleziona un template');
      return;
    }

    const payload = {
      templateId: selectedTemplate.id,
      customerId: selectedCustomerId || undefined,
      recipientName: recipientName || undefined,
      recipientPhone,
      message: messageDraft,
      variables,
    };

    const validationError = validateWhatsAppSendData(payload);
    if (validationError) {
      notifyError(new Error(validationError), validationError);
      return;
    }

    setIsSending(true);
    try {
      const response = await whatsappService.sendManualMessage(payload);
      notifySuccess('Messaggio preparato. Apro WhatsApp Web.');
      void mutateLogs();
      window.open(response.whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (error: unknown) {
      notifyError(error, 'Errore durante la preparazione del messaggio');
    } finally {
      setIsSending(false);
    }
  };

  if (!canSend) {
    return (
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-outfit font-bold text-white">WhatsApp</h1>
          </div>
        </div>
        <StatePanel
          variant="error"
          title="Accesso limitato"
          description="Solo admin e segreteria possono inviare messaggi WhatsApp."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header: Title left, Search center, Actions right */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-outfit font-bold text-white">WhatsApp</h1>
        </div>

        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="text"
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="Cerca template..."
              className="w-full rounded-xl border border-surface-border bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-accent"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canManageTemplates && (
            <button
              onClick={() => {
                setEditingTemplate(null);
                setIsTemplateModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2 px-6"
            >
              <Plus size={20} />
              <span>Nuovo Template</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Template List */}
        <div className="glass-panel flex flex-col rounded-2xl max-h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-surface-border">
            <h2 className="text-lg font-outfit font-semibold text-white">Template</h2>
            <p className="text-xs text-text-secondary mt-1">Scegli un template per iniziare</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {templatesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle size={32} className="text-text-secondary mx-auto mb-3" />
                <p className="text-sm text-text-secondary">Nessun template disponibile</p>
                {canManageTemplates && (
                  <button
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="text-sm text-accent mt-2 hover:underline"
                  >
                    Crea il primo template
                  </button>
                )}
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const isSelected = selectedTemplateId === template.id;
                return (
                  <div
                    key={template.id}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-accent bg-accent/10'
                        : 'border-surface-border bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTemplateId(template.id)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{template.name}</span>
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-2">{template.body}</p>
                      </button>
                      {canManageTemplates && (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTemplate(template);
                              setIsTemplateModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-white/10 rounded text-text-secondary hover:text-accent transition"
                            title="Modifica"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            className="p-1.5 hover:bg-white/10 rounded text-text-secondary hover:text-danger transition"
                            title="Elimina"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Compose & Send */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Compose Section */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-lg font-outfit font-semibold text-white mb-4">Componi Messaggio</h2>

            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <FormSelect
                label="Cliente (opzionale)"
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                placeholder="Seleziona cliente..."
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: `${customer.firstName} ${customer.lastName}`,
                }))}
              />
              <FormInput label="Telefono" value={recipientPhone} onChange={setRecipientPhone} required />
            </div>

            {templateVariables.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                {templateVariables.map((key) => (
                  <FormInput
                    key={key}
                    label={key}
                    value={variables[key] || ''}
                    onChange={(value) => setVariables((current) => ({ ...current, [key]: value }))}
                  />
                ))}
              </div>
            )}

            {/* Preview */}
            <div className="mb-4">
              <label className="text-sm text-text-secondary mb-2 block">Anteprima</label>
              <div className="rounded-xl border border-surface-border bg-white/5 p-4 text-sm text-white min-h-[120px]">
                {selectedTemplate && previewMessage ? (
                  <p className="whitespace-pre-wrap">{previewMessage}</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/10 rounded-full w-3/4" />
                        <div className="h-3 bg-white/10 rounded-full w-full" />
                        <div className="h-3 bg-white/10 rounded-full w-1/2" />
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary text-center pt-2">
                      {selectedTemplate ? 'Compila le variabili per vedere l\'anteprima' : 'Seleziona un template dalla lista a sinistra'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <FormTextarea
              label="Modifica messaggio"
              value={messageDraft}
              onChange={(value) => setMessageDraft(value)}
              rows={5}
              disabled={!selectedTemplate}
              placeholder="Personalizza il messaggio..."
            />

            <button
              onClick={handleSend}
              disabled={isSending || !selectedTemplate || !recipientPhone}
              className="btn-primary flex items-center gap-2 px-6 mt-4 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />
              <span>{isSending ? 'Apertura WhatsApp...' : 'Apri WhatsApp'}</span>
            </button>
          </div>

          {/* History Section */}
          <div className="glass-panel flex flex-col rounded-2xl">
            <div className="p-4 border-b border-surface-border">
              <h2 className="text-lg font-outfit font-semibold text-white">Storico Invii</h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
                </div>
              ) : !logsResult?.data.length ? (
                <div className="text-center py-8">
                  <p className="text-sm text-text-secondary">Nessun invio recente</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-border/50">
                  {logsResult.data.map((log) => (
                    <div key={log.id} className="p-4 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        log.status === 'MANUAL_SENT' ? 'bg-success' : 'bg-danger'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">
                            {log.recipientName || log.recipientPhone}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            log.status === 'MANUAL_SENT'
                              ? 'bg-success/10 text-success'
                              : 'bg-danger/10 text-danger'
                          }`}>
                            {log.status === 'MANUAL_SENT' ? 'Inviato' : 'Fallito'}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {log.templateName} · {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: it })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {logsResult && logsResult.totalPages > 1 && (
                <div className="p-4 border-t border-surface-border">
                  <PaginationControls
                    page={logPage}
                    totalPages={logsResult.totalPages}
                    total={logsResult.total}
                    label="invii"
                    onPrev={() => setLogPage((p) => Math.max(1, p - 1))}
                    onNext={() => setLogPage((p) => Math.min(logsResult.totalPages, p + 1))}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <WhatsAppTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false);
          setEditingTemplate(null);
        }}
        onSuccess={() => {
          void mutateTemplates();
          setEditingTemplate(null);
        }}
        template={editingTemplate}
      />
    </div>
  );
}
