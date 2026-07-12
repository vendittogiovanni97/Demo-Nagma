'use client';
import { Checkbox as MuiCheckbox, FormControlLabel, type SxProps, type Theme } from '@mui/material';

interface CheckboxInputProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

export default function CheckboxInput({ label, checked, onChange, disabled, sx }: CheckboxInputProps) {
  return (
    <FormControlLabel
      control={
        <MuiCheckbox
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' }, ...sx }}
        />
      }
      label={label || ''}
      sx={{ '& .MuiTypography-root': { fontSize: '0.85rem' } }}
    />
  );
}
