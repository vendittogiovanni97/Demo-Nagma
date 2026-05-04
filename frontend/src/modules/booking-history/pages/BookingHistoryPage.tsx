'use client';

import { Box, Stack, Typography, useTheme as useMuiTheme } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState, useMemo } from 'react';

import PageHeader from '@/components/common/PageHeader';
import SmartFilters from '@/components/common/SmartFilters';
import SmartTable from '@/components/common/SmartTable';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { bookingHistoryService, type BookingAction, type BookingHistoryResponse, type BookingHistoryEntry } from '@/modules/booking-history/api/booking-history.api';
import BookingHistoryCard from '../components/BookingHistoryCard';
import { useBookingHistoryColumns } from '../hooks/useBookingHistoryColumns';
import { staffApi } from '@/modules/team/api/staff.api';
import FormSelect from '@/components/forms/FormSelect';
import BookingModal from '@/modules/booking/components/modals/BookingModal';
import type { Staff } from '@/modules/team/model/team.types';
import ExportModal from '@/components/modals/ExportModal';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function BookingHistoryPage() {
  const { user } = useAuth();
  const theme = useMuiTheme();
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [action, setAction] = useState<BookingAction | ''>('');
  const [artistId, setArtistId] = useState<string>('');
  const [search, setSearch] = useState('');
  
  const [artists, setArtists] = useState<{ id: number; name: string }[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const [data, setData] = useState<BookingHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    staffApi.getAllForSelect().then((data: Staff[]) => {
      setArtists(data.map((a: Staff) => ({ id: a.id, name: a.name })));
    });
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await bookingHistoryService.getAll({ 
        page, 
        startDate, 
        endDate, 
        action: action || undefined,
        artistId: artistId ? Number(artistId) : undefined,
        search: search.trim() || undefined
      });
      setData(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, startDate, endDate, action, artistId, search]);

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
      // Cast the minimal booking from history to the full Booking type for the modal
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
      limit: 1000 // High limit for export
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
          <SmartFilters
            search={{
              value: search,
              onChange: (v) => { setSearch(v); setPage(1); },
              placeholder: "Cerca cliente o telefono..."
            }}
            dateRange={{
              start: { value: startDate, onChange: (v) => { setStartDate(v); setPage(1); } },
              end: { value: endDate, onChange: (v) => { setEndDate(v); setPage(1); } },
            }}
            select={{
              label: "Azione",
              value: action,
              onChange: (val) => { setAction(val as BookingAction | ''); setPage(1); },
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
          >
            <Box sx={{ width: { xs: '100%', sm: 160 } }}>
              <FormSelect
                value={artistId}
                onChange={(v) => { setArtistId(v); setPage(1); }}
                options={artistOptions}
                placeholder="Tutti gli artisti"
                hideLabel
                sx={{ '& .MuiInputBase-root': { height: 36 } }}
              />
            </Box>
          </SmartFilters>
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

      <BookingModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        onSuccess={fetchData}
      />
    </Stack>
  );
}
