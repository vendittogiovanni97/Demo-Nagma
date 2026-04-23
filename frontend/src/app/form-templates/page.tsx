"use client";

import PageHeader from '@/components/layout/PageHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useFormTemplates } from '@/hooks/domain/useFormTemplates';
import { useToast } from '@/hooks/useToast';
import { formTemplateService } from '@/services/form-template.service';
import type { FieldDef, FormTemplate } from '@/types/form-template';
import { Check, Edit3, FileText, Plus, Save, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

const FIELD_TYPES: FieldDef['type'][] = ['text', 'number', 'date', 'select', 'checkbox'];

interface FieldEditorProps {
  field: FieldDef;
  onChange: (updated: FieldDef) => void;
  onRemove: () => void;
}

function FieldEditor({ field, onChange, onRemove }: FieldEditorProps) {
  return (
    <div className="relative bg-white/5 border border-surface-border rounded-xl p-5 group transition-all hover:border-accent/30 hover:bg-white/10">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="danger"
          size="sm"
          type="button"
          onClick={onRemove}
          icon={<Trash2 size={16} />}
          className="p-1.5"
          title="Elimina campo"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-secondary mb-1.5 font-semibold uppercase tracking-wider block">Identificativo (key)</label>
            <input
              type="text"
              value={field.name}
              onChange={(e) => onChange({ ...field, name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
              className="w-full p-3 rounded-xl bg-black/40 border border-surface-border text-white text-sm focus:border-accent outline-none font-mono"
              placeholder="es. nomeGatto"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1.5 font-semibold uppercase tracking-wider block">Etichetta Visibile</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onChange({ ...field, label: e.target.value })}
              className="w-full p-3 rounded-xl bg-black/40 border border-surface-border text-white text-sm focus:border-accent outline-none"
              placeholder="es. Nome del Gatto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-secondary mb-1.5 font-semibold uppercase tracking-wider block">Tipologia di Campo</label>
            <div className="relative">
              <select
                value={field.type}
                onChange={(e) => onChange({ ...field, type: e.target.value as FieldDef['type'] })}
                className="w-full p-3 rounded-xl bg-black/40 border border-surface-border text-white text-sm focus:border-accent outline-none appearance-none"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                ▼
              </div>
            </div>
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-3 cursor-pointer select-none">
               <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={field.required || false}
                    onChange={(e) => onChange({ ...field, required: e.target.checked })}
                    className="peer appearance-none w-5 h-5 border-2 border-surface-border rounded bg-black/40 checked:bg-accent checked:border-accent transition-colors"
                  />
                  <Check size={14} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none stroke-3" />
               </div>
              <span className="text-sm font-semibold text-white">Campo Obbligatorio</span>
            </label>
          </div>
        </div>

        {field.type === 'select' && (
          <div className="mt-2">
            <label className="text-xs text-text-secondary mb-1.5 font-semibold uppercase tracking-wider block">Opzioni a tendina (una per riga)</label>
            <textarea
              value={(field.options || []).join('\n')}
              onChange={(e) => onChange({ ...field, options: e.target.value.split('\n').filter(Boolean) })}
              rows={3}
              className="w-full p-3 rounded-xl bg-black/40 border border-surface-border text-white text-sm focus:border-accent outline-none custom-scrollbar"
              placeholder={"Opzione 1\nOpzione 2\nAltro..."}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function FormTemplatesPage() {
  const toast = useToast();
  const { user, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { data: templates, mutate } = useFormTemplates({ startDate, endDate });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user && !isSuperAdmin) {
      router.push('/');
    }
  }, [user, router]);

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
      await mutate();
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
      await mutate();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nella cancellazione';
      toast.error(errorMessage);
    }
  };

  if (!isSuperAdmin) return null;

  return (
    <div className="flex-1 flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <PageHeader
        title="Workspace Template"
        actions={
          <>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-accent w-36"
              />
              <span className="text-text-secondary text-sm">—</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-accent w-36"
              />
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-xs"
                >
                  Reset
                </Button>
              )}
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleNewTemplate}
            >
              Nuovo Template
            </Button>
          </>
        }
      />

      {/* Main Content Layout */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">

        {/* Left Column: Template List */}
        <div className="glass-panel w-full lg:w-1/3 flex flex-col rounded-2xl p-5 border border-surface-border">
          <div className="mb-4">
             <h2 className="text-lg font-outfit font-bold text-white">Raccoglitore</h2>
             <p className="text-xs text-text-secondary mt-1">Scegli un form da modificare</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {(!templates || templates.length === 0) && (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                 <FileText size={32} className="text-surface-border/50 mb-3" />
                 <p className="text-text-secondary text-sm font-semibold">Nessun template creato.</p>
              </div>
            )}

            {templates?.map((t) => {
              const isSelected = selectedId === t.id;
              const fieldCount = decodeFields(t.schemaB64).length;

              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 group ${
                    isSelected
                      ? 'bg-accent/10 border-accent shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.1)]'
                      : 'bg-white/5 border-surface-border hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-accent text-black' : 'bg-surface border border-surface-border text-white'}`}>
                         <FileText size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold truncate ${isSelected ? 'text-accent' : 'text-white'}`}>{t.name}</div>
                        <div className="text-text-secondary text-xs mt-0.5.">Ultima modifica recente</div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(t.id, t.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-surface-border/50 pt-3">
                     <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                        Campi
                     </span>
                     <Badge variant="secondary" size="xs">
                        {fieldCount}
                     </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="glass-panel flex-1 w-full flex flex-col rounded-2xl relative border border-surface-border/50 min-h-125 overflow-hidden">
          {(selectedId || isCreating) ? (
            <div className="flex flex-col h-full">

               {/* Editor Header */}
               <div className="p-6 pb-4 border-b border-surface-border/50 bg-black/20 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                        {isCreating ? 'Creazione Nuovo' : 'Modalità Modifica'}
                        <Edit3 size={12} />
                     </span>
                     <Button
                        variant="ghost"
                        icon={<X size={20} />}
                        onClick={handleCloseEditor}
                        className="p-1"
                     />
                  </div>

                  <input
                     type="text"
                     value={templateName}
                     onChange={(e) => setTemplateName(e.target.value)}
                     className="w-full bg-transparent text-white font-outfit font-black text-3xl md:text-4xl placeholder:text-surface-border outline-none"
                     placeholder="Titolo del Template..."
                     autoFocus={isCreating}
                  />
               </div>

               {/* Editor Body (Fields) */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-border/50">
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider">Struttura Dati</h3>
                     <span className="text-xs font-mono text-text-secondary">{fields.length} elementi</span>
                  </div>

                  {fields.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border-2 border-dashed border-surface-border bg-white/5">
                        <Plus size={40} className="text-text-secondary mb-3 opacity-50" />
                        <p className="text-white font-semibold mb-1">Nessun campo aggiunto</p>
                        <p className="text-sm text-text-secondary px-8 max-w-sm mb-6">Inizia ad aggiungere campi per costruire la struttura informativa del tuo template form.</p>
                        <Button
                           variant="secondary"
                           onClick={handleAddField}
                        >
                           Aggiungi il primo campo
                        </Button>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {fields.map((field, idx) => (
                           <FieldEditor
                              key={idx}
                              field={field}
                              onChange={(updated) => handleFieldChange(idx, updated)}
                              onRemove={() => handleRemoveField(idx)}
                           />
                        ))}

                        <Button
                           variant="secondary"
                           size="md"
                           icon={<Plus size={18} />}
                           fullWidth
                           onClick={handleAddField}
                           className="mt-4"
                        >
                           Aggiungi un altro campo
                        </Button>
                     </div>
                  )}
               </div>

               {/* Editor Footer / Actions */}
               <div className="p-6 bg-[#081018] border-t border-surface-border/50 flex justify-end gap-3 mt-auto sticky bottom-0 z-10">
                  <Button
                     variant="primary"
                     size="md"
                     icon={!saving && <Save size={18} />}
                     onClick={handleSave}
                     disabled={saving}
                     isLoading={saving}
                     loadingLabel="Salvataggio..."
                     className="w-full md:w-auto"
                  >
                     {isCreating ? 'Pubblica Template' : 'Salva Modifiche'}
                  </Button>
               </div>
            </div>
          ) : (
            // Empty State
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-black/10">
               <div className="w-24 h-24 rounded-full bg-accent/5 flex items-center justify-center mb-6 border border-accent/10">
                  <FileText size={40} className="text-accent/60" />
               </div>
               <h3 className="text-2xl font-outfit font-bold text-white mb-2">Editor Template</h3>
               <p className="text-text-secondary text-sm max-w-sm mb-8 leading-relaxed">
                  Seleziona un template dal raccoglitore a sinistra per visualizzarne o modificarne la struttura, oppure creane uno partendo da zero.
               </p>
               <Button
                  variant="primary"
                  icon={Plus}
                  size="lg"
                  onClick={handleNewTemplate}
               >
                  Nuovo Template
               </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
