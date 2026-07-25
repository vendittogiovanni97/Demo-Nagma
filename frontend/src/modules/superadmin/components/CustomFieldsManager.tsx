"use client";

import { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Button, { CancelButton, SaveButton } from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';
import Icon from '@/common/components/ui/Icon';
import SmartModal from '@/common/components/common/SmartModal';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';
import SwitchInput from '@/common/components/forms/SwitchInput';
import { useToast } from '@/common/hooks/useToast';
import { customFieldService, type CustomField } from '@/common/shared/api/custom-field.api';

const ENTITY_OPTIONS = [
  { value: 'customer', label: 'Clienti' },
  { value: 'booking', label: 'Appuntamenti' },
  { value: 'staff', label: 'Collaboratori (Staff)' },
] as const;

const FIELD_TYPE_OPTIONS = [
  { value: 'string', label: 'Testo' },
  { value: 'number', label: 'Numero' },
  { value: 'boolean', label: 'Booleano (Sì/No)' },
  { value: 'date', label: 'Data' },
  { value: 'select', label: 'Scelta Singola (Select)' },
  { value: 'multiselect', label: 'Scelta Multipla (Multiselect)' },
] as const;

// ─── Typed state interfaces ──────────────────────────────────────────────────
interface FieldFormData {
  fieldLabel: string;
  fieldName: string;
  fieldType: string;
  isRequired: boolean;
  optionsString: string;
  defaultValue: string;
}

interface ModalUiState {
  open: boolean;
  editing: CustomField | null;
  saving: boolean;
}

interface DeleteState {
  id: string | null;
  confirmOpen: boolean;
}

const FIELD_FORM_INITIAL: FieldFormData = {
  fieldLabel: '',
  fieldName: '',
  fieldType: 'string',
  isRequired: false,
  optionsString: '',
  defaultValue: '',
};

const MODAL_INITIAL: ModalUiState = { open: false, editing: null, saving: false };
const DELETE_INITIAL: DeleteState = { id: null, confirmOpen: false };
// ─────────────────────────────────────────────────────────────────────────────

export default function CustomFieldsManager() {
  const theme = useTheme();
  const toast = useToast();

  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState<string>('customer');

  const [fieldForm, setFieldForm] = useState<FieldFormData>(FIELD_FORM_INITIAL);
  const [modal, setModal] = useState<ModalUiState>(MODAL_INITIAL);
  const [deleteState, setDeleteState] = useState<DeleteState>(DELETE_INITIAL);

  const setFormField = <K extends keyof FieldFormData>(k: K, v: FieldFormData[K]) =>
    setFieldForm((prev) => ({ ...prev, [k]: v }));

  const fetchFields = async () => {
    setLoading(true);
    try {
      const data = await customFieldService.getAll(entityFilter);
      setFields(data);
    } catch (err) {
      toast.error('Errore di caricamento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [entityFilter]);

  const handleOpenAddModal = () => {
    setModal({ open: true, editing: null, saving: false });
    setFieldForm(FIELD_FORM_INITIAL);
  };

  const handleOpenEditModal = (field: CustomField) => {
    let optionsString = '';
    if (field.options && typeof field.options === 'object' && !Array.isArray(field.options)) {
      optionsString = Object.values(field.options).join(', ');
    } else if (field.options && Array.isArray(field.options)) {
      optionsString = field.options.join(', ');
    }

    setFieldForm({
      fieldLabel: field.fieldLabel,
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      optionsString,
      defaultValue: field.defaultValue ? String(field.defaultValue) : '',
    });
    setModal({ open: true, editing: field, saving: false });
  };

  const handleSave = async () => {
    if (!fieldForm.fieldLabel.trim() || !fieldForm.fieldName.trim()) {
      toast.error('Nome e Etichetta sono obbligatori.');
      return;
    }

    if (!/^[a-z][a-zA-Z0-9]*$/.test(fieldForm.fieldName)) {
      toast.error('Il Nome del campo deve iniziare con una minuscola ed essere in formato camelCase (es. stilePreferito).');
      return;
    }

    setModal((prev) => ({ ...prev, saving: true }));
    try {
      let parsedOptions: Record<string, string> | undefined = undefined;
      if (fieldForm.fieldType === 'select' || fieldForm.fieldType === 'multiselect') {
        const opts = fieldForm.optionsString
          .split(',')
          .map((opt) => opt.trim())
          .filter(Boolean);

        if (opts.length === 0) {
          toast.error("Fornisci almeno un'opzione per i campi di tipo select/multiselect.");
          setModal((prev) => ({ ...prev, saving: false }));
          return;
        }

        parsedOptions = opts.reduce((acc, opt) => {
          acc[opt.toLowerCase().replace(/\s+/g, '_')] = opt;
          return acc;
        }, {} as Record<string, string>);
      }

      // Typed union instead of `any`
      let parsedDefault: string | number | boolean | undefined = fieldForm.defaultValue.trim() || undefined;
      if (fieldForm.fieldType === 'boolean') {
        parsedDefault = fieldForm.defaultValue.toLowerCase() === 'true';
      } else if (fieldForm.fieldType === 'number') {
        parsedDefault = fieldForm.defaultValue ? Number(fieldForm.defaultValue) : undefined;
      }

      const payload = {
        entityType: entityFilter,
        fieldName: fieldForm.fieldName,
        fieldType: fieldForm.fieldType as CustomField['fieldType'],
        fieldLabel: fieldForm.fieldLabel,
        isRequired: fieldForm.isRequired,
        options: parsedOptions,
        defaultValue: parsedDefault ?? null,
      };

      if (modal.editing) {
        await customFieldService.update(modal.editing.id, payload);
      } else {
        await customFieldService.create(payload);
      }

      toast.success(modal.editing ? 'Campo aggiornato!' : 'Nuovo campo creato!');
      setModal(MODAL_INITIAL);
      fetchFields();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore nel salvataggio.';
      toast.error(message);
    } finally {
      setModal((prev) => ({ ...prev, saving: false }));
    }
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setDeleteState({ id, confirmOpen: true });
  };

  const handleDelete = async () => {
    if (!deleteState.id) return;
    try {
      await customFieldService.delete(deleteState.id);
      toast.success('Campo eliminato con successo!');
      setDeleteState(DELETE_INITIAL);
      fetchFields();
    } catch (err) {
      toast.error('Errore di connessione.');
    }
  };

  const isLight = theme.palette.mode === 'light';

  return (
    <Box sx={{ mt: 1 }}>
      <Card
        variant="glass"
        size="lg"
        sx={{
          borderRadius: 3,
          backgroundColor: isLight ? 'background.paper' : alpha(theme.palette.common.white, 0.02),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Icon name="slidersHorizontal" size={22} color={theme.palette.primary.main} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Gestione Campi Personalizzati
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                Aggiungi o modifica campi addizionali per Clienti, Prenotazioni o Collaboratori.
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
            <FormSelect
              label=""
              value={entityFilter}
              onChange={(val) => setEntityFilter(val)}
              options={ENTITY_OPTIONS}
              hideLabel
              sx={{ minWidth: 180 }}
            />
            <Button
              variant="primary"
              onClick={handleOpenAddModal}
              icon={<Icon name="plus" size={16} />}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              Nuovo Campo
            </Button>
          </Stack>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={40} sx={{ color: 'primary.main' }} />
          </Box>
        ) : fields.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              border: `1px dashed ${alpha(theme.palette.primary.main, isLight ? 0.25 : 0.15)}`,
              borderRadius: 2,
              backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.common.white, 0.01),
            }}
          >
            <Icon name="info" size={32} color={theme.palette.text.secondary} className="mb-2" />
            <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>Nessun campo personalizzato</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}>
              Usa il pulsante in alto a destra per creare il primo campo per questa entità.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            sx={{
              backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.02) : alpha(theme.palette.common.black, 0.2),
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Nome Chiave</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Etichetta (UI)</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Tipo di Dato</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="center">Obbligatorio</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Opzioni</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="right">Azioni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field) => (
                  <TableRow
                    key={field.id}
                    sx={{
                      '&:hover': { backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.common.white, 0.02) },
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <TableCell sx={{ color: 'text.primary', fontFamily: 'monospace' }}>{field.fieldName}</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>{field.fieldLabel}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {FIELD_TYPE_OPTIONS.find((t) => t.value === field.fieldType)?.label || field.fieldType}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: field.isRequired
                            ? alpha(theme.palette.error.main, 0.15)
                            : (isLight ? alpha(theme.palette.text.primary, 0.06) : alpha(theme.palette.common.white, 0.05)),
                          color: field.isRequired ? theme.palette.error.main : theme.palette.text.secondary,
                        }}
                      >
                        {field.isRequired ? 'SÌ' : 'NO'}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {field.options ? (
                        Array.isArray(field.options) ? (
                          field.options.join(', ')
                        ) : typeof field.options === 'object' ? (
                          Object.values(field.options).join(', ')
                        ) : (
                          '-'
                        )
                      ) : (
                        <Typography sx={{ color: alpha(theme.palette.common.white, 0.25), fontSize: '0.875rem', fontStyle: 'italic' }}>Nessuna</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEditModal(field)}
                          icon={<Icon name="edit" size={14} />}
                          sx={{ borderRadius: 1.5, minWidth: 'auto', p: 1 }}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenDeleteConfirm(field.id)}
                          icon={<Icon name="trash2" size={14} />}
                          sx={{
                            borderRadius: 1.5,
                            minWidth: 'auto',
                            p: 1,
                            borderColor: alpha(theme.palette.error.main, 0.3),
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                              borderColor: theme.palette.error.main,
                            }
                          }}
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* CREATE / EDIT MODAL */}
      <SmartModal
        isOpen={modal.open}
        onClose={() => !modal.saving && setModal(MODAL_INITIAL)}
        title={modal.editing ? 'Modifica Campo Personalizzato' : 'Nuovo Campo Personalizzato'}
        onSave={handleSave}
        isSaving={modal.saving}
        saveLabel={modal.editing ? 'Salva Modifiche' : 'Crea Campo'}
      >
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormInput
            label="Etichetta Visualizzata (Label)"
            value={fieldForm.fieldLabel}
            onChange={(val: string) => {
              setFormField('fieldLabel', val);
              // Auto generate fieldName from label if creating
              if (!modal.editing) {
                const camel = val
                  .toLowerCase()
                  .replace(/[^a-zA-Z0-9\s]/g, '')
                  .split(' ')
                  .map((word, i) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
                  .join('');
                setFormField('fieldName', camel);
              }
            }}
            required
            placeholder="Es. Codice Fiscale, Allergie..."
            disabled={modal.saving}
          />

          <FormInput
            label="Nome della Chiave (DB)"
            value={fieldForm.fieldName}
            onChange={(v: string) => setFormField('fieldName', v)}
            required
            placeholder="Es. codiceFiscale, allergie"
            disabled={modal.saving || !!modal.editing} // Do not allow renaming key once created
            sx={{ fontFamily: 'monospace' }}
          />

          <FormSelect
            label="Tipo di Dato"
            value={fieldForm.fieldType}
            onChange={(v: string) => setFormField('fieldType', v)}
            options={FIELD_TYPE_OPTIONS}
            required
            disabled={modal.saving}
          />

          <SwitchInput
            label="Campo Obbligatorio (isRequired)"
            checked={fieldForm.isRequired}
            onChange={(v: boolean) => setFormField('isRequired', v)}
            disabled={modal.saving}
          />

          {(fieldForm.fieldType === 'select' || fieldForm.fieldType === 'multiselect') && (
            <FormInput
              label="Opzioni del menu (Separate da virgola)"
              value={fieldForm.optionsString}
              onChange={(v: string) => setFormField('optionsString', v)}
              required
              placeholder="Es. Opzione 1, Opzione 2, Opzione 3"
              disabled={modal.saving}
            />
          )}

          <FormInput
            label="Valore Predefinito (Opzionale)"
            value={fieldForm.defaultValue}
            onChange={(v: string) => setFormField('defaultValue', v)}
            placeholder={fieldForm.fieldType === 'boolean' ? 'true / false' : 'Es. Nessuna'}
            disabled={modal.saving}
          />
        </Stack>
      </SmartModal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        open={deleteState.confirmOpen}
        title="Elimina Campo Personalizzato"
        message="Sei sicuro di voler eliminare questo campo? Tutti i valori salvati in questo campo per i singoli record non saranno più associati o visualizzati correttamente."
        confirmText="Elimina"
        cancelText="Annulla"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setDeleteState(DELETE_INITIAL)}
      />
    </Box>
  );
}
