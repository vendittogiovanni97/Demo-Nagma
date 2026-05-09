'use client';

import { Stack } from '@mui/material';
import { useCallback, useEffect, useState, useMemo } from 'react';

import PageHeader from '@/components/common/PageHeader';
import SmartTable from '@/components/common/SmartTable';
import PaginationControls from '@/components/feedback/PaginationControls';
import { usePaginationFilters } from '@/hooks/usePaginationFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAuth } from '@/context/AuthContext';
import { bookingHistoryService, type BookingAction, type BookingHistoryResponse, type BookingHistoryEntry } from '@/modules/booking-history/api/booking-history.api';
import BookingHistoryCard from '../components/BookingHistoryCard';
import BookingHistoryFilters from '../components/BookingHistoryFilters';
import { useBookingHistoryColumns } from '../hooks/useBookingHistoryColumns';
import { useStaffForSelect } from '@/modules/staff/hooks/useStaff';
import BookingModal from '@/modules/booking/components/modals/BookingModal';
import ExportModal from '@/components/modals/ExportModal';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function BookingHistoryPage() {
  const { user } = useAuth();

  const {
    page,
    setPage,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = usePaginationFilters();

  const [action, setAction] = useState<BookingAction | ''>('');
  const [artistId, setArtistId] = useState<string>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  
  const { data: artists } = useStaffForSelect();
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const [data, setData] = useState<BookingHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await bookingHistoryService.getAll({ 
        page, 
        startDate, 
        endDate, 
        action: action || undefined,
        artistId: artistId ? Number(artistId) : undefined,
        search: debouncedSearch.trim() || undefined
      });
      setData(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, startDate, endDate, action, artistId, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useBookingHistoryColumns();

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => {
    if (data && page < data.totalPages) setPage((p) => p + 1);
  };

  const handleRowClick = (entry: BookingHistoryEntry) => {
    if (entry.booking) {
      setSelectedBooking({
        ...entry.booking,
        status: entry.booking.status as BookingAction
      });
    }
  };

  const artistOptions = useMemo(() => [
    { label: 'Tutti gli artisti', value: '' },
    ...artists.map(a => ({ label: a.name, value: a.id.toString() }))
  ], [artists]);

  const exportColumns = useMemo(() => [
    { label: 'Data Modifica', value: (e: BookingHistoryEntry) => format(new Date(e.changedAt), 'dd/MM/yyyy HH:mm', { locale: it }) },
    { label: 'Azione', value: (e: BookingHistoryEntry) => e.action },
    { label: 'Cliente', value: (e: BookingHistoryEntry) => e.booking ? `${e.booking.customer.firstName} ${e.booking.customer.lastName}` : '-' },
    { label: 'Artista', value: (e: BookingHistoryEntry) => e.booking?.artist?.name ?? '-' },
    { label: 'Data Appuntamento', value: (e: BookingHistoryEntry) => e.booking ? format(new Date(e.booking.date), 'dd/MM/yyyy HH:mm', { locale: it }) : '-' },
    { label: 'Prezzo (€)', value: (e: BookingHistoryEntry) => e.booking?.price ?? '' },
    { label: 'Effettuata da', value: (e: BookingHistoryEntry) => e.changedBy?.name ?? '-' },
  ], []);

  const handleResolveExportRows = async () => {
    const res = await bookingHistoryService.getAll({
      startDate,
      endDate,
      action: action || undefined,
      artistId: artistId ? Number(artistId) : undefined,
      search: search.trim() || undefined,
      limit: 1000 
    });
    return res.data;
  };

  return (
    <Stack direction="column" useFlexGap sx={{ gap: 3, flex: 1 }}>
      <PageHeader
        title="Storico Prenotazioni"
        subtitle={user ? `Accesso come ${user.name}` : undefined}
        actions={
          <ExportModal
            filenameBase="storico-prenotazioni"
            title="Storico Modifiche Prenotazioni"
            rows={data?.data ?? []}
            columns={exportColumns}
            resolveRows={handleResolveExportRows}
          />
        }
        filters={
          <BookingHistoryFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            action={action}
            onActionChange={(val) => { setAction(val); setPage(1); }}
            artistId={artistId}
            onArtistIdChange={(v) => { setArtistId(v); setPage(1); }}
            artistOptions={artistOptions}
          />
        }
      />

      <SmartTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        hasError={!!error}
        keyExtractor={(entry) => entry.id}
        onRowClick={handleRowClick}
        emptyTitle="Nessuna modifica"
        emptyDescription="Nessuna modifica trovata per i filtri selezionati."
        renderCard={(entry) => <BookingHistoryCard entry={entry} onClick={() => handleRowClick(entry)} />}
        getRowStyle={() => ({ cursor: 'pointer' })}
      />

      <PaginationControls
        page={page}
        totalPages={data?.totalPages || 0}
        total={data?.total || 0}
        onPrev={handlePrevPage}
        onNext={handleNextPage}
        label="modifiche"
      />

      <BookingModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        onSuccess={fetchData}
      />
    </Stack>
  );
}
