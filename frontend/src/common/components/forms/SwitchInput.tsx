'use client';
import { Switch as MuiSwitch, FormControlLabel } from '@mui/material';

interface SwitchInputProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function SwitchInput({ label, checked, onChange, disabled }: SwitchInputProps) {
  if (label) {
    return (
      <FormControlLabel
        control={<MuiSwitch checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} color="primary" />}
        label={label}
      />
    );
  }
  return <MuiSwitch checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} color="primary" />;
}
