'use client';

import CheckboxInput from '@/common/components/forms/CheckboxInput';
import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';
import TextareaInput from '@/common/components/forms/TextareaInput';
import { DeleteButton } from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import type { FieldDef } from '@/modules/form-templates/model/form-template.types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

const FIELD_TYPES: FieldDef['type'][] = ['text', 'number', 'date', 'select', 'checkbox'];

interface FieldEditorProps {
  index: number;
  field: FieldDef;
  onChange: (updated: FieldDef) => void;
  onRemove: () => void;
}

export default function FieldEditor({ index, field, onChange, onRemove }: FieldEditorProps) {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.palette.background.paper,
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.35),
          boxShadow: `0 8px 24px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'light' ? 0.06 : 0.18,
          )}`,
        },
      })}
    >
      <Box
        sx={(theme) => ({
          minHeight: 56,
          px: { xs: 2, sm: 2.5 },
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          backgroundColor: alpha(
            theme.palette.primary.main,
            theme.palette.mode === 'light' ? 0.04 : 0.08,
          ),
          borderBottom: '1px solid',
          borderColor: 'divider',
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '0.75rem',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {index + 1}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.25 }}>
              {field.label.trim() || `Nuovo campo ${index + 1}`}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {field.type.toUpperCase()}{field.required ? ' · Obbligatorio' : ' · Facoltativo'}
            </Typography>
          </Box>
        </Box>
        <DeleteButton
          variant="danger"
          size="sm"
          type="button"
          onClick={onRemove}
          icon={<Icon name="trash2" size={16} />}
          sx={{ minHeight: 40, flexShrink: 0 }}
        >
          Elimina
        </DeleteButton>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: { xs: 2, sm: 2.5 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          <FormInput
            name={`field-${index}-key`}
            label="Identificativo (key)"
            value={field.name}
            onChange={(value) =>
              onChange({ ...field, name: value.replace(/[^a-zA-Z0-9_]/g, '') })
            }
            placeholder="es. stileTatuaggio"
            required
          />
          <FormInput
            name={`field-${index}-label`}
            label="Etichetta visibile"
            value={field.label}
            onChange={(value) => onChange({ ...field, label: value })}
            placeholder="es. Stile del tatuaggio"
            required
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          <FormSelect
            label="Tipologia di campo"
            value={field.type}
            onChange={(value) => onChange({ ...field, type: value as FieldDef['type'] })}
            options={FIELD_TYPES.map((type) => ({ value: type, label: type.toUpperCase() }))}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 44, pt: { md: 3 } }}>
            <CheckboxInput
              label="Campo obbligatorio"
              checked={field.required ?? false}
              onChange={(checked) => onChange({ ...field, required: checked })}
            />
          </Box>
        </Box>

        {field.type === 'select' ? (
          <TextareaInput
            name={`field-${index}-options`}
            label="Opzioni a tendina"
            value={(field.options ?? []).join('\n')}
            onChange={(value) => onChange({ ...field, options: value.split('\n') })}
            rows={5}
            placeholder={'Realistico\nTradizionale\nMinimal\nAltro'}
            helperText="Inserisci un’opzione per riga. Premi Invio per aggiungerne una nuova."
          />
        ) : null}
      </Box>
    </Box>
  );
}
