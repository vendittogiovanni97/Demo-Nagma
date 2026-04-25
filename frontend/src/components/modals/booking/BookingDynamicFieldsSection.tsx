"use client";

import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import type { FieldDef } from '@/types/form-template';
import { Box, useTheme } from '@mui/material';
import { FileText } from 'lucide-react';

interface Props {
  fields: FieldDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export default function BookingDynamicFieldsSection({ fields, values, onChange }: Props) {
  const theme = useTheme();

  if (fields.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FileText size={14} style={{ color: theme.palette.primary.main }} />
        <Box
          component="span"
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}
        >
          Dettagli tattoo
        </Box>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
          gap: 1.5
        }}
      >
        {fields.map((field) => {
          const commonProps = {
            label: field.label,
            value: values[field.name] || '',
            onChange: (val: string) => onChange(field.name, val),
            placeholder: field.label,
            required: field.required,
          };

          if (field.type === 'select') {
            return (
              <FormSelect
                key={field.name}
                {...commonProps}
                options={(field.options || []).map((o) => ({ value: o, label: o }))}
              />
            );
          }

          return (
            <FormInput
              key={field.name}
              {...commonProps}
              type={field.type === 'number' ? 'number' : 'text'}
            />
          );
        })}
      </Box>
    </Box>
  );
}
