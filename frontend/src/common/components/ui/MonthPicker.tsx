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
  sx?: SxProps<Theme>;
}

export default function MonthPicker({ value, onChange, sx }: MonthPickerProps) {
  const theme = useTheme();
  const monthLabel = format(value, 'MMMM yyyy', { locale: it });

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{ gap: 0.5, alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 1, px: 1, py: 0.5, border: `1px solid ${alpha(theme.palette.primary.main, 0.125)}`, ...sx }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(subMonths(value, 1))}
        aria-label="Mese precedente"
        sx={{
          minWidth: 'auto',
          p: 0.5,
          color: theme.palette.primary.main,
        }}
      >
        <ArrowLeft size={14} />
      </Button>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: theme.palette.primary.main,
          px: 1.5,
          minWidth: 112,
          textAlign: 'center',
          textTransform: 'capitalize',
          fontSize: '0.75rem',
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
          p: 0.5,
          color: theme.palette.primary.main,
        }}
      >
        <ArrowRight size={14} />
      </Button>
    </Stack>
  );
}
