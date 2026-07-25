'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import Input from '@/common/components/ui/Input';

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

function toDisplayFormat(isoDate: string): string {
  if (!isoDate) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(isoDate)) return isoDate;
  const parts = isoDate.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
}

function toIsoFormat(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const dmy = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/.exec(trimmed);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const month = dmy[2].padStart(2, '0');
    const year = dmy[3];
    return `${year}-${month}-${day}`;
  }
  const ymd = /^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/.exec(trimmed);
  if (ymd) {
    const year = ymd[1];
    const month = ymd[2].padStart(2, '0');
    const day = ymd[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (/^\d{8}$/.test(trimmed)) {
    const day = trimmed.slice(0, 2);
    const month = trimmed.slice(2, 4);
    const year = trimmed.slice(4, 8);
    return `${year}-${month}-${day}`;
  }
  return trimmed;
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
  clearable = true,
  quickButtons = true,
  className,
}: DateInputProps) {
  const theme = useTheme();
  const hiddenPickerRef = useRef<HTMLInputElement | null>(null);
  const [textValue, setTextValue] = useState(() => toDisplayFormat(value));

  useEffect(() => {
    setTextValue(toDisplayFormat(value));
  }, [value]);

  const handleTextChange = (raw: string) => {
    setTextValue(raw);
    const iso = toIsoFormat(raw);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      onChange(iso);
    } else if (raw === '') {
      onChange('');
    }
  };

  const handleBlur = () => {
    const iso = toIsoFormat(textValue);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      onChange(iso);
      setTextValue(toDisplayFormat(iso));
    } else if (textValue === '') {
      onChange('');
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIso = e.target.value;
    if (newIso) {
      onChange(newIso);
      setTextValue(toDisplayFormat(newIso));
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

  const handleSetToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    onChange(today);
    setTextValue(toDisplayFormat(today));
  }, [onChange]);

  const handleSetTomorrow = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    onChange(tomorrowStr);
    setTextValue(toDisplayFormat(tomorrowStr));
  }, [onChange]);

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
        icon={Calendar}
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
              <Calendar size={16} />
            </IconButton>
          </Box>
        }
      />

      <input
        ref={hiddenPickerRef}
        type="date"
        value={value || ''}
        min={minDate}
        max={maxDate}
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

      {quickButtons && !disabled && (
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
          <Typography
            variant="caption"
            onClick={handleSetToday}
            sx={{
              cursor: 'pointer',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.725rem',
              px: 1,
              py: 0.25,
              borderRadius: '6px',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.18),
              },
            }}
          >
            Oggi
          </Typography>
          <Typography
            variant="caption"
            onClick={handleSetTomorrow}
            sx={{
              cursor: 'pointer',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.725rem',
              px: 1,
              py: 0.25,
              borderRadius: '6px',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.18),
              },
            }}
          >
            Domani
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default memo(DateInput);
