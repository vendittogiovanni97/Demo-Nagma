"use client";

import { MenuItem, TextField, useTheme } from '@mui/material';
import { inputRootSx } from '@/theme/inputStyles';
import type { LucideIcon } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  required?: boolean;
  icon?: LucideIcon;
  placeholder?: string;
  disabled?: boolean;
}

export default function FormSelect({
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
  disabled,
}: FormSelectProps) {
  const theme = useTheme();

  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      fullWidth
      slotProps={{
        inputLabel: { shrink: true },
      }}
      sx={{
        '& .MuiOutlinedInput-root': inputRootSx(theme),
        '& .MuiSelect-icon': { color: theme.palette.text.secondary },
      }}
    >
      {placeholder && (
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>
      )}
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.875rem' }}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
