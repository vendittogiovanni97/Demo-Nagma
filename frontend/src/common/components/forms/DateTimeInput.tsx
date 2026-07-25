'use client';

import React, { memo, useCallback } from 'react';
import Box from '@mui/material/Box';
import DateInput from './DateInput';
import TimeInput from './TimeInput';

export interface DateTimeInputProps {
  label?: string;
  dateValue: string; // YYYY-MM-DD
  timeValue: string; // HH:mm
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  dateLabel?: string;
  timeLabel?: string;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  quickButtons?: boolean;
  className?: string;
}

function DateTimeInput({
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateLabel = 'Data',
  timeLabel = 'Ora',
  minDate,
  maxDate,
  required = false,
  disabled = false,
  error,
  size = 'md',
  quickButtons = false,
  className,
}: DateTimeInputProps) {
  return (
    <Box className={className} sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
      {label && (
        <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
          {label} {required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <DateInput
          label={dateLabel}
          value={dateValue}
          onChange={onDateChange}
          minDate={minDate}
          maxDate={maxDate}
          required={required}
          disabled={disabled}
          error={error}
          size={size}
          quickButtons={quickButtons}
        />
        <TimeInput
          label={timeLabel}
          value={timeValue}
          onChange={onTimeChange}
          required={required}
          disabled={disabled}
          error={error}
          size={size}
        />
      </Box>
    </Box>
  );
}

export default memo(DateTimeInput);
