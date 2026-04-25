"use client";

import { Box, TextField, useTheme } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import { inputRootSx } from '@/theme/inputStyles';

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  rows?: number;
  disabled?: boolean;
}

export default function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  required,
  icon: Icon,
  rows = 3,
  disabled,
}: FormTextareaProps) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box
        component="label"
        sx={{
          fontSize: '0.875rem',
          color: theme.palette.text.secondary,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 0.5
        }}
      >
        {Icon && <Icon size={14} />}
        {label}
      </Box>
      <TextField
        multiline
        rows={rows}
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            ...inputRootSx(theme),
            borderRadius: '12px',
          },
          '& .MuiOutlinedInput-input': {
            color: theme.palette.text.primary,
            resize: 'none',
          },
        }}
      />
    </Box>
  );
}
