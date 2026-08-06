"use client";

import {
  Box,
  Button as MuiButton,
  Chip,
  IconButton,
  Popover,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Clock, X } from 'lucide-react';
import { useMemo, useState, type MouseEvent } from 'react';
import FormInput from './FormInput';

export interface TimePickerProps {
  label?: string;
  value: string; // Formato HH:mm
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  hideLabel?: boolean;
  presets?: boolean;
  sx?: any;
}

const HOURS = Array.from({ length: 15 }, (_, i) => (i + 8).toString().padStart(2, '0')); // 08:00 - 22:00
const MINUTES = ['00', '15', '30', '45'];
const QUICK_PRESETS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export default function TimePicker({
  label,
  value,
  onChange,
  placeholder = 'HH:mm',
  required,
  disabled,
  error,
  size = 'md',
  hideLabel = false,
  presets = true,
  sx,
}: TimePickerProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [selectedHour, selectedMinute] = useMemo(() => {
    if (!value || !value.includes(':')) return ['09', '00'];
    const [h, m] = value.split(':');
    return [h.padStart(2, '0'), m.padStart(2, '0')];
  }, [value]);

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);
  const isOpen = Boolean(anchorEl);

  const handleSelectHour = (h: string) => {
    const newTime = `${h}:${selectedMinute}`;
    onChange(newTime);
  };

  const handleSelectMinute = (m: string) => {
    const newTime = `${selectedHour}:${m}`;
    onChange(newTime);
    handleClose();
  };

  const handleSelectPreset = (preset: string) => {
    onChange(preset);
    handleClose();
  };

  const handleClear = () => {
    onChange('');
    handleClose();
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box sx={{ position: 'relative' }}>
        <FormInput
          label={label}
          value={value}
          onChange={() => {}}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          error={error}
          size={size}
          hideLabel={hideLabel}
          icon={Clock}
          endAdornment={
            value && !disabled ? (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                sx={{ p: 0.5, color: theme.palette.text.secondary }}
              >
                <X size={14} />
              </IconButton>
            ) : undefined
          }
          sx={{
            '& input': { cursor: disabled ? 'default' : 'pointer' },
          }}
        />

        {/* Overlay trasparente cliccabile per aprire il popover */}
        <MuiButton
          disableRipple
          onClick={handleOpen}
          disabled={disabled}
          sx={{
            position: 'absolute',
            top: label && !hideLabel ? 28 : 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            opacity: 0,
            cursor: 'pointer',
          }}
        />
      </Box>

      {/* Popover Selettore Ora in Glassmorphism */}
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              width: 300,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.88),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.4)}, 0 0 20px ${alpha(theme.palette.primary.main, 0.15)}`,
            },
          },
        }}
      >
        {/* Presets rapidi */}
        {presets && (
          <Box sx={{ mb: 1.5, pb: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
              Orari Rapidi
            </Typography>
            <Stack direction="row" useFlexGap sx={{ gap: 0.75, flexWrap: 'wrap' }}>
              {QUICK_PRESETS.map((preset) => (
                <Chip
                  key={preset}
                  label={preset}
                  size="small"
                  onClick={() => handleSelectPreset(preset)}
                  sx={{
                    fontWeight: value === preset ? 800 : 600,
                    fontSize: '0.7rem',
                    bgcolor: value === preset ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.08),
                    color: value === preset ? '#fff' : 'text.primary',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    '&:hover': {
                      bgcolor: theme.palette.primary.main,
                      color: '#fff',
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Sezione Selettore Ore e Minuti affiancati */}
        <Stack direction="row" useFlexGap sx={{ gap: 2 }}>
          {/* Colonna Ore */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.6875rem',
                color: theme.palette.primary.main,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                mb: 1,
                display: 'block',
                textAlign: 'center',
              }}
            >
              Ora
            </Typography>

            <Box
              sx={{
                maxHeight: 180,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                pr: 0.5,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': {
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              {HOURS.map((h) => {
                const isSelected = selectedHour === h;
                return (
                  <Box
                    key={h}
                    onClick={() => handleSelectHour(h)}
                    sx={{
                      py: 0.75,
                      px: 1.5,
                      borderRadius: 1.5,
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 800 : 500,
                      color: isSelected ? '#ffffff' : 'text.primary',
                      bgcolor: isSelected ? theme.palette.primary.main : 'transparent',
                      boxShadow: isSelected ? `0 2px 10px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.15),
                      },
                    }}
                  >
                    {h}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Separatore */}
          <Box sx={{ width: '1px', bgcolor: alpha(theme.palette.divider, 0.1), alignSelf: 'stretch' }} />

          {/* Colonna Minuti */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.6875rem',
                color: theme.palette.primary.main,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                mb: 1,
                display: 'block',
                textAlign: 'center',
              }}
            >
              Minuti
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              {MINUTES.map((m) => {
                const isSelected = selectedMinute === m;
                return (
                  <Box
                    key={m}
                    onClick={() => handleSelectMinute(m)}
                    sx={{
                      py: 0.75,
                      px: 1.5,
                      borderRadius: 1.5,
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 800 : 500,
                      color: isSelected ? '#ffffff' : 'text.primary',
                      bgcolor: isSelected ? theme.palette.primary.main : 'transparent',
                      boxShadow: isSelected ? `0 2px 10px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.15),
                      },
                    }}
                  >
                    {m}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Stack>
      </Popover>
    </Box>
  );
}
