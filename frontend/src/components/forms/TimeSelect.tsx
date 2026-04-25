"use client";

import { TextField, useTheme } from '@mui/material';
import { inputRootSx } from '@/theme/inputStyles';

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minuteStep?: number;
}

export default function TimeSelect({ label, value, onChange, required, minuteStep = 15 }: Props) {
  const theme = useTheme();

  return (
    <TextField
      size="small"
      label={label}
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      fullWidth
      slotProps={{
        inputLabel: { shrink: true },
        input: {
          inputProps: { step: minuteStep * 60 },
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          ...inputRootSx(theme),
          '& .MuiInputBase-input': { colorScheme: 'dark' },
        },
      }}
    />
  );
}
