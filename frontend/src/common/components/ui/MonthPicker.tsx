"use client";

import {
  Stack,
  Typography,
  useTheme,
  SxProps,
  Theme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { addMonths, format, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '@/common/components/ui/Button';

interface MonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  size?: 'sm' | 'md';
  sx?: SxProps<Theme>;
}

export default function MonthPicker({ value, onChange, size = 'md', sx }: MonthPickerProps) {
  const theme = useTheme();
  const isSm = size === 'sm';
  const monthLabel = format(value, isSm ? 'MMM yyyy' : 'MMMM yyyy', { locale: it });

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{
        gap: isSm ? 0.25 : 0.5,
        alignItems: 'center',
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        borderRadius: 1,
        px: isSm ? 0.5 : 1,
        py: isSm ? 0.25 : 0.5,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.125)}`,
        ...sx,
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(subMonths(value, 1))}
        aria-label="Mese precedente"
        sx={{
          minWidth: 'auto',
          p: isSm ? 0.25 : 0.5,
          color: theme.palette.primary.main,
        }}
      >
        <ArrowLeft size={isSm ? 11 : 14} />
      </Button>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: theme.palette.primary.main,
          px: isSm ? 0.25 : 1.5,
          minWidth: isSm ? 62 : 112,
          textAlign: 'center',
          textTransform: 'capitalize',
          fontSize: isSm ? '0.6875rem' : '0.75rem',
          whiteSpace: 'nowrap',
        }}
      >
        {monthLabel}
      </Typography>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(addMonths(value, 1))}
        aria-label="Mese successivo"
        sx={{
          minWidth: 'auto',
          p: isSm ? 0.25 : 0.5,
          color: theme.palette.primary.main,
        }}
      >
        <ArrowRight size={isSm ? 11 : 14} />
      </Button>
    </Stack>
  );
}
