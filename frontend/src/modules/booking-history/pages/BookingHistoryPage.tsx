'use client';

import { Box, Stack, Typography, useTheme as useMuiTheme } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import PageHeader from '@/components/common/PageHeader';
import SmartFilters from '@/components/common/SmartFilters';
import SmartTable from '@/components/common/SmartTable';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { bookingHistoryService, type BookingAction, type BookingHistoryResponse } from '@/modules/booking-history/api/booking-history.api';
import BookingHistoryCard from '../components/BookingHistoryCard';
import { useBookingHistoryColumns } from '../hooks/useBookingHistoryColumns';

export default function BookingHistoryPage() {
  const { user } = useAuth();
  const theme = useMuiTheme();
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [action, setAction] = useState<BookingAction | ''>('');

  const [data, setData] = useState<BookingHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await bookingHistoryService.getAll({ page, startDate, endDate, action: action || undefined });
      setData(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, startDate, endDate, action]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useBookingHistoryColumns();

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => {
    if (data && page < data.totalPages) setPage((p) => p + 1);
  };

  const filteredData = (data?.data ?? []).filter((entry) => entry.action !== 'COMPLETATO');

  return (
    <Stack direction="column" useFlexGap sx={{ gap: 3, flex: 1 }}>
      <PageHeader
        title="Storico Prenotazioni"
        subtitle={user ? `Accesso come ${user.name}` : undefined}
        filters={
          <SmartFilters
            dateRange={{
              start: { value: startDate, onChange: setStartDate },
              end: { value: endDate, onChange: setEndDate },
            }}
            select={{
              label: "Azione",
              value: action,
              onChange: (val) => setAction(val as BookingAction | ''),
              placeholder: "Tutte le azioni",
              options: [
                { label: 'Creato', value: 'CREATO' },
                { label: 'Confermato', value: 'CONFERMATO' },
                { label: 'Modificato', value: 'MODIFICATO' },
                { label: 'Spostato', value: 'SPOSTATO' },
                { label: 'Completato', value: 'COMPLETATO' },
                { label: 'Annullato', value: 'ANNULLATO' },
                { label: 'Cancellato', value: 'CANCELLATO' },
              ],
            }}
            submitAction={{
              label: "Filtra",
              onClick: () => setPage(1),
            }}
          />
        }
      />

      <SmartTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        hasError={!!error}
        keyExtractor={(entry) => entry.id}
        emptyTitle="Nessuna modifica"
        emptyDescription="Nessuna modifica trovata per i filtri selezionati."
        renderCard={(entry) => <BookingHistoryCard entry={entry} />}
      />

      {data && data.totalPages > 1 && (
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
