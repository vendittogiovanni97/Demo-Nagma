'use client';

import { Box, IconButton, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Loader2, Search, X } from 'lucide-react';
import FormInput from '@/common/components/forms/FormInput';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  sx?: object;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Cerca...',
  className,
  disabled,
  isLoading = false,
  sx,
}: SearchInputProps) {
  const theme = useTheme();

  return (
    <FormInput
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      size="sm"
      icon={isLoading ? undefined : Search}
      className={className}
      hideLabel
      endAdornment={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isLoading && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
                color: theme.palette.primary.main,
                mr: 0.5,
              }}
            >
              <Loader2 size={15} />
            </Box>
          )}
          {value && !disabled && (
            <IconButton
              size="small"
              onClick={() => onChange('')}
              sx={{
                p: 0.5,
                color: theme.palette.text.secondary,
                transition: 'all 0.15s ease',
                '&:hover': {
                  color: theme.palette.error.main,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <X size={14} />
            </IconButton>
          )}
        </Box>
      }
      sx={{
        '& input::-webkit-search-decoration, & input::-webkit-search-cancel-button': {
          display: 'none',
        },
        ...sx,
      }}
    />
  );
}
