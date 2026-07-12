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
import Button from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';
import Icon from '@/common/components/ui/Icon';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/common/components/ui/Modal/Modal';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';
import SwitchInput from '@/common/components/forms/SwitchInput';
import { useToast } from '@/common/hooks/useToast';
import { customFieldService, type CustomField } from '@/modules/custom-fields/api/customField.api';

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

export default function CustomFieldsManager() {
  const theme = useTheme();
  const toast = useToast();

  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState<string>('customer');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('string');
  const [isRequired, setIsRequired] = useState(false);
  const [optionsString, setOptionsString] = useState('');
  const [defaultValue, setDefaultValue] = useState('');

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const fields = await customFieldService.getAll(entityFilter);
      setFields(fields);
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
    setEditingField(null);
    setFieldLabel('');
    setFieldName('');
    setFieldType('string');
    setIsRequired(false);
    setOptionsString('');
    setDefaultValue('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (field: CustomField) => {
    setEditingField(field);
    setFieldLabel(field.fieldLabel);
    setFieldName(field.fieldName);
    setFieldType(field.fieldType);
    setIsRequired(field.isRequired);

    // Parse options if object (Record<string, string>)
    if (field.options && typeof field.options === 'object' && !Array.isArray(field.options)) {
      setOptionsString(Object.values(field.options).join(', '));
    } else if (field.options && Array.isArray(field.options)) {
      setOptionsString(field.options.join(', '));
    } else {
      setOptionsString('');
    }

    setDefaultValue(field.defaultValue ? String(field.defaultValue) : '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!fieldLabel.trim() || !fieldName.trim()) {
      toast.error('Nome e Etichetta sono obbligatori.');
      return;
    }

    // Alphanumeric lowercase camelCase check for fieldName
    if (!/^[a-z][a-zA-Z0-9]*$/.test(fieldName)) {
      toast.error('Il Nome del campo deve iniziare con una minuscola ed essere in formato camelCase (es. stilePreferito).');
      return;
    }

    setSaving(true);
    try {
      let parsedOptions: Record<string, string> | undefined = undefined;
      if (fieldType === 'select' || fieldType === 'multiselect') {
        const opts = optionsString
          .split(',')
          .map((opt) => opt.trim())
          .filter(Boolean);

        if (opts.length === 0) {
          toast.error('Fornisci almeno un\'opzione per i campi di tipo select/multiselect.');
          setSaving(false);
          return;
        }

        // Convert array to object with value->label mapping
        parsedOptions = opts.reduce((acc, opt) => {
          acc[opt.toLowerCase().replace(/\s+/g, '_')] = opt;
          return acc;
        }, {} as Record<string, string>);
      }

      let parsedDefault: any = defaultValue.trim();
      if (fieldType === 'boolean') {
        parsedDefault = defaultValue.toLowerCase() === 'true';
      } else if (fieldType === 'number') {
        parsedDefault = defaultValue ? Number(defaultValue) : undefined;
      }

      const payload = {
        entityType: entityFilter,
        fieldName,
        fieldType: fieldType as CustomField['fieldType'],
        fieldLabel,
        isRequired,
        options: parsedOptions,
        defaultValue: parsedDefault || null,
      };

      let res;
      if (editingField) {
        res = await customFieldService.update(editingField.id, payload);
      } else {
        res = await customFieldService.create(payload);
      }

      toast.success(editingField ? 'Campo aggiornato!' : 'Nuovo campo creato!');
      setIsModalOpen(false);
      fetchFields();
    } catch (err: any) {
      toast.error(err.message || 'Errore nel salvataggio.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await customFieldService.delete(deletingId);
      toast.success('Campo eliminato con successo!');
      setIsConfirmOpen(false);
      fetchFields();
    } catch (err) {
      toast.error('Errore di connessione.');
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Card
        variant="glass"
        size="lg"
        sx={{
          borderRadius: 3,
          background: alpha(theme.palette.common.white, 0.02),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Icon name="slidersHorizontal" size={22} color={theme.palette.primary.main} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'common.white' }}>
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
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`,
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
              border: `1px dashed ${alpha(theme.palette.common.white, 0.15)}`,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.common.white, 0.01),
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
              backgroundColor: alpha(theme.palette.common.black, 0.2),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.common.white, 0.06)}`,
            }}
          >
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
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
                      '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.02) },
                      borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
                    }}
                  >
                    <TableCell sx={{ color: 'common.white', fontFamily: 'monospace' }}>{field.fieldName}</TableCell>
                    <TableCell sx={{ color: 'common.white', fontWeight: 600 }}>{field.fieldLabel}</TableCell>
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
                          backgroundColor: field.isRequired ? alpha(theme.palette.error.main, 0.15) : alpha(theme.palette.common.white, 0.05),
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
      <Modal open={isModalOpen} onClose={() => !saving && setIsModalOpen(false)}>
        <ModalHeader
          title={editingField ? 'Modifica Campo Personalizzato' : 'Nuovo Campo Personalizzato'}
          onClose={() => !saving && setIsModalOpen(false)}
          subtitle={editingField ? `ID: ${editingField.id}` : `Aggiungi una configurazione dinamica per ${ENTITY_OPTIONS.find(e => e.value === entityFilter)?.label}`}
        />
        <ModalBody>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormInput
              label="Etichetta Visualizzata (Label)"
              value={fieldLabel}
              onChange={(val) => {
                setFieldLabel(val);
                // Auto generate fieldName from label if creating
                if (!editingField) {
                  const camel = val
                    .toLowerCase()
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .split(' ')
                    .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
                    .join('');
                  setFieldName(camel);
                }
              }}
              required
              placeholder="Es. Codice Fiscale, Allergie..."
              disabled={saving}
            />

            <FormInput
              label="Nome della Chiave (DB)"
              value={fieldName}
              onChange={setFieldName}
              required
              placeholder="Es. codiceFiscale, allergie"
              disabled={saving || !!editingField} // Do not allow renaming key once created
              sx={{ fontFamily: 'monospace' }}
            />

            <FormSelect
              label="Tipo di Dato"
              value={fieldType}
              onChange={setFieldType}
              options={FIELD_TYPE_OPTIONS}
              required
              disabled={saving}
            />

            <SwitchInput
              label="Campo Obbligatorio (isRequired)"
              checked={isRequired}
              onChange={setIsRequired}
              disabled={saving}
            />

            {(fieldType === 'select' || fieldType === 'multiselect') && (
              <FormInput
                label="Opzioni del menu (Separate da virgola)"
                value={optionsString}
                onChange={setOptionsString}
                required
                placeholder="Es. Opzione 1, Opzione 2, Opzione 3"
                disabled={saving}
              />
            )}

            <FormInput
              label="Valore Predefinito (Opzionale)"
              value={defaultValue}
              onChange={setDefaultValue}
              placeholder={fieldType === 'boolean' ? 'true / false' : "Es. Nessuna"}
              disabled={saving}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={saving}>
            Annulla
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={saving} loadingLabel="Salvataggio...">
            Salva
          </Button>
        </ModalFooter>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        open={isConfirmOpen}
        title="Elimina Campo Personalizzato"
        message="Sei sicuro di voler eliminare questo campo? Tutti i valori salvati in questo campo per i singoli record non saranno più associati o visualizzati correttamente."
        confirmText="Elimina"
        cancelText="Annulla"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </Box>
  );
}
