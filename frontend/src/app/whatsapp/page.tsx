"use client";

import { Edit, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import StatePanel from '@/components/feedback/StatePanel';
import SearchInput from '@/components/forms/SearchInput';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import WhatsAppTemplateModal from '@/components/modals/WhatsAppTemplateModal';
import { useAuth } from '@/context/AuthContext';
import { useWhatsAppTemplates } from '@/hooks/domain';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { whatsappService } from '@/services/whatsapp.service';
import type { WhatsAppTemplate } from '@/types/whatsapp';

export default function WhatsAppTemplatesPage() {
  const { isAdmin } = useAuth();
  const canManageTemplates = isAdmin;

  const [templateSearch, setTemplateSearch] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);

  const { data: templates, mutate: mutateTemplates, isLoading: templatesLoading } =
    useWhatsAppTemplates({ search: templateSearch });

  const filteredTemplates = useMemo(() => templates || [], [templates]);

  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const handleDeleteTemplate = async (templateId: number) => {
    await deleteItem({
      confirmMessage: 'Eliminare questo template?',
      action: () => whatsappService.deleteTemplate(templateId),
      successMessage: 'Template eliminato',
      errorMessage: 'Errore durante l\'eliminazione',
      onSuccess: mutateTemplates,
    });
  };

  if (!canManageTemplates) {
    return (
      <div className="flex-1 flex flex-col gap-6">
        <PageHeader title="WhatsApp Templates" />
        <StatePanel
          variant="error"
          title="Accesso limitato"
          description="Solo gli amministratori possono gestire i template WhatsApp."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <PageHeader
        title="WhatsApp Templates"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setEditingTemplate(null);
              setIsTemplateModalOpen(true);
            }}
          >
            Nuovo Template
          </Button>
        }
      >
        <div className="flex-1 max-w-md mx-auto">
          <SearchInput
            value={templateSearch}
            onChange={setTemplateSearch}
            placeholder="Cerca template..."
          />
        </div>
      </PageHeader>

      <div className="glass-panel flex-1 rounded-2xl flex flex-col overflow-hidden p-6 relative">
        <div className="mb-6 border-b border-surface-border/50 pb-4">
          <h2 className="text-xl font-outfit font-bold text-white">Gestione Template</h2>
          <p className="text-sm text-text-secondary mt-1">
          {"Crea e modifica i modelli di messaggio pronti da inviare dall'agenda."}
        </p>
        </div>

        {templatesLoading ? (
          <StatePanel variant="loading" fullPage title="Caricamento template..." />
        ) : filteredTemplates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
               <MessageCircle size={32} className="text-accent" />
            </div>
            <p className="text-lg font-bold text-white">Nessun template trovato</p>
            <p className="text-sm text-text-secondary mt-2 text-center max-w-md">
              {"Crea il tuo primo template WhatsApp per inviare messaggi rapidi ai clienti direttamente dall'agenda."}
            </p>
            <Button
               variant="primary"
               icon={Plus}
               onClick={() => setIsTemplateModalOpen(true)}
               className="mt-6"
            >
               Crea Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pb-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-5 rounded-2xl border border-surface-border bg-white/5 hover:bg-white/10 transition-colors flex flex-col group cursor-default shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-white leading-tight">{template.name}</span>
                    {!template.isActive && (
                       <span className="text-xs uppercase font-bold tracking-widest text-warning mt-1">Inattivo</span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTemplate(template);
                        setIsTemplateModalOpen(true);
                      }}
                      icon={<Edit size={16} />}
                      className="p-2"
                      title="Modifica"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      icon={<Trash2 size={16} />}
                      className="p-2"
                      title="Elimina"
                    />
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 flex-1 text-sm text-text-secondary italic line-clamp-6 mb-3">
                   {template.body}
                </div>

                <div className="flex justify-between items-center mt-auto border-t border-surface-border/50 pt-3">
                   <div className="text-xs text-text-secondary flex flex-wrap gap-1">
                      {(template.body.match(/\{\{([^}]+)\}\}/g) || []).map((vars, i) => (
                         <span key={i} className="px-1.5 py-0.5 bg-accent/10 text-accent rounded-md">{vars}</span>
                      ))}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
