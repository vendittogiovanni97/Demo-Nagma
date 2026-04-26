"use client";

import SearchInput from '@/components/forms/SearchInput';
import Button from '@/components/ui/Button';
import { Box, Stack, TextField, Typography, useTheme as useMuiTheme } from '@mui/material';

interface Props {
  search: string;
  startDate: string;
  endDate: string;
  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onResetDates: () => void;
}

export default function CustomerFilters({
  search,
  startDate,
  endDate,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onResetDates,
}: Props) {
  const theme = useMuiTheme();

  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      useFlexGap
      sx={{
        gap: { xs: 1, lg: 0.875 },
        alignItems: { xs: 'stretch', lg: 'center' },
        justifyContent: { xs: 'flex-start', xl: 'center' },
        flex: '1 1 auto',
        minWidth: 0,
        width: '100%',
      }}
    >
      <Box
        sx={{
          flex: { xs: '1 1 100%', lg: '1 1 280px' },
          minWidth: { xs: '100%', lg: 280 },
          maxWidth: { xs: '100%', xl: 360 },
          width: { xs: '100%', lg: 'auto' },
        }}
      >
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Cerca per nome, cognome o telefono..."
        />
      </Box>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        useFlexGap
        sx={{
          gap: { xs: 1, lg: 0.625 },
          alignItems: { xs: 'stretch', lg: 'center' },
          flexShrink: 0,
          width: { xs: '100%', lg: 'auto' },
        }}
      >
        <TextField
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          size="small"
          sx={{ width: { xs: '100%', lg: 126 } }}
        />
        <Typography sx={{ display: { xs: 'none', lg: 'block' }, color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
          —
        </Typography>
        <TextField
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          size="small"
          sx={{ width: { xs: '100%', lg: 126 } }}
        />
        {(startDate || endDate) && (
          <Button variant="ghost" size="sm" onClick={onResetDates}>
            Reset
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
