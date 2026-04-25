"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import {
  Box,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  useTheme,
} from '@mui/material';

type FieldDef = {
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  name: string;
  label: string;
  required?: boolean;
  options?: string[]; // Per le select
};

interface DynamicFormProps {
  base64Schema: string;
  onSubmit: (data: Record<string, string | number | boolean>) => void;
  submitLabel?: string;
}

export default function DynamicForm({ base64Schema, onSubmit, submitLabel = 'Salva Modulo' }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const theme = useTheme();

  let fields: FieldDef[] = [];
  try {
    const jsonStr = atob(base64Schema);
    fields = JSON.parse(jsonStr);
  } catch {
    return (
      <Box
        sx={{
          color: theme.palette.error.main,
          p: 2,
          border: `1px solid ${theme.palette.error.main}20`,
          borderRadius: 1,
          backgroundColor: `${theme.palette.error.main}08`,
        }}
      >
        Errore decodifica Base64 Schema Form
      </Box>
    );
  }

  const handleChange = (name: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        fontSize: '0.875rem',
        p: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      {fields.map((field, idx) => (
        <Stack key={`${field.name}-${idx}`} useFlexGap sx={{ gap: 1 }}>
          {field.type === 'text' && (
            <TextField
              label={field.label}
              type="text"
              required={field.required}
              onChange={e => handleChange(field.name, e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
            />
          )}

          {field.type === 'date' && (
            <TextField
              label={field.label}
              type="date"
              required={field.required}
              onChange={e => handleChange(field.name, e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}

          {field.type === 'select' && (
            <FormControl fullWidth size="small">
              <InputLabel>{field.label}</InputLabel>
              <Select
                label={field.label}
                required={field.required}
                onChange={e => handleChange(field.name, e.target.value)}
                defaultValue=""
              >
                <MenuItem value="">Seleziona...</MenuItem>
                {field.options?.map(o => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {field.type === 'number' && (
            <TextField
              label={field.label}
              type="number"
              required={field.required}
              onChange={e => handleChange(field.name, Number(e.target.value))}
              fullWidth
              size="small"
              variant="outlined"
            />
          )}

          {field.type === 'checkbox' && (
            <FormControlLabel
              control={
                <Checkbox
                  required={field.required}
                  onChange={e => handleChange(field.name, e.target.checked)}
                />
              }
              label="Confermo"
            />
          )}
        </Stack>
      ))}
      <Button type="submit" variant="primary" fullWidth>
        {submitLabel}
      </Button>
    </Box>
  );
}
