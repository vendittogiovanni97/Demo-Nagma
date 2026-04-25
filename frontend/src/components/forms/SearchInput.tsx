'use client';

import { InputAdornment, TextField, useTheme } from '@mui/material';
import { inputRootSx } from '@/theme/inputStyles';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * SearchInput - Input specializzato per ricerche
 *
 * Wrapper minimalista per search input con icona Search.
 *
 * NOTE: Input già supporta label opzionale, ma SearchInput usa
 * posizionamento assoluto dell'icona e aria-label senza label visibile —
 * struttura incompatibile con l'API icon di Input.
 * TODO: unify with Input
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Cerca...',
  className,
  disabled,
}: SearchInputProps) {
  const theme = useTheme();

  return (
    <TextField
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      size="small"
      aria-label="Search"
      className={className}
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search size={16} style={{ color: theme.palette.text.secondary }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          ...inputRootSx(theme),
          borderRadius: '10px',
          fontSize: '0.8125rem',
          minHeight: 40,
        },
        '& .MuiInputBase-input': { py: 1.125 },
      }}
    />
  );
}
