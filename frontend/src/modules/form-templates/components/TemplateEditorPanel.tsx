'use client';

import FormInput from '@/common/components/forms/FormInput';
import { CloseButton, OkButton, SaveButton } from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import type { FieldDef } from '@/modules/form-templates/model/form-template.types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import FieldEditor from './FieldEditor';

interface TemplateEditorPanelProps {
  selectedId: number | null;
  isCreating: boolean;
  templateName: string;
  fields: FieldDef[];
  saving: boolean;
  onTemplateNameChange: (name: string) => void;
  onAddField: () => void;
  onFieldChange: (index: number, updated: FieldDef) => void;
  onRemoveField: (index: number) => void;
  onClose: () => void;
  onSave: () => void;
  onNewTemplate: () => void;
}

export default function TemplateEditorPanel({
  selectedId,
  isCreating,
  templateName,
  fields,
  saving,
  onTemplateNameChange,
  onAddField,
  onFieldChange,
  onRemoveField,
  onClose,
  onSave,
  onNewTemplate,
}: TemplateEditorPanelProps) {
  const isEditorOpen = selectedId !== null || isCreating;

  return (
    <Box
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        minHeight: { xs: 520, lg: 0 },
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: `0 12px 32px ${alpha(
          theme.palette.common.black,
          theme.palette.mode === 'light' ? 0.05 : 0.18,
        )}`,
      })}
    >
      {isEditorOpen ? (
        <>
          <Box
            sx={(theme) => ({
              px: { xs: 2, sm: 3 },
              py: 2.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              backgroundColor: theme.palette.background.paper,
              borderBottom: '1px solid',
              borderColor: theme.palette.divider,
            })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={(theme) => ({
                    width: 34,
                    height: 34,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 2,
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  })}
                >
                  <Icon name={isCreating ? 'plus' : 'edit3'} size={18} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: 'primary.main',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {isCreating ? 'Nuovo template' : 'Modifica template'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    Configura il titolo e i campi visualizzati nel form.
                  </Typography>
                </Box>
              </Box>
              <CloseButton
                variant="icon"
                icon={<Icon name="x" size={20} />}
                onClick={onClose}
                title="Chiudi editor"
                aria-label="Chiudi editor"
              />
            </Box>

            <FormInput
              name="template-name"
              label="Nome del template"
              value={templateName}
              onChange={onTemplateNameChange}
              placeholder="es. Scheda prenotazione tattoo"
              required
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: { xs: '1.125rem', sm: '1.35rem' },
                  fontWeight: 750,
                },
              }}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              px: { xs: 2, sm: 3 },
              py: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.primary' }}>
                  Campi del form
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                  Definisci le informazioni che verranno richieste.
                </Typography>
              </Box>
              <Box
                sx={(theme) => ({
                  px: 1.25,
                  py: 0.6,
                  borderRadius: 10,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  whiteSpace: 'nowrap',
                })}
              >
                {fields.length} {fields.length === 1 ? 'campo' : 'campi'}
              </Box>
            </Box>

            {fields.length === 0 ? (
              <Box
                sx={(theme) => ({
                  minHeight: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.25,
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: '1px dashed',
                  borderColor: theme.palette.divider,
                  backgroundColor: alpha(theme.palette.primary.main, 0.025),
                })}
              >
                <Box sx={{ color: 'primary.main', display: 'inline-flex' }}>
                  <Icon name="fileText" size={36} />
                </Box>
                <Typography sx={{ color: 'text.primary', fontWeight: 750 }}>
                  Il template non contiene ancora campi
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', maxWidth: 440 }}>
                  Aggiungi il primo campo e scegli se sarà testo, numero, data, selezione o checkbox.
                </Typography>
                <OkButton variant="secondary" icon={<Icon name="plus" size={18} />} onClick={onAddField} sx={{ mt: 1 }}>
                  Aggiungi il primo campo
                </OkButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {fields.map((field, index) => (
                  <FieldEditor
                    key={index}
                    index={index}
                    field={field}
                    onChange={(updated) => onFieldChange(index, updated)}
                    onRemove={() => onRemoveField(index)}
                  />
                ))}
                <OkButton
                  variant="secondary"
                  icon={<Icon name="plus" size={18} />}
                  fullWidth
                  onClick={onAddField}
                  sx={{ mt: 0.5, minHeight: 48 }}
                >
                  Aggiungi un altro campo
                </OkButton>
              </Box>
            )}
          </Box>

          <Box
            sx={(theme) => ({
              px: { xs: 2, sm: 3 },
              py: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: theme.palette.background.paper,
              borderTop: '1px solid',
              borderColor: theme.palette.divider,
            })}
          >
            <SaveButton
              icon={!saving ? <Icon name="save" size={18} /> : undefined}
              onClick={onSave}
              disabled={saving}
              isLoading={saving}
              loadingLabel="Salvataggio..."
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 180 } }}
            >
              {isCreating ? 'Crea template' : 'Salva modifiche'}
            </SaveButton>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 460,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            p: 4,
            textAlign: 'center',
          }}
        >
          <Box
            sx={(theme) => ({
              width: 76,
              height: 76,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
            })}
          >
            <Icon name="fileText" size={34} />
          </Box>
          <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: 'text.primary' }}>
            Seleziona un template
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', maxWidth: 460 }}>
            Apri un template dal raccoglitore per modificarlo oppure creane uno nuovo.
          </Typography>
          <OkButton icon={<Icon name="plus" size={18} />} onClick={onNewTemplate} sx={{ mt: 1 }}>
            Nuovo template
          </OkButton>
        </Box>
      )}
    </Box>
  );
}
