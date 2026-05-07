'use client';

import { InputAdornment, TextField, useTheme, IconButton, Box, SxProps, Theme } from '@mui/material';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode, type MouseEvent } from 'react';
import { inputRootSx } from '@/theme/inputStyles';

type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'search' | 'tel' | 'url' | 'month';

interface InputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: InputType;
  icon?: LucideIcon;
  endAdornment?: ReactNode;
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
  autoComplete?: string;
  hideLabel?: boolean;
  sx?: SxProps<Theme>;
}

export default function Input({
  label,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  endAdornment,
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
  autoComplete,
  hideLabel = false,
  sx,
  ...props
}: InputProps) {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const muiSize = size === 'lg' ? 'medium' : 'small';
  const isPassword = type === 'password';
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const renderEndAdornment = () => {
    if (endAdornment) return endAdornment;
    
    if (isPassword) {
      return (
        <InputAdornment position="end">
          <IconButton
            onClick={() => setShowPassword(!showPassword)}
            edge="end"
            size="small"
            sx={{ color: theme.palette.text.secondary }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </IconButton>
        </InputAdornment>
      );
    }
    
    return undefined;
  };

  const fieldLabelSx = {
    px: 0.5,
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.primary.main,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1
  } as const;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', ...sx }}>
      {label && !hideLabel && (
        <Box component="label" sx={fieldLabelSx}>
          {Icon && <Icon size={14} />}
          {label}
        </Box>
      )}
      <TextField
        size={muiSize}
        label={hideLabel ? label : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={actualType}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        error={!!error}
        className={className}
        autoComplete={autoComplete}
        fullWidth
        slotProps={{
          input: {
            startAdornment: Icon ? (
              <InputAdornment position="start">
                <Icon size={16} style={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ) : undefined,
            endAdornment: renderEndAdornment(),
            inputProps: {
              min,
              max,
              step,
              pattern,
              style: {
                cursor: (type === 'date' || type === 'time') ? 'pointer' : 'inherit',
              },
              onClick: (e: MouseEvent<HTMLInputElement>) => {
                if (type === 'date' || type === 'time') {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {
                    console.warn('showPicker not supported:', err);
                  }
                }
              },
              onDoubleClick: (e: MouseEvent<HTMLInputElement>) => {
                if (type === 'date' || type === 'time') {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {
                    console.warn('showPicker not supported:', err);
                  }
                }
              },
            },
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
    </Box>
  );
}
