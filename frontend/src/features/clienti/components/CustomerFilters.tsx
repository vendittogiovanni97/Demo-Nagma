"use client";

import SearchInput from '@/components/forms/SearchInput';
import Button from '@/components/ui/Button';
import { Box, Grid, TextField, Typography, useTheme as useMuiTheme } from '@mui/material';

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
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 5 }}>
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Cerca per nome, cognome o telefono..."
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 7 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            size="small"
            sx={{ width: { xs: '100%', lg: 180 } }}
          />
          <Typography sx={{ display: { xs: 'none', lg: 'block' }, color: theme.palette.text.secondary, fontSize: '0.8125rem' }}>
            —
          </Typography>
          <TextField
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            size="small"
            sx={{ width: { xs: '100%', lg: 180 } }}
          />
        </Box>
      </Grid>
      <Grid size={{ xs: 12, lg: 3 }} sx={{ display: (startDate || endDate) ? 'flex' : 'none', alignItems: 'center' }}>
        <Button variant="ghost" size="sm" onClick={onResetDates}>
          Reset
        </Button>
      </Grid>
    </Grid>
  );
}
