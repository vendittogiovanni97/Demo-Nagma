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
import { useTheme as useMuiTheme } from '@mui/material/styles';
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
  const theme = useMuiTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        alignItems: { xs: 'stretch', lg: 'center' },
        gap: { xs: 1, lg: 1.5 },
        minWidth: 0,
        flex: 1,
        width: '100%',
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
          flex: { xs: '1 1 100%', lg: '1 1 200px' },
          minWidth: { xs: '100%', lg: 150 },
          maxWidth: { xs: '100%', lg: 280 },
        }}
      >
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Cerca cliente, artista..."
          sx={{ width: '100%' }}
        />
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        useFlexGap
        sx={{
          gap: { xs: 0.75, sm: 0.75 },
          alignItems: { xs: 'stretch', sm: 'center' },
          width: { xs: '100%', lg: 'auto' },
        }}
      >
        <TextField
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          size="small"
          sx={{ flex: { xs: 1, sm: 'none' }, width: { xs: '100%', sm: 130 } }}
        />
        <Typography sx={{ display: { xs: 'none', sm: 'block' }, color: theme.palette.text.secondary, fontSize: '0.8125rem' }}>
          —
        </Typography>
        <TextField
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          size="small"
          sx={{ flex: { xs: 1, sm: 'none' }, width: { xs: '100%', sm: 130 } }}
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
          width: { xs: '100%', lg: 'auto' },
          '& .MuiFormControlLabel-label': {
            fontSize: '0.8125rem',
          },
        }}
      />
    </Box>
  );
}
