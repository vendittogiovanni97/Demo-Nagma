'use client';

import { Box, Stack } from '@mui/material';
import { useCallback, useState, useMemo } from 'react';

import PageHeader from '@/common/components/common/PageHeader';
import DataTable from '@/common/components/table/DataTable';
import FormInput from '@/common/components/forms/FormInput';
import { usePaginationFilters } from '@/common/hooks/usePaginationFilters';
import { useAuth } from '@/common/context/AuthContext';
import { bookingHistoryService, type BookingAction, type BookingHistoryEntry } from '@/modules/booking-history/api/booking-history.api';
import BookingHistoryCard from '../components/BookingHistoryCard';
import { useBookingHistoryColumns } from '../hooks/useBookingHistoryColumns';
import { useStaffForSelect } from '@/modules/staff/hooks/useStaff';
import BookingModal from '@/modules/booking/components/modals/BookingModal';
import type { FetchParams, ToolbarFilter } from '@/common/components/table/DataTable';

export default function BookingHistoryPage() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = usePaginationFilters();

  const [action, setAction] = useState<BookingAction | ''>('');
  const [artistId, setArtistId] = useState<string>('');
  
  const { data: artists } = useStaffForSelect();

  const columns = useBookingHistoryColumns();

  const artistOptions = useMemo(() => [
    { label: 'Tutti gli artisti', value: '' },
    ...artists.map(a => ({ label: a.name, value: a.id.toString() }))
  ], [artists]);

  const fetchHistory = useCallback(async (params: FetchParams) => {
    return bookingHistoryService.getAll({ 
      page: params.page,
      limit: params.limit,
      search: params.search,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      action: action || undefined,
      artistId: artistId ? Number(artistId) : undefined,
    });
  }, [startDate, endDate, action, artistId]);

  const refreshKey = useMemo(() => {
    return `${startDate || ''}_${endDate || ''}_${action}_${artistId}_${refreshTrigger}`;
  }, [startDate, endDate, action, artistId, refreshTrigger]);

  const toolbarFilters = useMemo<ToolbarFilter[]>(() => [
    {
      id: 'action',
      label: 'Azione',
      value: action,
      onChange: (val) => setAction(val as BookingAction | ''),
      options: [
        { label: 'Tutte le azioni', value: '' },
        { label: 'Creato', value: 'CREATO' },
        { label: 'Confermato', value: 'CONFERMATO' },
        { label: 'Modificato', value: 'MODIFICATO' },
        { label: 'Spostato', value: 'SPOSTATO' },
        { label: 'Completato', value: 'COMPLETATO' },
        { label: 'Annullato', value: 'ANNULLATO' },
        { label: 'Cancellato', value: 'CANCELLATO' },
      ],
      minWidth: 150,
    },
    {
      id: 'artistId',
      label: 'Artista',
      value: artistId,
      onChange: setArtistId,
      options: artistOptions,
      minWidth: 160,
    }
  ], [action, artistId, artistOptions]);

  const extraToolbarActions = useMemo(() => (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <FormInput
        type="date"
        value={startDate}
        onChange={setStartDate}
        hideLabel
        placeholder="Da data"
        sx={{ width: 140, '& .MuiInputBase-root': { height: 36 } }}
      />
      <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>al</Box>
      <FormInput
        type="date"
        value={endDate}
        onChange={setEndDate}
        hideLabel
        placeholder="A data"
        sx={{ width: 140, '& .MuiInputBase-root': { height: 36 } }}
      />
    </Stack>
  ), [startDate, endDate, setStartDate, setEndDate]);

  return (
    <Stack direction="column" useFlexGap sx={{ gap: 3, flex: 1 }}>
      <PageHeader
        title="Storico Prenotazioni"
        subtitle={user ? `Accesso come ${user.name}` : undefined}
      />

      <Box sx={{ flex: 1 }}>
        <DataTable<BookingHistoryEntry>
          columns={columns}
          fetchData={fetchHistory}
          queryKey="bookingHistory"
          refreshKey={refreshKey as any}
          keyExtractor={(entry) => entry.id}
          emptyTitle="Nessuna modifica"
          emptyDescription="Nessuna modifica trovata per i filtri selezionati."
          renderCard={(entry) => <BookingHistoryCard entry={entry} />}
          getRowStyle={() => ({ cursor: 'pointer' })}
          toolbarFilters={toolbarFilters}
          extraToolbarActions={extraToolbarActions}
          exportFileName="storico-prenotazioni"
          openEntityModal={(action, entry, onClose, onSuccess) => {
            if (!entry?.booking) return null;
            return (
              <BookingModal
                isOpen
                booking={{
                  ...entry.booking,
                  status: entry.booking.status as BookingAction
                } as any}
                onClose={onClose || (() => {})}
                onSuccess={onSuccess}
              />
            );
          }}
        />
      </Box>
    </Stack>
  );
}
