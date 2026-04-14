"use client";

import { useAuth } from '@/context/AuthContext';
import { useFormTemplates } from '@/hooks/domain/useFormTemplates';
import { formTemplateService } from '@/services/form-template.service';
import type { FieldDef, FormTemplate } from '@/types/form-template';
import { notifyError, notifySuccess } from '@/utils/toast';
import { FileText, Plus, Save, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

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
    <div className="bg-white/5 border border-surface-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Campo</span>
        <button type="button" onClick={onRemove} className="text-danger hover:text-danger/80 transition-colors cursor-pointer">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Nome (key)</label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => onChange({ ...field, name: e.target.value })}
            className="w-full p-2.5 rounded-lg bg-[#0a0a0a] border border-surface-border text-white text-sm focus:border-accent outline-none"
            placeholder="es. tattooStyle"
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onChange({ ...field, label: e.target.value })}
            className="w-full p-2.5 rounded-lg bg-[#0a0a0a] border border-surface-border text-white text-sm focus:border-accent outline-none"
            placeholder="es. Stile Tatuaggio"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Tipo</label>
          <select
            value={field.type}
            onChange={(e) => onChange({ ...field, type: e.target.value as FieldDef['type'] })}
            className="w-full p-2.5 rounded-lg bg-[#0a0a0a] border border-surface-border text-white text-sm focus:border-accent outline-none appearance-none"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={(e) => onChange({ ...field, required: e.target.checked })}
              className="w-4 h-4 rounded accent-accent"
            />
            <span className="text-sm text-text-secondary">Obbligatorio</span>
          </label>
        </div>
      </div>

      {field.type === 'select' && (
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Opzioni (una per riga)</label>
          <textarea
            value={(field.options || []).join('\n')}
            onChange={(e) => onChange({ ...field, options: e.target.value.split('\n').filter(Boolean) })}
            rows={3}
            className="w-full p-2.5 rounded-lg bg-[#0a0a0a] border border-surface-border text-white text-sm focus:border-accent outline-none resize-none"
            placeholder={"Opzione 1\nOpzione 2\nOpzione 3"}
          />
        </div>
      )}
    </div>
  );
}

export default function FormTemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: templates, mutate } = useFormTemplates();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, router]);

  const selectedTemplate = useMemo(() => {
    if (!selectedId || !templates) return null;
    return templates.find((t) => t.id === selectedId) || null;
  }, [selectedId, templates]);

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

  const handleSave = async () => {
    if (!templateName.trim()) {
      notifyError(new Error('Nome obbligatorio'), 'Inserisci un nome per il template');
      return;
    }
    const invalidFields = fields.filter((f) => !f.name.trim() || !f.label.trim());
    if (invalidFields.length > 0) {
      notifyError(new Error('Campi incompleti'), 'Ogni campo deve avere nome e label');
      return;
    }

    setSaving(true);
    try {
      const schemaB64 = encodeFields(fields);
      if (isCreating) {
        await formTemplateService.create({ name: templateName, schemaB64 });
        notifySuccess('Template creato');
      } else if (selectedId) {
        await formTemplateService.update(selectedId, { name: templateName, schemaB64 });
        notifySuccess('Template aggiornato');
      }
      await mutate();
      setIsCreating(false);
    } catch (error: unknown) {
      notifyError(error, 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await formTemplateService.delete(id);
      notifySuccess('Template eliminato');
      if (selectedId === id) {
        setSelectedId(null);
        setTemplateName('');
        setFields([]);
      }
      await mutate();
    } catch (error: unknown) {
      notifyError(error, 'Errore nella cancellazione');
    }
  };

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-outfit">Form Template</h1>
          <p className="text-text-secondary text-sm mt-1">
            Gestisci i template dinamici per le prenotazioni
          </p>
        </div>
        <button
          onClick={handleNewTemplate}
          className="flex items-center gap-2 bg-accent text-black px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Nuovo Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista template */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Template salvati</h2>
          {(!templates || templates.length === 0) && (
            <div className="text-text-secondary text-sm p-4 bg-white/5 rounded-xl border border-surface-border text-center">
              Nessun template. Creane uno nuovo.
            </div>
          )}
          {templates?.map((t) => (
            <div
              key={t.id}
              onClick={() => handleSelectTemplate(t)}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                selectedId === t.id
                  ? 'bg-accent/10 border-accent/40'
                  : 'bg-white/5 border-surface-border hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-accent" />
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-text-secondary text-xs">
                    {decodeFields(t.schemaB64).length} campi
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(t.id);
                }}
                className="text-text-secondary hover:text-danger transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Editor template */}
        <div className="lg:col-span-2">
          {(selectedId || isCreating) ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary mb-1 block font-semibold">Nome Template</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#0a0a0a] border border-surface-border text-white focus:border-accent outline-none"
                  placeholder="Es. Scheda Prenotazione Tattoo"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Campi del form</h3>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="flex items-center gap-1 text-accent text-sm font-semibold hover:text-accent/80 transition-colors cursor-pointer"
                  >
                    <Plus size={16} />
                    Aggiungi Campo
                  </button>
                </div>

                {fields.length === 0 && (
                  <div className="text-text-secondary text-sm p-6 bg-white/5 rounded-xl border border-dashed border-surface-border text-center">
                    Nessun campo. Clicca &quot;Aggiungi Campo&quot; per iniziare.
                  </div>
                )}

                {fields.map((field, idx) => (
                  <FieldEditor
                    key={idx}
                    field={field}
                    onChange={(updated) => handleFieldChange(idx, updated)}
                    onRemove={() => handleRemoveField(idx)}
                  />
                ))}
              </div>

              {/* Preview Base64 */}
              {fields.length > 0 && (
                <div>
                  <label className="text-xs text-text-secondary mb-1 block font-semibold">Preview Base64</label>
                  <div className="p-3 rounded-xl bg-[#0a0a0a] border border-surface-border text-text-secondary text-xs font-mono break-all max-h-20 overflow-auto">
                    {encodeFields(fields)}
                  </div>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-accent text-black px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save size={18} />
                {saving ? 'Salvataggio...' : isCreating ? 'Crea Template' : 'Salva Modifiche'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-text-secondary text-sm bg-white/5 rounded-xl border border-surface-border">
              Seleziona un template o creane uno nuovo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
