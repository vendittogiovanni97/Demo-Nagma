'use client';

import { Box, Stack } from '@mui/material';
import { useCallback, useEffect, useState, useMemo } from 'react';

import PageHeader from '@/common/components/common/PageHeader';
import SmartFilters from '@/common/components/common/SmartFilters';
import FormSelect from '@/common/components/forms/FormSelect';
import DataTable, { type FetchParams } from '@/common/components/table/DataTable';
import { useDateRangeFilters } from '@/common/hooks/useDateRangeFilters';
import { useDebouncedValue } from '@/common/hooks/useDebouncedValue';
import { DEBOUNCE_SEARCH_DELAY } from '@/common/config/env';
import { formatDate } from '@/common/shared/utils/format';
import { useAuth } from '@/common/context/AuthContext';
import { bookingHistoryService, type BookingAction, type BookingHistoryEntry } from '@/modules/booking-history/api/booking-history.api';
import BookingHistoryCard from '../components/BookingHistoryCard';
import { useBookingHistoryColumns } from '../hooks/useBookingHistoryColumns';
import { useStaffForSelect } from '@/modules/staff/hooks/useStaff';
import { getBookingStatusLabel } from '@/common/config/status-config';

export default function BookingHistoryPage() {
  const { user } = useAuth();

  const { startDate, setStartDate, endDate, setEndDate, resetDateRange } = useDateRangeFilters();
  const [search, setSearch] = useState('');
  const [action, setAction] = useState<BookingAction | ''>('');
  const [artistId, setArtistId] = useState<string>('');
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_DELAY);

  const { data: artists } = useStaffForSelect();
  const columns = useBookingHistoryColumns();

  const [rowsForExport, setRowsForExport] = useState<BookingHistoryEntry[]>([]);

  const artistOptions = useMemo(() => [
    { label: 'Tutti gli artisti', value: '' },
    ...artists.map(a => ({ label: a.name, value: a.id.toString() })),
  ], [artists]);

  const actionOptions = useMemo(() => [
    { label: 'Tutti gli stati', value: '' },
    { label: 'Creato', value: 'CREATO' },
    { label: 'Confermato', value: 'CONFERMATO' },
    { label: 'Modificato', value: 'MODIFICATO' },
    { label: 'Spostato', value: 'SPOSTATO' },
    { label: 'Completato', value: 'COMPLETATO' },
    { label: 'Annullato', value: 'ANNULLATO' },
    { label: 'Cancellato', value: 'CANCELLATO' },
  ], []);

  const fetchHistory = useCallback(
    async (params: FetchParams) => {
      const res = await bookingHistoryService.getAll({
        page: params.page + 1,
        limit: params.limit,
        search: debouncedSearch || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        action: action || undefined,
        artistId: artistId ? Number(artistId) : undefined,
      });
      setRowsForExport(res.data);
      return { data: res.data, total: res.total };
    },
    [debouncedSearch, startDate, endDate, action, artistId]
  );

  const refreshKey = `${debouncedSearch}-${startDate}-${endDate}-${action}-${artistId}`;

  const exportColumns = useMemo(() => [
    { label: 'Registrato il', value: (e: BookingHistoryEntry) => formatDate(e.changedAt, 'dd/MM/yyyy HH:mm') },
    { label: 'Stato', value: (e: BookingHistoryEntry) => getBookingStatusLabel(e.action) },
    { label: 'Cliente', value: (e: BookingHistoryEntry) => e.booking?.customer ? `${e.booking.customer.firstName} ${e.booking.customer.lastName ?? ''}`.trim() : '-' },
    { label: 'Artista', value: (e: BookingHistoryEntry) => e.booking?.artist?.name ?? '-' },
    {
      label: 'Data appuntamento',
      value: (e: BookingHistoryEntry) =>
        formatDate(e.newDate ?? e.oldDate ?? e.booking?.date, 'dd/MM/yyyy HH:mm'),
      strikeThroughInPdf: (e: BookingHistoryEntry) =>
        e.action === 'ANNULLATO' || e.action === 'CANCELLATO',
    },
    { label: 'Utente', value: (e: BookingHistoryEntry) => e.changedBy?.name ?? '-' },
  ], []);

  return (
    <Stack direction="column" useFlexGap sx={{ gap: 3, flex: 1 }}>
      <PageHeader
        title="Storico Prenotazioni"
        subtitle={user ? `Accesso come ${user.name}` : undefined}
        exportConfig={{
          filenameBase: "storico-prenotazioni",
          title: "Storico Prenotazioni",
          rows: rowsForExport,
          columns: exportColumns,
          getPdfRowVariant: (entry) => (entry.action === 'COMPLETATO' ? 'success' : undefined),
        }}
        filters={
          <SmartFilters
            search={{
              value: search,
              onChange: setSearch,
              placeholder: 'Cerca cliente, artista...',
            }}
            dateRange={{
              start: { value: startDate, onChange: setStartDate },
              end: { value: endDate, onChange: setEndDate },
            }}
          >
            <FormSelect
              label="Stato"
              value={action}
              onChange={(val) => setAction(val as BookingAction | '')}
              options={actionOptions}
              hideLabel
              sx={{ flex: '0 1 160px', minWidth: 120 }}
            />
            <FormSelect
              label="Artista"
              value={artistId}
              onChange={setArtistId}
              options={artistOptions}
              hideLabel
              sx={{ flex: '0 1 170px', minWidth: 120 }}
            />
            {(startDate || endDate) && (
              <Box
                component="button"
                onClick={resetDateRange}
                sx={{
                  border: 'none',
                  background: 'transparent',
                  color: 'text.secondary',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                Reset
              </Box>
            )}
          </SmartFilters>
        }
      />

      <Box sx={{ flex: 1 }}>
        <DataTable<BookingHistoryEntry>
          columns={columns}
          fetchData={fetchHistory}
          refreshKey={refreshKey}
          keyExtractor={(entry) => entry.id}
          emptyTitle="Nessuna modifica"
          emptyDescription="Nessuna modifica trovata per i filtri selezionati."
          renderCard={(entry) => <BookingHistoryCard entry={entry} />}
        />
      </Box>
    </Stack>
  );
}
