"use client";

import { inputRootSx } from '@/common/theme/inputStyles';
import { alpha } from '@mui/material/styles';
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
          paper: { sx: (t: Theme) => styles.paper(t) }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            required={required && !value}
            error={!!error}
            size={size}
            sx={(t: Theme) => styles.input(t)}
          />
        )}
        sx={{ width: '100%' }}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <Box key={key} component="li" {...optionProps} sx={(t: Theme) => styles.option(t)}>
              {option.label}
            </Box>
          );
        }}
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
  paper: (theme: Theme) => {
    const isLight = theme.palette.mode === 'light';
    return {
      mt: 1,
      bgcolor: isLight ? 'rgba(255, 255, 255, 0.98)' : alpha(theme.palette.background.default, 0.95),
      backdropFilter: 'blur(12px)',
      border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : alpha(theme.palette.primary.main, 0.2)}`,
      boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.1)' : `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
      borderRadius: '12px',
      '& .MuiAutocomplete-listbox': { padding: '8px' },
    };
  },
  input: (theme: Theme) => {
    const isLight = theme.palette.mode === 'light';
    return {
      '& .MuiOutlinedInput-root': {
        ...inputRootSx(theme),
        backgroundColor: isLight ? 'rgba(0, 0, 0, 0.03)' : alpha(theme.palette.common.white, 0.05),
        borderRadius: '12px',
        fontSize: '0.9375rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '0 12px !important',
        minHeight: '44px',
        '&:hover': {
          backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : alpha(theme.palette.common.white, 0.08),
        },
        '&.Mui-focused': {
          backgroundColor: isLight ? 'rgba(0, 0, 0, 0.06)' : alpha(theme.palette.common.white, 0.1),
          borderColor: 'primary.main',
        },
      },
      '& .MuiAutocomplete-input': { padding: '8px 4px !important' },
      '& .MuiAutocomplete-endAdornment': { top: '50%', transform: 'translateY(-50%)', right: '8px' },
      '& .MuiAutocomplete-popupIndicator': { color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } },
      '& .MuiAutocomplete-clearIndicator': {
        color: 'text.secondary',
        '&:hover': { bgcolor: isLight ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.common.white, 0.05) },
      },
      '& .Mui-error fieldset': { borderColor: 'error.main' },
    };
  },
  option: (theme: Theme) => ({
    borderRadius: '8px', mb: 0.5, fontSize: '0.875rem', fontWeight: 500, color: 'text.primary',
    '&:last-child': { mb: 0 }, transition: 'all 0.2s ease',
    '&.Mui-focused, &:hover': { bgcolor: `${alpha(theme.palette.primary.main, 0.12)} !important`, color: 'primary.main' },
    '&[aria-selected="true"]': { bgcolor: `${alpha(theme.palette.primary.main, 0.2)} !important`, color: 'primary.main', fontWeight: 700 }
  }),
  errorText: {
    color: 'error.main', fontSize: '0.75rem', px: 0.5
  } as SxProps<Theme>,
};
