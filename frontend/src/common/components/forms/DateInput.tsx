'use client';

import React, { memo } from 'react';
import DatePicker from './DatePicker';

export interface DateInputProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
  quickButtons?: boolean;
  className?: string;
}

function DateInput({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'GG/MM/AAAA',
  required = false,
  disabled = false,
  error,
  size = 'md',
  quickButtons = true,
  className,
}: DateInputProps) {
  return (
    <div className={className} style={{ width: '100%' }}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={error}
        size={size}
        shortcuts={quickButtons}
      />
    </div>
  );
}

export default memo(DateInput);
