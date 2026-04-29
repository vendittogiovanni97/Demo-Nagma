"use client";

import SearchInput from '@/components/forms/SearchInput';
import type { BookingStatus } from '@/types/booking';
import {
  Box,
  IconButton,
  Button as MuiButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingFiltersProps {
  monthLabel: string;
  search: string;
  startDate: string;
  endDate: string;
  statusFilter: BookingStatus | 'ALL';
  sortOrder: 'asc' | 'desc';
  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onStatusFilterChange: (value: BookingStatus | 'ALL') => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onResetDateRange: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function BookingFilters({
  monthLabel,
  search,
  startDate,
  endDate,
  statusFilter,
  sortOrder,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onStatusFilterChange,
  onSortOrderChange,
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
        gap: { xs: 1.25, lg: 1.5 },
        width: '100%',
        minWidth: 0,
        flex: 1,
      }}
    >
      {/* Month navigator — centered su mobile, inline su desktop */}
      <Stack
        direction="row"
        useFlexGap
        sx={{
          gap: 0.5,
          alignItems: 'center',
          justifyContent: { xs: 'center', lg: 'flex-start' },
          flexShrink: 0,
        }}
      >
        <IconButton
          size="small"
          onClick={onPrevMonth}
          aria-label="Mese precedente"
          sx={{ p: 0.75 }}
        >
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
        <IconButton
          size="small"
          onClick={onNextMonth}
          aria-label="Mese successivo"
          sx={{ p: 0.75 }}
        >
          <ChevronRight size={16} />
        </IconButton>
      </Stack>

      {/* Search — full width su mobile, max 280 su desktop */}
      <Box
        sx={{
          flex: { xs: '1 1 auto', lg: '1 1 200px' },
          minWidth: 0,
          width: { xs: '100%', lg: 'auto' },
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

      {/* Date range + Annullate checkbox */}
      <Stack
        direction="row"
        useFlexGap
        sx={{
          gap: 0.75,
          alignItems: 'center',
          width: { xs: '100%', lg: 'auto' },
          flexShrink: 0,
        }}
      >
        <TextField
          label="Dal"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: { xs: 1, lg: '0 0 140px' }, minWidth: 0 }}
        />
        <TextField
          label="Al"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: { xs: 1, lg: '0 0 140px' }, minWidth: 0 }}
        />
        {(startDate || endDate) && (
          <MuiButton
            variant="text"
            size="small"
            onClick={onResetDateRange}
            sx={{ flexShrink: 0, fontSize: '0.75rem' }}
          >
            Reset
          </MuiButton>
        )}
        <TextField
          select
          label="Stato"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as BookingStatus | 'ALL')}
          size="small"
          sx={{ flex: { xs: 1, lg: '0 0 140px' }, minWidth: 0 }}
          slotProps={{
            select: {
              MenuProps: {
                slotProps: {
                  paper: {
                    sx: {
                      backgroundColor: theme.palette.background.paper,
                      backgroundImage: 'none',
                      border: `1px solid rgba(0, 191, 255, 0.2)`,
                      '& .MuiMenuItem-root': {
                        fontSize: '0.8125rem',
                        py: 0.75,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 191, 255, 0.1)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(0, 191, 255, 0.15)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 191, 255, 0.2)',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          }}
        >
          <MenuItem value="ALL">Tutti</MenuItem>
          <MenuItem value="CONFIRMED">Confermato</MenuItem>
          <MenuItem value="COMPLETED">Completato</MenuItem>
          <MenuItem value="RESCHEDULED">Spostato</MenuItem>
          <MenuItem value="CANCELLED">Annullato</MenuItem>
        </TextField>
        <TextField
          select
          label="Ordinamento"
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
          size="small"
          sx={{ flex: { xs: 1, lg: '0 0 140px' }, minWidth: 0 }}
          slotProps={{
            select: {
              MenuProps: {
                slotProps: {
                  paper: {
                    sx: {
                      backgroundColor: theme.palette.background.paper,
                      backgroundImage: 'none',
                      border: `1px solid rgba(0, 191, 255, 0.2)`,
                      '& .MuiMenuItem-root': {
                        fontSize: '0.8125rem',
                        py: 0.75,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 191, 255, 0.1)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(0, 191, 255, 0.15)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 191, 255, 0.2)',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          }}
        >
          <MenuItem value="desc">Più recente</MenuItem>
          <MenuItem value="asc">Più vecchio</MenuItem>
        </TextField>
      </Stack>
    </Box>
  );
}
