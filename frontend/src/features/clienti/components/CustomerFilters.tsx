"use client";

import SearchInput from '@/components/forms/SearchInput';
import Button from '@/components/ui/Button';
import { Box, Stack, TextField, Typography, useTheme } from '@mui/material';

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
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{
        gap: 0.875,
        alignItems: 'center',
        justifyContent: { xs: 'flex-start', xl: 'center' },
        flex: '1 1 auto',
        minWidth: 0,
        flexWrap: { xs: 'wrap', xl: 'nowrap' },
      }}
    >
      <Box
        sx={{
          flex: { xs: '1 1 100%', md: '1 1 280px' },
          minWidth: { xs: '100%', xl: 280 },
          maxWidth: { xs: '100%', xl: 360 },
        }}
      >
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Cerca per nome, cognome o telefono..."
        />
      </Box>

      <Stack
        direction="row"
        useFlexGap
        sx={{
          gap: 0.625,
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
          sx={{ width: 126 }}
        />
        <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>—</Typography>
        <TextField
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          size="small"
          sx={{ width: 126 }}
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
