'use client';
import { Checkbox as MuiCheckbox, FormControlLabel, useTheme, type SxProps, type Theme } from '@mui/material';

interface CheckboxInputProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

export default function CheckboxInput({ label, checked, onChange, disabled, sx }: CheckboxInputProps) {
  const theme = useTheme();

  return (
    <FormControlLabel
      control={
        <MuiCheckbox
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          sx={sx}
        />
      }
      label={label || ''}
      sx={{
        userSelect: 'none',
        '& .MuiTypography-root': {
          fontSize: '0.875rem',
          fontWeight: checked ? 600 : 500,
          color: checked ? theme.palette.text.primary : theme.palette.text.secondary,
          transition: 'color 0.2s ease',
        },
      }}
    />
  );
}
