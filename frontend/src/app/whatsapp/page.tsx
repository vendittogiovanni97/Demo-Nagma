"use client";

import { Edit, MessageCircle, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import StatePanel from '@/components/feedback/StatePanel';
import WhatsAppTemplateModal from '@/components/modals/WhatsAppTemplateModal';
import { useAuth } from '@/context/AuthContext';
import { useWhatsAppTemplates } from '@/hooks/domain';
import { whatsappService } from '@/services/whatsapp.service';
import type { WhatsAppTemplate } from '@/types/whatsapp';
import { canManageWhatsAppTemplates } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';

export default function WhatsAppTemplatesPage() {
  const { user } = useAuth();
  const canManageTemplates = canManageWhatsAppTemplates(user?.role);

  const [templateSearch, setTemplateSearch] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);

  const { data: templates, mutate: mutateTemplates, isLoading: templatesLoading } =
    useWhatsAppTemplates({ search: templateSearch });

  const filteredTemplates = useMemo(() => templates || [], [templates]);

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Eliminare questo template?')) return;
    try {
      await whatsappService.deleteTemplate(templateId);
      notifySuccess('Template eliminato');
      void mutateTemplates();
    } catch (error: unknown) {
      notifyError(error, 'Errore durante l\'eliminazione');
    }
  };

  if (!canManageTemplates) {
    return (
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-outfit font-bold text-white">WhatsApp Templates</h1>
          </div>
        </div>
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
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-outfit font-bold text-white">WhatsApp Templates</h1>
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
        </div>
      </div>

      {/* Main Content: Template Grid */}
      <div className="glass-panel flex-1 rounded-2xl flex flex-col overflow-hidden p-6 relative">
        <div className="mb-6 border-b border-surface-border/50 pb-4">
          <h2 className="text-xl font-outfit font-bold text-white">Gestione Template</h2>
          <p className="text-sm text-text-secondary mt-1">Crea e modifica i modelli di messaggio pronti da inviare dall'agenda.</p>
        </div>

        {templatesLoading ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent border-t-transparent" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
               <MessageCircle size={32} className="text-accent" />
            </div>
            <p className="text-lg font-bold text-white">Nessun template trovato</p>
            <p className="text-sm text-text-secondary mt-2 text-center max-w-md">
              Crea il tuo primo template WhatsApp per inviare messaggi rapidi ai clienti direttamente dall'agenda.
            </p>
            <button
               onClick={() => setIsTemplateModalOpen(true)}
               className="btn-primary mt-6 flex items-center gap-2 px-6"
            >
               <Plus size={20} />
               <span>Crea Template</span>
            </button>
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
                    <button
                      onClick={() => {
                        setEditingTemplate(template);
                        setIsTemplateModalOpen(true);
                      }}
                      className="p-2 bg-surface hover:bg-white/20 rounded-lg text-text-secondary hover:text-white transition"
                      title="Modifica"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 bg-surface hover:bg-danger rounded-lg text-text-secondary hover:text-white transition"
                      title="Elimina"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-xl p-4 flex-1 text-sm text-text-secondary italic line-clamp-6 mb-3">
                   {template.body}
                </div>

                <div className="flex justify-between items-center mt-auto border-t border-surface-border/50 pt-3">
                   <div className="text-xs text-text-secondary flex flex-wrap gap-1">
                      {/* extract variables visually maybe? */}
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
    </div>
  );
}
