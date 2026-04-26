'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Stack, TextField, Select, MenuItem, Box, Typography, useTheme } from '@mui/material';

import DataTable from '@/components/data-display/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { bookingHistoryService, type BookingAction, type BookingHistoryResponse } from '@/services/booking-history.service';
import { useBookingHistoryColumns } from './hooks/useBookingHistoryColumns';

export default function BookingHistoryPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [action, setAction] = useState<BookingAction | ''>('');

  const { data, isLoading, error } = useSWR<BookingHistoryResponse>(
    ['booking-history', page, startDate, endDate, action],
    () => bookingHistoryService.getAll({ page, startDate, endDate, action: action || undefined }),
    { revalidateOnFocus: false }
  );

  const columns = useBookingHistoryColumns();

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => {
    if (data && page < data.totalPages) setPage((p) => p + 1);
  };

  return (
    <Stack direction="column" useFlexGap sx={{ gap: 3, flex: 1 }}>
      <PageHeader
        title="Storico Prenotazioni"
        subtitle={user ? `Accesso come ${user.name}` : undefined}
      >
        <Stack direction="row" useFlexGap sx={{ gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <TextField
            label="Dal"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            size="small"
            sx={{ width: '140px' }}
          />
          <TextField
            label="Al"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            size="small"
            sx={{ width: '140px' }}
          />
          <Select
            value={action}
            onChange={(e) => setAction(e.target.value as BookingAction | '')}
            size="small"
            sx={{ width: '180px' }}
          >
            <MenuItem value="">Tutte le azioni</MenuItem>
            <MenuItem value="UPDATED">Modificato</MenuItem>
            <MenuItem value="RESCHEDULED">Spostato</MenuItem>
            <MenuItem value="CANCELLED">Annullato</MenuItem>
            <MenuItem value="COMPLETED">Completato</MenuItem>
          </Select>
          <Button variant="primary" size="sm" onClick={() => setPage(1)}>
            Filtra
          </Button>
        </Stack>
      </PageHeader>

      {error && (
        <Stack useFlexGap sx={{ direction: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 8 }}>
          <AlertCircle size={40} style={{ opacity: 0.6, color: theme.palette.error.main }} />
          <Typography sx={{ fontSize: '0.875rem', color: theme.palette.error.main }}>
            Errore nel caricamento dei dati
          </Typography>
        </Stack>
      )}

      {!error && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="Nessuna modifica trovata per i filtri selezionati."
            keyExtractor={(entry) => entry.id}
          />
        </Box>
      )}

      {!error && data && data.totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevPage}
            disabled={page <= 1}
            icon={<ChevronLeft size={16} />}
          >
            Precedente
          </Button>
          <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
            Pagina {page} di {data.totalPages}
          </Typography>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            disabled={page >= data.totalPages}
            icon={<ChevronRight size={16} />}
          >
            Successiva
          </Button>
        </Box>
      )}
    </Stack>
  );
}