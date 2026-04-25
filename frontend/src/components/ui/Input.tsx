'use client';

import { InputAdornment, TextField, useTheme } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import { inputRootSx } from '@/theme/inputStyles';

type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'search' | 'tel' | 'url';

interface InputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: InputType;
  icon?: LucideIcon;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'danger' | 'success';
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  className?: string;
  pattern?: string;
}

export default function Input({
  label,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  error,
  size = 'md',
  variant = 'default',
  required,
  disabled,
  placeholder,
  min,
  max,
  step,
  className,
  pattern,
  ...props
}: InputProps) {
  const theme = useTheme();

  const muiSize = size === 'lg' ? 'medium' : 'small';

  return (
    <TextField
      size={muiSize}
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      error={!!error}
      className={className}
      fullWidth
      slotProps={{
        input: {
          startAdornment: Icon ? (
            <InputAdornment position="start">
              <Icon size={16} style={{ color: theme.palette.text.secondary }} />
            </InputAdornment>
          ) : undefined,
          inputProps: { min, max, step, pattern },
        },
        inputLabel: { shrink: true },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          ...inputRootSx(theme),
          '&.Mui-error fieldset': { borderColor: theme.palette.error.main },
        },
      }}
      {...props}
    />
  );
}
