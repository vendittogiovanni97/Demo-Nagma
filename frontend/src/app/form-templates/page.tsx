"use client";

import PageHeader from '@/components/layout/PageHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useFormTemplates } from '@/hooks/domain/useFormTemplates';
import { useToast } from '@/hooks/useToast';
import { formTemplateService } from '@/services/form-template.service';
import type { FieldDef, FormTemplate } from '@/types/form-template';
import { Edit3, FileText, Plus, Save, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Checkbox, FormControlLabel, MenuItem, Select, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();

  const inputSx = {
    width: '100%',
    p: 1.5,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    border: `1px solid ${theme.palette.divider}`,
    color: 'white',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      borderColor: theme.palette.primary.main,
    },
  };

  const labelSx = {
    fontSize: '0.75rem',
    color: 'text.secondary',
    mb: 0.75,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    display: 'block',
    cursor: 'pointer',
  };

  return (
    <Box sx={{ position: 'relative', backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2.5, transition: 'all 0.2s ease', '&:hover': { borderColor: 'rgba(0,191,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
      <Box sx={{ position: 'absolute', top: 1, right: 1, opacity: 0, transition: 'opacity 0.2s ease', '.MuiBox-root:hover &': { opacity: 1 } }}>
        <Button variant="danger" size="sm" type="button" onClick={onRemove} icon={<Trash2 size={16} />} sx={{ p: 0.75 }} title="Elimina campo" />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Box component="label" sx={labelSx}>Identificativo (key)</Box>
            <Box component="input" type="text" value={field.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...field, name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })} sx={{ ...inputSx, fontFamily: 'monospace' }} placeholder="es. nomeGatto" />
          </Box>
          <Box>
            <Box component="label" sx={labelSx}>Etichetta Visibile</Box>
            <Box component="input" type="text" value={field.label} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...field, label: e.target.value })} sx={inputSx} placeholder="es. Nome del Gatto" />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Box component="label" sx={labelSx}>Tipologia di Campo</Box>
            <Select
              value={field.type}
              onChange={(e) => onChange({ ...field, type: e.target.value as FieldDef['type'] })}
              size="small"
              fullWidth
              sx={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: 2,
                fontSize: '0.875rem',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                '& .MuiSelect-icon': { color: theme.palette.text.secondary },
              }}
            >
              {FIELD_TYPES.map((t) => (
                <MenuItem key={t} value={t} sx={{ fontSize: '0.875rem' }}>{t.toUpperCase()}</MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', pt: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.required || false}
                  onChange={(e) => onChange({ ...field, required: e.target.checked })}
                  size="small"
                  sx={{
                    color: theme.palette.divider,
                    '&.Mui-checked': { color: theme.palette.primary.main },
                  }}
                />
              }
              label={<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>Campo Obbligatorio</Typography>}
              sx={{ userSelect: 'none', cursor: 'pointer', m: 0 }}
            />
          </Box>
        </Box>

        {field.type === 'select' && (
          <Box sx={{ mt: 0.5 }}>
            <Box component="label" sx={labelSx}>Opzioni a tendina (una per riga)</Box>
            <Box component="textarea" value={(field.options || []).join('\n')} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ ...field, options: e.target.value.split('\n').filter(Boolean) })} rows={3} sx={inputSx} placeholder="Opzione 1&#10;Opzione 2&#10;Altro..." />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function FormTemplatesPage() {
  const theme = useTheme();
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

  const dateInputSx = {
    borderRadius: 1,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'rgba(255,255,255,0.05)',
    px: 1.5,
    py: 1,
    fontSize: '0.875rem',
    color: 'white',
    outline: 'none',
    width: '9rem',
    transition: 'border-color 0.2s ease',
    '&:focus': { borderColor: theme.palette.primary.main },
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <PageHeader title="Workspace Template" actions={
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="input" type="date" value={startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)} sx={dateInputSx} />
            <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>—</Box>
            <Box component="input" type="date" value={endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)} sx={dateInputSx} />
            {(startDate || endDate) && (<Button variant="ghost" size="sm" onClick={() => { setStartDate(''); setEndDate(''); }} sx={{ fontSize: '0.75rem' }}>Reset</Button>)}
          </Box>
          <Button variant="primary" icon={<Plus />} onClick={handleNewTemplate}>Nuovo Template</Button>
        </>
      } />

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        <Box sx={{ backgroundColor: 'rgba(26,35,50,0.8)', backdropFilter: 'blur(10px)', width: { xs: '100%', lg: '33.333%' }, display: 'flex', flexDirection: 'column', borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ mb: 2 }}>
            <Box component="h2" sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif' }}>Raccoglitore</Box>
            <Box component="p" sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>Scegli un form da modificare</Box>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {(!templates || templates.length === 0) && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160, textAlign: 'center' }}>
                <Box sx={{ color: 'rgba(255,255,255,0.2)', mb: 1.5 }}><FileText size={32} /></Box>
                <Box component="p" sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>Nessun template creato.</Box>
              </Box>
            )}

            {templates?.map((t) => {
              const isSelected = selectedId === t.id;
              const fieldCount = decodeFields(t.schemaB64).length;

              return (
                <Box key={t.id} onClick={() => handleSelectTemplate(t)} sx={{ p: 2, borderRadius: 2, border: 1, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: 1.5, backgroundColor: isSelected ? 'rgba(0,191,255,0.1)' : 'rgba(255,255,255,0.05)', borderColor: isSelected ? 'primary.main' : 'divider', boxShadow: isSelected ? '0 0 15px rgba(0,191,255,0.1)' : 'none', '&:hover': { backgroundColor: isSelected ? 'rgba(0,191,255,0.1)' : 'rgba(255,255,255,0.1)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0, pr: 2 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: isSelected ? 'primary.main' : 'transparent', border: 1, borderColor: isSelected ? 'primary.main' : 'divider', color: isSelected ? 'black' : 'white' }}><FileText size={18} /></Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSelected ? 'primary.main' : 'white' }}>{t.name}</Box>
                        <Box sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.25 }}>Ultima modifica recente</Box>
                      </Box>
                    </Box>
                    <Button variant="icon" icon={<Trash2 size={18} />} sx={{ color: 'rgba(244,67,54,0.6)', '&:hover': { color: 'error.main', backgroundColor: 'rgba(244,67,54,0.1)' } }} onClick={(e) => { e.stopPropagation(); handleDelete(t.id, t.name); }} title="Elimina" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: 1, borderColor: 'rgba(255,255,255,0.1)', pt: 1.5 }}>
                    <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>Campi</Box>
                    <Badge variant="secondary" size="xs">{fieldCount}</Badge>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ backgroundColor: 'rgba(26,35,50,0.8)', backdropFilter: 'blur(10px)', flex: 1, width: { xs: '100%' }, display: 'flex', flexDirection: 'column', borderRadius: 2, position: 'relative', border: 1, borderColor: 'rgba(255,255,255,0.1)', minHeight: 500, overflow: 'hidden' }}>
          {(selectedId || isCreating) ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ p: 3, pb: 2, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'primary.main' }}>{isCreating ? 'Creazione Nuovo' : 'Modalità Modifica'}</Box><Edit3 size={12} /></Box>
                  <Button variant="ghost" icon={<X size={20} />} onClick={handleCloseEditor} sx={{ p: 0.25 }} />
                </Box>
                <Box component="input" type="text" value={templateName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplateName(e.target.value)} sx={{ width: '100%', backgroundColor: 'transparent', color: 'white', fontSize: { xs: '1.875rem', md: '2.25rem' }, fontWeight: 900, fontFamily: 'Outfit, sans-serif', outline: 'none', '&::placeholder': { color: 'divider' } }} placeholder="Titolo del Template..." />
              </Box>

              <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Box component="h3" sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Struttura Dati</Box>
                  <Box component="span" sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'text.secondary' }}>{fields.length} elementi</Box>
                </Box>

                {fields.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, textAlign: 'center', borderRadius: 2, border: '2px dashed', borderColor: 'divider', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <Box sx={{ color: 'text.secondary', mb: 1.5, opacity: 0.5 }}><Plus size={40} /></Box>
                    <Box component="p" sx={{ color: 'white', fontWeight: 600, mb: 0.25 }}>Nessun campo aggiunto</Box>
                    <Box component="p" sx={{ color: 'text.secondary', fontSize: '0.875rem', px: 4, maxWidth: 'sm', mb: 3 }}>Inizia ad aggiungere campi per costruire la struttura informativa del tuo template form.</Box>
                    <Button variant="secondary" onClick={handleAddField}>Aggiungi il primo campo</Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {fields.map((field, idx) => (<FieldEditor key={idx} field={field} onChange={(updated) => handleFieldChange(idx, updated)} onRemove={() => handleRemoveField(idx)} />))}
                    <Button variant="secondary" size="md" icon={<Plus size={18} />} fullWidth onClick={handleAddField} sx={{ mt: 2 }}>Aggiungi un altro campo</Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ p: 3, backgroundColor: '#081018', borderTop: 1, borderColor: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 'auto', position: 'sticky', bottom: 0, zIndex: 10 }}>
                <Button variant="primary" size="md" icon={!saving && <Save size={18} />} onClick={handleSave} disabled={saving} isLoading={saving} loadingLabel="Salvataggio..." sx={{ width: { xs: '100%', md: 'auto' } }}>{isCreating ? 'Pubblica Template' : 'Salva Modifiche'}</Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <Box sx={{ width: 96, height: 96, borderRadius: '50%', backgroundColor: 'rgba(0,191,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, border: 1, borderColor: 'rgba(0,191,255,0.1)' }}>
                <Box sx={{ color: 'rgba(0,191,255,0.6)' }}><FileText size={40} /></Box>
              </Box>
              <Box component="h3" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif', mb: 0.5 }}>Editor Template</Box>
              <Box component="p" sx={{ color: 'text.secondary', fontSize: '0.875rem', maxWidth: 'sm', mb: 4, lineHeight: 1.6 }}>Seleziona un template dal raccoglitore a sinistra per visualizzarne o modificarne la struttura, oppure creane uno partendo da zero.</Box>
              <Button variant="primary" icon={<Plus />} size="lg" onClick={handleNewTemplate}>Nuovo Template</Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}