"use client";

import Button, { CloseButton, SaveButton, OkButton } from '@/common/components/ui/Button';
import type { FieldDef } from '@/modules/form-templates/model/form-template.types';
import Box from '@mui/material/Box';
import { useTheme, alpha } from '@mui/material/styles';
import Icon from '@/common/components/ui/Icon';
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
  const theme = useTheme();
  const isEditorOpen = selectedId !== null || isCreating;

  return (
    <Box
      sx={{
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        flex: 1,
        width: { xs: '100%' },
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        position: 'relative',
        border: 1,
        borderColor: alpha(theme.palette.common.white, 0.1),
        minHeight: 500,
        overflow: 'hidden',
      }}
    >
      {isEditorOpen ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box
            sx={{
              p: 3,
              pb: 2,
              borderBottom: 1,
              borderColor: alpha(theme.palette.common.white, 0.1),
              backgroundColor: 'rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'primary.main',
                  }}
                >
                  {isCreating ? 'Creazione Nuovo' : 'Modalità Modifica'}
                </Box>
                <Icon name="edit3" size={12} />
              </Box>
              <CloseButton
              variant="ghost"
              icon={<Icon name="x" size={20} />}
              onClick={onClose}
              sx={{ p: 0.25 }}
            />
            </Box>
            <Box
              component="input"
              type="text"
              value={templateName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onTemplateNameChange(e.target.value)
              }
              sx={{
                width: '100%',
                backgroundColor: 'transparent',
                color: 'white',
                fontSize: { xs: '1.875rem', md: '2.25rem' },
                fontWeight: 900,
                fontFamily: 'Outfit, sans-serif',
                outline: 'none',
                '&::placeholder': { color: 'divider' },
              }}
              placeholder="Titolo del Template..."
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1,
                borderBottom: 1,
                borderColor: alpha(theme.palette.common.white, 0.1),
              }}
            >
              <Box
                component="h3"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'common.white',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Struttura Dati
              </Box>
              <Box
                component="span"
                sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'text.secondary' }}
              >
                {fields.length} elementi
              </Box>
            </Box>

            {fields.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 6,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '2px dashed',
                  borderColor: 'divider',
                  backgroundColor: alpha(theme.palette.common.white, 0.05),
                }}
              >
                <Box sx={{ color: 'text.secondary', mb: 1.5, opacity: 0.5 }}>
                  <Icon name="plus" size={40} />
                </Box>
                <Box component="p" sx={{ color: 'common.white', fontWeight: 600, mb: 0.25 }}>
                  Nessun campo aggiunto
                </Box>
                <Box
                  component="p"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    px: 4,
                    maxWidth: 'sm',
                    mb: 3,
                  }}
                >
                  Inizia ad aggiungere campi per costruire la struttura informativa del tuo template
                  form.
                </Box>
                <Button variant="secondary" onClick={onAddField}>
                  Aggiungi il primo campo
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {fields.map((field, idx) => (
                  <FieldEditor
                    key={idx}
                    field={field}
                    onChange={(updated) => onFieldChange(idx, updated)}
                    onRemove={() => onRemoveField(idx)}
                  />
                ))}
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Icon name="plus" size={18} />}
                  fullWidth
                  onClick={onAddField}
                  sx={{ mt: 2 }}
                >
                  Aggiungi un altro campo
                </Button>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              p: 3,
              backgroundColor: 'background.default',
              borderTop: 1,
              borderColor: alpha(theme.palette.common.white, 0.1),
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1.5,
              mt: 'auto',
              position: 'sticky',
              bottom: 0,
              zIndex: 10,
            }}
          >
            <Button
              variant="primary"
              size="md"
              icon={!saving ? <Icon name="save" size={18} /> : undefined}
              onClick={onSave}
              disabled={saving}
              isLoading={saving}
              loadingLabel="Salvataggio..."
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              {isCreating ? 'Pubblica Template' : 'Salva Modifiche'}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)',
          }}
        >
          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              border: 1,
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Box sx={{ color: alpha(theme.palette.primary.main, 0.6) }}>
              <Icon name="fileText" size={40} />
            </Box>
          </Box>
          <Box
            component="h3"
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'common.white',
              fontFamily: 'Outfit, sans-serif',
              mb: 0.5,
            }}
          >
            Editor Template
          </Box>
          <Box
            component="p"
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
              maxWidth: 'sm',
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Seleziona un template dal raccoglitore a sinistra per visualizzarne o modificarne la
            struttura, oppure creane uno partendo da zero.
          </Box>
          <Button variant="primary" icon={(props: any) => <Icon name="plus" {...props} />} size="lg" onClick={onNewTemplate}>
            Nuovo Template
          </Button>
        </Box>
      )}
    </Box>
  );
}
