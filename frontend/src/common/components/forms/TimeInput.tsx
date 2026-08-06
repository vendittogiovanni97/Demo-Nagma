'use client';

import React, { memo } from 'react';
import TimePicker from './TimePicker';

export interface TimeInputProps {
  label?: string;
  value: string; // Formato HH:mm
  onChange: (value: string) => void;
  step?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
  className?: string;
}

function TimeInput({
  label,
  value,
  onChange,
  placeholder = 'HH:mm',
  required = false,
  disabled = false,
  error,
  size = 'md',
  className,
}: TimeInputProps) {
  return (
    <div className={className} style={{ width: '100%' }}>
      <TimePicker
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={error}
        size={size}
      />
    </div>
  );
}

export default memo(TimeInput);
