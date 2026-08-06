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
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useMemo, useState, type MouseEvent } from 'react';
import FormInput from './FormInput';

export interface DatePickerProps {
  label?: string;
  value: string; // Formato YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  hideLabel?: boolean;
  shortcuts?: boolean;
  minDate?: string;
  maxDate?: string;
  sx?: any;
}

const DAYS_HEADER = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

export default function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'GG/MM/AAAA',
  required,
  disabled,
  error,
  size = 'md',
  hideLabel = false,
  shortcuts = true,
  minDate,
  maxDate,
  sx,
}: DatePickerProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Data correntemente selezionata
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const d = parseISO(value);
    return isValid(d) ? d : null;
  }, [value]);

  // Mese correntemente visualizzato nel calendario
  const [viewDate, setViewDate] = useState<Date>(() => parsedDate || new Date());

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (parsedDate) setViewDate(parsedDate);
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);
  const isOpen = Boolean(anchorEl);

  // Formattazione data visualizzata nel campo di testo (es. 06/08/2026)
  const displayValue = useMemo(() => {
    if (!parsedDate) return '';
    return format(parsedDate, 'dd/MM/yyyy');
  }, [parsedDate]);

  // Generazione griglia dei giorni del mese
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [viewDate]);

  const handleSelectDay = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    onChange(formatted);
    handleClose();
  };

  const handleSelectShortcut = (daysToAdd: number) => {
    const target = addDays(new Date(), daysToAdd);
    const formatted = format(target, 'yyyy-MM-dd');
    onChange(formatted);
    setViewDate(target);
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
          value={displayValue}
          onChange={() => {}} // Campo readonly per l'utente, gestito dal picker
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          error={error}
          size={size}
          hideLabel={hideLabel}
          icon={Calendar}
          endAdornment={
            value && !disabled ? (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onChange('');
                }}
                sx={{
                  p: 0.5,
                  zIndex: 10,
                  position: 'relative',
                  color: theme.palette.text.secondary,
                  '&:hover': { color: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.1) },
                }}
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
            right: value && !disabled ? 36 : 0,
            bottom: 0,
            zIndex: 1,
            opacity: 0,
            cursor: 'pointer',
          }}
        />
      </Box>

      {/* Calendario Popover in Glassmorphism */}
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
              width: 310,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.88),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.4)}, 0 0 20px ${alpha(theme.palette.primary.main, 0.15)}`,
            },
          },
        }}
      >
        {/* Shortcuts (Oggi, Domani) */}
        {shortcuts && (
          <Stack direction="row" useFlexGap sx={{ gap: 1, mb: 1.5, pb: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Chip
              label="Oggi"
              size="small"
              onClick={() => handleSelectShortcut(0)}
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                '&:hover': {
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                },
              }}
            />
            <Chip
              label="Domani"
              size="small"
              onClick={() => handleSelectShortcut(1)}
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                color: 'text.secondary',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: 'primary.main',
                },
              }}
            />
            {value && (
              <Chip
                label="Azzera"
                size="small"
                onClick={handleClear}
                sx={{
                  ml: 'auto',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: 'error.main',
                  '&:hover': { bgcolor: theme.palette.error.main, color: '#fff' },
                }}
              />
            )}
          </Stack>
        )}

        {/* Header Calendario: Mese / Anno + Prev/Next */}
        <Stack direction="row" useFlexGap sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              color: 'text.primary',
              textTransform: 'capitalize',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {format(viewDate, 'MMMM yyyy', { locale: it })}
          </Typography>

          <Stack direction="row" useFlexGap sx={{ gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setViewDate((prev) => subMonths(prev, 1))}
              sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <ChevronLeft size={18} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewDate((prev) => addMonths(prev, 1))}
              sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <ChevronRight size={18} />
            </IconButton>
          </Stack>
        </Stack>

        {/* Giorni della settimana header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            mb: 1,
          }}
        >
          {DAYS_HEADER.map((day, idx) => (
            <Typography
              key={idx}
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.6875rem',
                color: theme.palette.primary.main,
                opacity: 0.8,
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        {/* Griglia Giorni */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
          }}
        >
          {calendarDays.map((day) => {
            const isCurrentMonth = isSameMonth(day, viewDate);
            const isSelected = parsedDate ? isSameDay(day, parsedDate) : false;
            const isTodayDay = isToday(day);

            return (
              <Box
                key={day.toISOString()}
                onClick={() => handleSelectDay(day)}
                sx={{
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1.75,
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 800 : isTodayDay ? 700 : 500,
                  color: isSelected
                    ? '#ffffff'
                    : !isCurrentMonth
                    ? alpha(theme.palette.text.secondary, 0.3)
                    : isTodayDay
                    ? theme.palette.primary.main
                    : 'text.primary',
                  bgcolor: isSelected
                    ? theme.palette.primary.main
                    : isTodayDay
                    ? alpha(theme.palette.primary.main, 0.12)
                    : 'transparent',
                  border: isTodayDay && !isSelected ? `1px solid ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
                  boxShadow: isSelected ? `0 2px 10px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isSelected
                      ? theme.palette.primary.main
                      : alpha(theme.palette.primary.main, 0.15),
                    transform: 'scale(1.08)',
                  },
                }}
              >
                {format(day, 'd')}
              </Box>
            );
          })}
        </Box>
      </Popover>
    </Box>
  );
}
