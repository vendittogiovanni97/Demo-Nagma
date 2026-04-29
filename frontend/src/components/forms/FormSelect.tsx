"use client";

import { MenuItem, TextField, useTheme } from '@mui/material';
import { inputRootSx } from '@/theme/inputStyles';
import type { LucideIcon } from 'lucide-react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: string | number;
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
  const stringValue = String(value ?? '');
  const optionValues = options.map((o) => String(o.value));
  const displayValue = optionValues.includes(stringValue) ? stringValue : '';

  return (
    <TextField
      select
      size="small"
      label={label}
      value={displayValue}
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
        <MenuItem key={opt.value} value={String(opt.value)} sx={{ fontSize: '0.875rem' }}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
