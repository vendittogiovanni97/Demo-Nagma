"use client";

import Button from '@/common/components/ui/Button';
import CheckboxInput from '@/common/components/forms/CheckboxInput';
import FormSelect from '@/common/components/forms/FormSelect';
import type { FieldDef } from '@/modules/form-templates/model/form-template.types';
import Box from '@mui/material/Box';
import { useTheme, alpha } from '@mui/material/styles';
import Icon from '@/common/components/ui/Icon';

const FIELD_TYPES: FieldDef['type'][] = ['text', 'number', 'date', 'select', 'checkbox'];

interface FieldEditorProps {
  field: FieldDef;
  onChange: (updated: FieldDef) => void;
  onRemove: () => void;
}

export default function FieldEditor({ field, onChange, onRemove }: FieldEditorProps) {
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
    <Box
      sx={{
        position: 'relative',
        backgroundColor: alpha(theme.palette.common.white, 0.05),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 2.5,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.3),
          backgroundColor: alpha(theme.palette.common.white, 0.1),
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 1,
          right: 1,
          opacity: 0,
          transition: 'opacity 0.2s ease',
          '.MuiBox-root:hover &': { opacity: 1 },
        }}
      >
        <Button
          variant="danger"
          size="sm"
          type="button"
          onClick={onRemove}
          icon={<Icon name="trash2" size={16} />}
          sx={{ p: 0.75 }}
          title="Elimina campo"
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Box component="label" sx={labelSx}>
              Identificativo (key)
            </Box>
            <Box
              component="input"
              type="text"
              value={field.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({ ...field, name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })
              }
              sx={{ ...inputSx, fontFamily: 'monospace' }}
              placeholder="es. nomeGatto"
            />
          </Box>
          <Box>
            <Box component="label" sx={labelSx}>
              Etichetta Visibile
            </Box>
            <Box
              component="input"
              type="text"
              value={field.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({ ...field, label: e.target.value })
              }
              sx={inputSx}
              placeholder="es. Nome del Gatto"
            />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Box component="label" sx={labelSx}>
              Tipologia di Campo
            </Box>
            <FormSelect
              value={field.type}
              onChange={(v) => onChange({ ...field, type: v as FieldDef['type'] })}
              options={FIELD_TYPES.map(t => ({ value: t, label: t.toUpperCase() }))}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  borderRadius: 2,
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', pt: 3 }}>
            <CheckboxInput
              label="Campo Obbligatorio"
              checked={field.required || false}
              onChange={(checked) => onChange({ ...field, required: checked })}
              sx={{ color: theme.palette.divider, '&.Mui-checked': { color: theme.palette.primary.main } }}
            />
          </Box>
        </Box>

        {field.type === 'select' && (
          <Box sx={{ mt: 0.5 }}>
            <Box component="label" sx={labelSx}>
              Opzioni a tendina (una per riga)
            </Box>
            <Box
              component="textarea"
              value={(field.options || []).join('\n')}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onChange({
                  ...field,
                  options: e.target.value.split('\n').filter(Boolean),
                })
              }
              rows={3}
              sx={inputSx}
              placeholder={'Opzione 1\nOpzione 2\nAltro...'}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
