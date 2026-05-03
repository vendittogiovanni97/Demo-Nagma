"use client";

import { inputRootSx } from '@/theme/inputStyles';
import { Autocomplete, Box, SxProps, TextField, Theme, Typography, useTheme } from '@mui/material';
import type { LucideIcon } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface FormAutocompleteProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: readonly Option[];
  required?: boolean;
  icon?: LucideIcon;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  hideLabel?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  loading?: boolean;
}

export default function FormAutocomplete({
  label,
  value,
  onChange,
  options,
  required,
  icon: Icon,
  placeholder,
  disabled,
  error,
  hideLabel = false,
  size = 'small',
  sx,
  loading = false,
}: FormAutocompleteProps) {
  const theme = useTheme();
  const selectedOption = options.find(opt => String(opt.value) === String(value)) || null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ...sx }}>
      {label && !hideLabel && (
        <Box component="label" sx={styles.label}>
          {Icon && <Icon size={14} />}
          {label}
        </Box>
      )}
      <Autocomplete<Option, false, false, false>
        value={selectedOption}
        onChange={(_, newValue) => onChange(newValue ? String(newValue.value) : '')}
        options={options}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, val) => String(option.value) === String(val.value)}
        disabled={disabled}
        loading={loading}
        slotProps={{
          paper: { sx: styles.paper }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            required={required && !value}
            error={!!error}
            size={size}
            sx={styles.input(theme)}
          />
        )}
        sx={{ width: '100%' }}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={styles.option}>
            {option.label}
          </Box>
        )}
      />
      {error && (
        <Typography sx={styles.errorText}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

const styles = {
  label: {
    fontSize: '0.75rem', fontWeight: 600, color: 'primary.main',
    textTransform: 'uppercase', letterSpacing: '0.08em', px: 0.5,
    display: 'flex', alignItems: 'center', gap: 1
  } as SxProps<Theme>,
  paper: {
    mt: 1, bgcolor: 'rgba(10, 26, 38, 0.95)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 191, 255, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    borderRadius: '12px', '& .MuiAutocomplete-listbox': { padding: '8px' }
  } as SxProps<Theme>,
  input: (theme: Theme) => ({
    '& .MuiOutlinedInput-root': {
      ...inputRootSx(theme),
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px', fontSize: '0.9375rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: '0 12px !important', minHeight: '44px',
      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
      '&.Mui-focused': { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'primary.main' }
    },
    '& .MuiAutocomplete-input': { padding: '8px 4px !important' },
    '& .MuiAutocomplete-endAdornment': { top: '50%', transform: 'translateY(-50%)', right: '8px' },
    '& .MuiAutocomplete-popupIndicator': { color: 'primary.main', '&:hover': { bgcolor: 'rgba(0, 191, 255, 0.1)' } },
    '& .MuiAutocomplete-clearIndicator': { color: 'text.secondary', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } },
    '& .Mui-error fieldset': { borderColor: 'error.main' },
  }),
  option: {
    borderRadius: '8px', mb: 0.5, fontSize: '0.875rem', fontWeight: 500, color: 'text.primary',
    '&:last-child': { mb: 0 }, transition: 'all 0.2s ease',
    '&.Mui-focused, &:hover': { bgcolor: 'rgba(0, 191, 255, 0.12) !important', color: 'primary.main' },
    '&[aria-selected="true"]': { bgcolor: 'rgba(0, 191, 255, 0.2) !important', color: 'primary.main', fontWeight: 700 }
  } as SxProps<Theme>,
  errorText: {
    color: 'error.main', fontSize: '0.75rem', px: 0.5
  } as SxProps<Theme>,
};
