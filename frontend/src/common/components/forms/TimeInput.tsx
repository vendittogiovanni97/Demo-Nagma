'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Clock, X } from 'lucide-react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import Input from '@/common/components/ui/Input';

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

function toNormalizedTime(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const hhmm = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.exec(trimmed);
  if (hhmm) {
    const hh = hhmm[1].padStart(2, '0');
    const mm = hhmm[2];
    return `${hh}:${mm}`;
  }
  if (/^\d{3,4}$/.test(trimmed)) {
    const padded = trimmed.padStart(4, '0');
    const hh = padded.slice(0, 2);
    const mm = padded.slice(2, 4);
    const hNum = parseInt(hh, 10);
    const mNum = parseInt(mm, 10);
    if (hNum >= 0 && hNum <= 23 && mNum >= 0 && mNum <= 59) {
      return `${hh}:${mm}`;
    }
  }
  return trimmed;
}

function TimeInput({
  label,
  value,
  onChange,
  step = 900,
  placeholder = 'HH:mm',
  required = false,
  disabled = false,
  error,
  size = 'md',
  clearable = true,
  className,
}: TimeInputProps) {
  const theme = useTheme();
  const hiddenPickerRef = useRef<HTMLInputElement | null>(null);
  const [textValue, setTextValue] = useState(value);

  useEffect(() => {
    setTextValue(value);
  }, [value]);

  const handleTextChange = (raw: string) => {
    setTextValue(raw);
    const norm = toNormalizedTime(raw);
    if (/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(norm)) {
      onChange(norm);
    } else if (raw === '') {
      onChange('');
    }
  };

  const handleBlur = () => {
    const norm = toNormalizedTime(textValue);
    if (/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(norm)) {
      onChange(norm);
      setTextValue(norm);
    } else if (textValue === '') {
      onChange('');
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (newTime) {
      onChange(newTime);
      setTextValue(newTime);
    }
  };

  const handleOpenPicker = useCallback(() => {
    if (disabled) return;
    try {
      if (hiddenPickerRef.current && typeof hiddenPickerRef.current.showPicker === 'function') {
        hiddenPickerRef.current.showPicker();
      } else {
        hiddenPickerRef.current?.click();
      }
    } catch {
      hiddenPickerRef.current?.click();
    }
  }, [disabled]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setTextValue('');
    },
    [onChange]
  );

  return (
    <Box className={className} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', position: 'relative' }}>
      <Input
        label={label}
        type="text"
        value={textValue}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={error}
        size={size}
        inputMode="numeric"
        icon={Clock}
        onIconClick={handleOpenPicker}
        endAdornment={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {clearable && textValue && !disabled && (
              <IconButton
                size="small"
                onClick={handleClear}
                sx={{
                  p: 0.5,
                  color: 'text.secondary',
                  '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) },
                }}
              >
                <X size={14} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={handleOpenPicker}
              disabled={disabled}
              sx={{
                p: 0.75,
                borderRadius: '8px',
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.16),
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Clock size={16} />
            </IconButton>
          </Box>
        }
      />

      <input
        ref={hiddenPickerRef}
        type="time"
        step={step}
        value={value || ''}
        onChange={handlePickerChange}
        disabled={disabled}
        tabIndex={-1}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0,
          bottom: 0,
        }}
      />
    </Box>
  );
}

export default memo(TimeInput);
