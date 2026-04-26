"use client";

import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
  Button as MuiButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SearchInput from '@/components/forms/SearchInput';

interface BookingFiltersProps {
  monthLabel: string;
  search: string;
  startDate: string;
  endDate: string;
  showCancelled: boolean;
  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onShowCancelledChange: (value: boolean) => void;
  onResetDateRange: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function BookingFilters({
  monthLabel,
  search,
  startDate,
  endDate,
  showCancelled,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onShowCancelledChange,
  onResetDateRange,
  onPrevMonth,
  onNextMonth,
}: BookingFiltersProps) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{
        gap: 1.25,
        alignItems: 'center',
        justifyContent: { xs: 'flex-start', xl: 'center' },
        flex: '1 1 auto',
        minWidth: 0,
        flexWrap: { xs: 'wrap', xl: 'nowrap' },
      }}
    >
      <Stack
        direction="row"
        useFlexGap
        sx={{ gap: 0.5, alignItems: 'center', flexShrink: 0 }}
      >
        <IconButton size="small" onClick={onPrevMonth} sx={{ p: 0.75 }}>
          <ChevronLeft size={16} />
        </IconButton>
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: theme.palette.text.primary,
            textTransform: 'capitalize',
            minWidth: 128,
            textAlign: 'center',
          }}
        >
          {monthLabel}
        </Typography>
        <IconButton size="small" onClick={onNextMonth} sx={{ p: 0.75 }}>
          <ChevronRight size={16} />
        </IconButton>
      </Stack>

      <Box
        sx={{
          flex: { xs: '1 1 100%', md: '1 1 240px' },
          minWidth: { xs: '100%', xl: 240 },
          maxWidth: { xs: '100%', xl: 320 },
        }}
      >
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Cerca cliente, artista, telefono..."
        />
      </Box>

      <Stack
        direction="row"
        useFlexGap
        sx={{
          gap: 0.75,
          alignItems: 'center',
          flexShrink: 0,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}
      >
        <TextField
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          size="small"
          sx={{ width: 138 }}
        />
        <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.8125rem' }}>
          —
        </Typography>
        <TextField
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          size="small"
          sx={{ width: 138 }}
        />
        {(startDate || endDate) && (
          <MuiButton variant="text" size="small" onClick={onResetDateRange}>
            Reset
          </MuiButton>
        )}
      </Stack>

      <FormControlLabel
        control={
          <Checkbox
            checked={showCancelled}
            onChange={(e) => onShowCancelledChange(e.target.checked)}
          />
        }
        label="Annullate"
        sx={{
          ml: 0,
          mr: 0,
          flexShrink: 0,
          '& .MuiFormControlLabel-label': {
            fontSize: '0.8125rem',
          },
        }}
      />
    </Stack>
  );
}
