'use client';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import type { LucideIcon } from 'lucide-react';
import { inputRootSx } from '@/common/theme/inputStyles';

interface TextareaInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  name?: string;
  id?: string;
  icon?: LucideIcon;
  sx?: SxProps<Theme>;
}

export default function TextareaInput({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
  disabled,
  error,
  helperText,
  name,
  id,
  icon: LabelIcon,
  sx,
}: TextareaInputProps) {
  const theme = useTheme();

  return (
    <Box
      sx={[
        { display: 'flex', flexDirection: 'column', gap: 1 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ].filter(Boolean) as SxProps<Theme>}
    >
      {label ? (
        <Box
          component="label"
          sx={{
            px: 0.5,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'primary.main',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {LabelIcon ? <LabelIcon size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} /> : null}
          {label}
        </Box>
      ) : null}
      <TextField
        multiline
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={Boolean(error)}
        name={name}
        id={id}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            ...inputRootSx(theme),
            alignItems: 'flex-start',
          },
          '& textarea': { lineHeight: 1.55, resize: 'vertical' },
        }}
      />
      {error || helperText ? (
        <Typography
          sx={{
            px: 0.5,
            fontSize: '0.75rem',
            color: error ? 'error.main' : 'text.secondary',
          }}
        >
          {error ?? helperText}
        </Typography>
      ) : null}
    </Box>
  );
}
