"use client";

import { memo } from 'react';
import { alpha } from '@mui/material/styles';
import { MenuItem, TextField, useTheme, Box, Typography, SxProps, Theme } from '@mui/material';
import { inputRootSx } from '@/common/theme/inputStyles';
import type { LucideIcon } from 'lucide-react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  required?: boolean;
  icon?: LucideIcon;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  hideLabel?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

function FormSelect({
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
}: FormSelectProps) {
  const theme = useTheme();
  const stringValue = String(value ?? '');
  const optionValues = options.map((o) => String(o.value));
  const displayValue = optionValues.includes(stringValue) ? stringValue : '';

  return (
    <Box
      sx={[
        { display: 'flex', flexDirection: 'column', gap: 1 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ].filter(Boolean) as SxProps<Theme>}
    >
      {label && !hideLabel && (
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
      )}
      <TextField
        select
        size={size}
        label={hideLabel ? label : undefined}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        error={!!error}
        fullWidth
        slotProps={{
          select: {
            displayEmpty: true,
            MenuProps: {
              slotProps: {
                paper: {
                  sx: {
                    mt: 1,
                    maxHeight: 280,
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: theme.palette.mode === 'light'
                      ? alpha(theme.palette.background.paper, 0.98)
                      : alpha(theme.palette.background.paper, 0.88),
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                    boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.4)}, 0 0 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                    '& .MuiList-root': {
                      p: 0.5,
                      maxHeight: 270,
                      overflowY: 'auto',
                      '&::-webkit-scrollbar-track': {
                        marginTop: '8px',
                        marginBottom: '8px',
                      },
                    },
                    '& .MuiMenuItem-root': {
                      borderRadius: 1.5,
                      mx: 0.5,
                      my: 0.25,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        color: theme.palette.primary.main,
                      },
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.25),
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          input: {
            placeholder: placeholder,
          },
          inputLabel: { shrink: true },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            ...inputRootSx(theme),
            backgroundColor: theme.palette.mode === 'light'
              ? alpha(theme.palette.common.black, 0.03)
              : alpha(theme.palette.common.white, 0.05),
            borderRadius: 1.5,
            fontSize: '0.9375rem',
          },
          '& .MuiSelect-select.MuiSelect-select': {
            color: displayValue === '' ? theme.palette.text.secondary : 'inherit',
          },
          '& .MuiSelect-icon': { color: theme.palette.text.secondary },
          '& .Mui-error fieldset': { borderColor: theme.palette.error.main },
        }}
      >
        {placeholder && (
          <MenuItem value="" disabled sx={{ opacity: 0.6, fontSize: '0.875rem' }}>
            {placeholder}
          </MenuItem>
        )}
        {options.map((opt) => (
          <MenuItem key={opt.value} value={String(opt.value)} sx={{ fontSize: '0.875rem' }}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
      {error && (
        <Typography sx={{ color: theme.palette.error.main, fontSize: '0.75rem', px: 0.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default memo(FormSelect);
