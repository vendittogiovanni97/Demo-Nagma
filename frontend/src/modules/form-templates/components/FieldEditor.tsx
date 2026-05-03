"use client";

import Button from '@/components/ui/Button';
import type { FieldDef } from '@/modules/form-templates/model/form-template.types';
import { Checkbox, FormControlLabel, MenuItem, Select, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Trash2 } from 'lucide-react';

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
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 2.5,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'rgba(0,191,255,0.3)',
          backgroundColor: 'rgba(255,255,255,0.1)',
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
          icon={<Trash2 size={16} />}
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
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
                '& .MuiSelect-icon': { color: theme.palette.text.secondary },
              }}
            >
              {FIELD_TYPES.map((t) => (
                <MenuItem key={t} value={t} sx={{ fontSize: '0.875rem' }}>
                  {t.toUpperCase()}
                </MenuItem>
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
              label={
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>
                  Campo Obbligatorio
                </Typography>
              }
              sx={{ userSelect: 'none', cursor: 'pointer', m: 0 }}
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
