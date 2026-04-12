"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Copy, Edit, MessageCircle, Phone, Plus, Search, Send, Trash2 } from 'lucide-react';

import PaginationControls from '@/components/feedback/PaginationControls';
import StatePanel from '@/components/feedback/StatePanel';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import PageHeader from '@/components/layout/PageHeader';
import WhatsAppTemplateModal from '@/components/modals/WhatsAppTemplateModal';
import { RECOMMENDED_WHATSAPP_TEMPLATES } from '@/config/whatsapp';
import { useAuth } from '@/context/AuthContext';
import { useCustomers, useWhatsAppLogs, useWhatsAppTemplates } from '@/hooks/domain';
import { useWhatsAppComposer } from '@/hooks/useWhatsAppComposer';
import { whatsappService } from '@/services/whatsapp.service';
import type { WhatsAppTemplate } from '@/types/whatsapp';
import { notifyError, notifySuccess } from '@/utils/toast';
import { validateWhatsAppSendData } from '@/utils/validation';
import { canManageWhatsAppTemplates, canSendWhatsApp } from '@/utils/permissions';

export default function WhatsAppPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const canManageTemplates = canManageWhatsAppTemplates(user?.role);
  const canSend = canSendWhatsApp(user?.role);

  const [templateSearch, setTemplateSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logStatus, setLogStatus] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(searchParams.get('customerId') || '');
  const [recipientName, setRecipientName] = useState(searchParams.get('customerName') || '');
  const [recipientPhone, setRecipientPhone] = useState(searchParams.get('customerPhone') || '');
  const [isSending, setIsSending] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);

  const queryValues = useMemo(
    () => ({
      customerName: searchParams.get('customerName') || '',
      customerPhone: searchParams.get('customerPhone') || '',
      bookingId: searchParams.get('bookingId') || '',
      bookingDate: searchParams.get('bookingDate') || '',
      bookingTime: searchParams.get('bookingTime') || '',
      bookingType: searchParams.get('bookingType') || '',
      artistName: searchParams.get('artistName') || '',
    }),
    [searchParams]
  );

  const { data: templates, mutate: mutateTemplates, isLoading: templatesLoading, error: templatesError } =
    useWhatsAppTemplates({ search: templateSearch });
  const { data: customersResult } = useCustomers({ page: 1, limit: 1000, enabled: canSend });
  const customers = customersResult?.data || [];
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) || null;

  const {
    data: logsResult,
    mutate: mutateLogs,
    isLoading: logsLoading,
    error: logsError,
  } = useWhatsAppLogs({
    search: logSearch,
    status: logStatus as '' | 'MANUAL_SENT' | 'FAILED',
    page: logPage,
    limit: 8,
    enabled: canSend,
  });

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set((templates || []).map((template) => template.category).filter(Boolean))) as string[],
    [templates]
  );

  const filteredTemplates = useMemo(
    () =>
      (templates || []).filter((template) =>
        categoryFilter ? (template.category || '') === categoryFilter : true
      ),
    [templates, categoryFilter]
  );

  const selectedTemplate = filteredTemplates.find((template) => template.id === selectedTemplateId) || null;

  const {
    variables,
    setVariables,
    messageDraft,
    setMessageDraft,
    setMessageDirty,
    templateVariables,
    previewMessage,
  } = useWhatsAppComposer({
    selectedTemplate,
    selectedCustomer,
    queryValues,
    mode: 'page',
  });

  useEffect(() => {
    if (!filteredTemplates.length) {
      if (selectedTemplateId) setSelectedTemplateId('');
      return;
    }

    const isCurrentVisible = filteredTemplates.some((template) => template.id === selectedTemplateId);
    if (!isCurrentVisible) {
      setSelectedTemplateId(filteredTemplates[0].id);
    }
  }, [filteredTemplates, selectedTemplateId]);

  useEffect(() => {
    if (!selectedCustomer) return;
    setRecipientName(`${selectedCustomer.firstName} ${selectedCustomer.lastName}`.trim());
    setRecipientPhone(selectedCustomer.phone || '');
  }, [selectedCustomer]);

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Vuoi davvero eliminare questo template WhatsApp?')) return;

    try {
      await whatsappService.deleteTemplate(templateId);
      notifySuccess('Template eliminato');
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId('');
      }
      void mutateTemplates();
    } catch (error: unknown) {
      notifyError(error, 'Errore durante l\'eliminazione del template');
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      const duplicated = await whatsappService.duplicateTemplate(templateId);
      notifySuccess('Template duplicato');
      setSelectedTemplateId(duplicated.id);
      void mutateTemplates();
    } catch (error: unknown) {
      notifyError(error, 'Errore durante la duplicazione del template');
    }
  };

  const handleToggleTemplate = async (template: WhatsAppTemplate) => {
    try {
      await whatsappService.updateTemplate(template.id, { isActive: !template.isActive });
      notifySuccess(template.isActive ? 'Template disattivato' : 'Template attivato');
      void mutateTemplates();
    } catch (error: unknown) {
      notifyError(error, 'Errore durante l\'aggiornamento del template');
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
      bookingId: queryValues.bookingId || undefined,
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

  const handleCreateRecommendedTemplate = async (index: number) => {
    const template = RECOMMENDED_WHATSAPP_TEMPLATES[index];

    try {
      const created = await whatsappService.createTemplate(template);
      notifySuccess(`Template "${template.name}" creato`);
      setSelectedTemplateId(created.id);
      void mutateTemplates();
    } catch (error: unknown) {
      notifyError(error, 'Errore durante la creazione del template consigliato');
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="WhatsApp Manuale"
        subtitle="Template, anteprima e storico invii senza automazioni."
        actions={
          canManageTemplates ? (
            <button
              onClick={() => {
                setEditingTemplate(null);
                setIsTemplateModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2 px-6"
            >
              <Plus size={18} />
              <span>Nuovo Template</span>
            </button>
          ) : null
        }
      />

      {!canSend ? (
        <StatePanel
          variant="error"
          title="Accesso limitato"
          description="Solo admin e segreteria possono preparare o inviare messaggi WhatsApp."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.3fr]">
          <section className="glass-panel flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-outfit font-semibold text-white">Template</h2>
                <p className="text-sm text-text-secondary">Scegli, duplica mentalmente e invia solo quando vuoi.</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(event) => setTemplateSearch(event.target.value)}
                  placeholder="Cerca template per nome o categoria..."
                  className="w-full rounded-xl border border-surface-border bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-accent"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent"
              >
                <option value="">Tutte le categorie</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-3xl border border-surface-border bg-white/[0.03] p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-[1.8px] text-white">Template Consigliati</h3>
                <p className="text-sm text-text-secondary">Base pronta per reception e follow-up manuali.</p>
              </div>
              <div className="grid gap-3">
                {RECOMMENDED_WHATSAPP_TEMPLATES.map((template, index) => (
                  <div key={template.name} className="rounded-2xl border border-surface-border bg-[#081018] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-white">{template.name}</p>
                        <p className="text-xs uppercase tracking-[1.4px] text-text-secondary">{template.category}</p>
                        <p className="text-sm text-text-secondary">{template.description}</p>
                      </div>
                      {canManageTemplates ? (
                        <button
                          type="button"
                          onClick={() => void handleCreateRecommendedTemplate(index)}
                          className="rounded-xl border border-accent/20 bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition hover:bg-accent/15"
                        >
                          Usa base
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {templatesLoading ? (
              <StatePanel
                variant="loading"
                title="Carico i template"
                description="Sto recuperando i messaggi salvati."
              />
            ) : null}
            {templatesError ? (
              <StatePanel
                variant="error"
                title="Impossibile caricare i template"
                description="Riprova tra poco o aggiorna la pagina."
              />
            ) : null}
            {!templatesLoading && !templatesError && !filteredTemplates.length ? (
              <StatePanel
                variant="empty"
                title="Nessun template disponibile"
                description="Crea il primo template per iniziare a inviare messaggi manuali."
              />
            ) : null}

            <div className="grid gap-3">
              {filteredTemplates.map((template) => {
                const isSelected = selectedTemplateId === template.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`rounded-3xl border p-4 text-left transition ${
                      isSelected ? 'border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(0,191,255,0.2)]' : 'border-surface-border bg-white/[0.03] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-white">{template.name}</span>
                          {template.isActive ? (
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[1.4px] text-emerald-300">
                              Attivo
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs uppercase tracking-[1.8px] text-text-secondary">
                          {template.category || 'Senza categoria'}
                        </p>
                      </div>

                      {canManageTemplates ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditingTemplate(template);
                              setIsTemplateModalOpen(true);
                            }}
                            className="rounded-lg p-2 text-accent transition hover:bg-white/10"
                            title="Modifica template"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDuplicateTemplate(template.id);
                            }}
                            className="rounded-lg p-2 text-white transition hover:bg-white/10"
                            title="Duplica template"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleToggleTemplate(template);
                            }}
                            className="rounded-lg p-2 text-amber-300 transition hover:bg-amber-500/10"
                            title={template.isActive ? 'Disattiva template' : 'Attiva template'}
                          >
                            {template.isActive ? 'Off' : 'On'}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDeleteTemplate(template.id);
                            }}
                            className="rounded-lg p-2 text-danger transition hover:bg-danger/10"
                            title="Elimina template"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm text-text-secondary">{template.body}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="glass-panel grid gap-5 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-outfit font-semibold text-white">Invio Manuale</h2>
                  <p className="text-sm text-text-secondary">Prepari il testo, controlli l&apos;anteprima e poi apri WhatsApp.</p>
                </div>
                {queryValues.customerName ? (
                  <div className="rounded-2xl border border-surface-border bg-white/[0.03] px-4 py-2 text-right text-xs text-text-secondary">
                    Context: <span className="font-semibold text-white">{queryValues.customerName}</span>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormSelect
                  label="Template"
                  value={selectedTemplateId}
                  onChange={setSelectedTemplateId}
                  placeholder="Seleziona template..."
                  options={filteredTemplates
                    .filter((template) => template.isActive)
                    .map((template) => ({
                      value: template.id,
                      label: template.name,
                    }))}
                />
                <FormSelect
                  label="Cliente"
                  value={selectedCustomerId}
                  onChange={setSelectedCustomerId}
                  placeholder="Seleziona cliente..."
                  options={customers.map((customer) => ({
                    value: customer.id,
                    label: `${customer.firstName} ${customer.lastName}`,
                  }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="Nome destinatario" value={recipientName} onChange={setRecipientName} />
                <FormInput label="Telefono destinatario" value={recipientPhone} onChange={setRecipientPhone} required />
              </div>

              {templateVariables.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {templateVariables.map((key) => (
                    <FormInput
                      key={key}
                      label={`Variabile: ${key}`}
                      value={variables[key] || ''}
                      onChange={(value) =>
                        setVariables((current) => ({
                          ...current,
                          [key]: value,
                        }))
                      }
                    />
                  ))}
                </div>
              ) : (
                <StatePanel
                  variant="empty"
                  title="Il template non usa variabili"
                  description="Puoi inviarlo cosi com&apos;e oppure aggiungere placeholder nel testo del template."
                  className="min-h-0"
                />
              )}

              <div className="rounded-[28px] border border-surface-border bg-[#081018] p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <MessageCircle size={16} className="text-accent" />
                  Anteprima messaggio
                </div>
                <div className="rounded-3xl border border-surface-border bg-[#10202e] p-4 text-sm leading-6 text-white/90">
                  {selectedTemplate ? previewMessage : 'Seleziona prima un template per vedere l’anteprima.'}
                </div>
              </div>

              <FormTextarea
                label="Modifica rapida messaggio"
                value={messageDraft}
                onChange={(value) => {
                  setMessageDirty(true);
                  setMessageDraft(value);
                }}
                rows={7}
                disabled={!selectedTemplate}
                placeholder="Qui puoi rifinire il messaggio prima di aprire WhatsApp."
              />

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => void handleSend()}
                  disabled={isSending || !selectedTemplate}
                  className="btn-primary flex items-center gap-2 px-6 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={18} />
                  <span>{isSending ? 'Apro WhatsApp...' : 'Apri WhatsApp e registra invio'}</span>
                </button>
                {selectedCustomer ? (
                  <Link
                    href={`/clienti?customerId=${selectedCustomer.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-surface-border px-4 py-3 text-sm text-text-secondary transition hover:bg-white/5 hover:text-white"
                  >
                    <Phone size={16} />
                    <span>Torna al cliente</span>
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="glass-panel overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-surface-border p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-outfit font-semibold text-white">Storico invii</h2>
                  <p className="text-sm text-text-secondary">Teniamo traccia dei messaggi preparati e aperti manualmente.</p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type="text"
                      value={logSearch}
                      onChange={(event) => {
                        setLogSearch(event.target.value);
                        setLogPage(1);
                      }}
                      placeholder="Cerca per destinatario o template..."
                      className="w-full rounded-xl border border-surface-border bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-accent md:w-72"
                    />
                  </div>

                  <select
                    value={logStatus}
                    onChange={(event) => {
                      setLogStatus(event.target.value);
                      setLogPage(1);
                    }}
                    className="rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent"
                  >
                    <option value="">Tutti gli stati</option>
                    <option value="MANUAL_SENT">Manual sent</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>

              {logsLoading ? (
                <div className="p-5">
                  <StatePanel
                    variant="loading"
                    title="Carico lo storico"
                    description="Sto recuperando gli invii manuali recenti."
                  />
                </div>
              ) : null}
              {logsError ? (
                <div className="p-5">
                  <StatePanel
                    variant="error"
                    title="Impossibile caricare lo storico"
                    description="Riprova tra poco o aggiorna la pagina."
                  />
                </div>
              ) : null}
              {!logsLoading && !logsError && !logsResult?.data.length ? (
                <div className="p-5">
                  <StatePanel
                    variant="empty"
                    title="Nessun invio registrato"
                    description="Quando prepari il primo messaggio manuale, comparira qui."
                  />
                </div>
              ) : null}

              {!logsLoading && !logsError && logsResult?.data.length ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-surface-border text-xs uppercase tracking-[1.8px] text-text-secondary">
                          <th className="p-4">Destinatario</th>
                          <th className="p-4">Template</th>
                          <th className="p-4">Messaggio</th>
                          <th className="p-4">Creato da</th>
                          <th className="p-4">Quando</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logsResult.data.map((log) => (
                          <tr key={log.id} className="border-b border-surface-border/50 align-top">
                            <td className="p-4">
                              <div className="space-y-1">
                                <p className="font-semibold text-white">{log.recipientName || 'Destinatario manuale'}</p>
                                <p className="text-sm text-text-secondary">{log.recipientPhone}</p>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-text-secondary">{log.templateName || 'Messaggio libero'}</td>
                            <td className="max-w-md p-4 text-sm leading-6 text-text-secondary">{log.message}</td>
                            <td className="p-4 text-sm text-text-secondary">{log.createdBy?.name || '-'}</td>
                            <td className="p-4 text-sm text-text-secondary">
                              {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm', { locale: it })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <PaginationControls
                    page={logsResult.page}
                    totalPages={logsResult.totalPages}
                    total={logsResult.total}
                    label="invii"
                    onPrev={() => setLogPage((current) => Math.max(1, current - 1))}
                    onNext={() => setLogPage((current) => Math.min(logsResult.totalPages, current + 1))}
                  />
                </>
              ) : null}
            </div>
          </section>
        </div>
      )}

      <WhatsAppTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSuccess={() => void mutateTemplates()}
        template={editingTemplate}
      />
    </div>
  );
}
