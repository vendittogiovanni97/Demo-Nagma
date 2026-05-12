"use client";

import { Box, TextField, useTheme, Typography } from '@mui/material';
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
  error?: string;
  id?: string;
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
  error,
  id,
}: FormTextareaProps) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box
        component="label"
        sx={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: theme.palette.primary.main,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          px: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {Icon && <Icon size={14} />}
        {label}
      </Box>
      <TextField
        id={id}
        multiline
        rows={rows}
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={!!error}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            ...inputRootSx(theme),
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 1.5,
            fontSize: '0.9375rem',
          },
          '& .MuiOutlinedInput-input': {
            color: theme.palette.text.primary,
            resize: 'none',
          },
          '& .Mui-error fieldset': { borderColor: theme.palette.error.main },
        }}
      />
      {error && (
        <Typography sx={{ color: theme.palette.error.main, fontSize: '0.75rem', px: 0.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
