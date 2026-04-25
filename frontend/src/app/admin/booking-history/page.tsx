'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Box,
  Chip,
  Stack,
  TextField,
  Select,
  MenuItem,
  Typography,
  useTheme,
  type SxProps,
  type Theme,
} from '@mui/material';

import DataTable, { type Column } from '@/components/data-display/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import {
  bookingHistoryService,
  type BookingAction,
  type BookingHistoryEntry,
  type BookingHistoryResponse,
} from '@/services/booking-history.service';

type ActionConfig = Record<
  BookingAction,
  { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; sx?: SxProps<Theme> }
>;

const ACTION_CONFIG: ActionConfig = {
  CREATED: {
    label: 'Creato',
    color: 'info',
    sx: { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' },
  },
  UPDATED: {
    label: 'Modificato',
    color: 'warning',
    sx: { backgroundColor: 'rgba(217, 119, 6, 0.2)', color: '#d97706' },
  },
  RESCHEDULED: {
    label: 'Spostato',
    color: 'secondary',
    sx: { backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' },
  },
  CANCELLED: {
    label: 'Annullato',
    color: 'error',
    sx: { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' },
  },
  COMPLETED: {
    label: 'Completato',
    color: 'success',
    sx: { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' },
  },
};

const ACTION_OPTIONS: { value: BookingAction | ''; label: string }[] = [
  { value: '', label: 'Tutte le azioni' },
  { value: 'UPDATED', label: 'Modificato' },
  { value: 'RESCHEDULED', label: 'Spostato' },
  { value: 'CANCELLED', label: 'Annullato' },
  { value: 'COMPLETED', label: 'Completato' },
];

export default function BookingHistoryPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [action, setAction] = useState<BookingAction | ''>('');

  const { data, isLoading, error } = useSWR<BookingHistoryResponse>(
    ['booking-history', page, startDate, endDate, action],
    () => bookingHistoryService.getAll({ page, startDate, endDate, action: action || undefined }),
    { revalidateOnFocus: false }
  );

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => {
    if (data && page < data.totalPages) setPage((p) => p + 1);
  };

  const handleSearch = () => setPage(1);

  const getActionLabel = (action: BookingAction): string => {
    return ACTION_CONFIG[action]?.label ?? action;
  };

  const theme = useTheme();

  const renderDateChange = (entry: BookingHistoryEntry) => {
    const actionType = entry.action;

    if (entry.oldDate || entry.newDate) {
      return (
        <Stack direction="row" useFlexGap sx={{ gap: 1, fontSize: '0.875rem' }}>
          {entry.oldDate && (
            <Typography
              sx={{
                color: '#ef4444',
                textDecoration: 'line-through',
                fontSize: '0.875rem',
              }}
            >
              {format(new Date(entry.oldDate), 'dd/MM/yyyy HH:mm', { locale: it })}
            </Typography>
          )}
          {entry.newDate && (
            <Typography
              sx={{
                color: '#10b981',
                fontSize: '0.875rem',
              }}
            >
              {format(new Date(entry.newDate), 'dd/MM/yyyy HH:mm', { locale: it })}
            </Typography>
          )}
        </Stack>
      );
    }

    if (actionType === 'CREATED') {
      return (
        <Typography sx={{ color: '#3b82f6', fontSize: '0.875rem' }}>
          Nuova prenotazione
        </Typography>
      );
    }
    if (actionType === 'CANCELLED') {
      return (
        <Typography sx={{ color: '#ef4444', fontSize: '0.875rem' }}>
          Prenotazione annullata
        </Typography>
      );
    }
    if (actionType === 'COMPLETED') {
      return (
        <Typography sx={{ color: '#10b981', fontSize: '0.875rem' }}>
          Prenotazione completata
        </Typography>
      );
    }

    return <Typography sx={{ fontSize: '0.875rem' }}>—</Typography>;
  };

  const columns: Column<BookingHistoryEntry>[] = useMemo(() => [
    {
      key: 'changedAt',
      label: 'Data',
      width: '150px',
      render: (entry) => (
        <Stack direction="row" useFlexGap sx={{ fontSize: '0.875rem', alignItems: 'center', gap: 0.75 }}>
          <CalendarDays size={14} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
          {format(new Date(entry.changedAt), 'dd MMM yyyy', { locale: it })}
        </Stack>
      ),
    },
    {
      key: 'action',
      label: 'Azione',
      width: '120px',
      render: (entry) => {
        const cfg = ACTION_CONFIG[entry.action];
        return (
          <Chip
            label={getActionLabel(entry.action)}
            size="small"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              ...cfg?.sx,
            }}
          />
        );
      },
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (entry) =>
        entry.booking?.customer ? (
          <Stack direction="column" useFlexGap sx={{ gap: 0.5 }}>
            <Typography
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {entry.booking.customer.firstName} {entry.booking.customer.lastName}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
                fontFamily: 'monospace',
              }}
            >
              {entry.booking.customer.phone}
            </Typography>
          </Stack>
        ) : (
          <Typography sx={{ opacity: 0.4 }}>—</Typography>
        ),
    },
    {
      key: 'artista',
      label: 'Artista',
      width: '140px',
      render: (entry) =>
        entry.booking?.artist ? (
          <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', fontSize: '0.875rem' }}>
            <Box
              sx={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                flexShrink: 0,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                backgroundColor: entry.booking.artist.color,
              }}
            />
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
              {entry.booking.artist.name}
            </Typography>
          </Stack>
        ) : (
          <Typography sx={{ opacity: 0.4, fontSize: '0.875rem' }}>—</Typography>
        ),
    },
    {
      key: 'data',
      label: 'Dettagli',
      render: (entry) => renderDateChange(entry),
    },
    {
      key: 'changedBy',
      label: 'Utente',
      width: '150px',
      render: (entry) => (
        <Stack
          direction="row"
          useFlexGap
          sx={{ gap: 0.75, alignItems: 'center', fontSize: '0.875rem', textOverflow: 'ellipsis' }}
        >
          <User size={12} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {entry.changedBy?.name || '—'}
          </Typography>
        </Stack>
      ),
    },
  ], [theme]);

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
          <Button variant="primary" size="sm" onClick={handleSearch}>
            Filtra
          </Button>
        </Stack>
      </PageHeader>

      {error && (
        <Stack
          useFlexGap
          sx={{ direction: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 8 }}
        >
          <AlertCircle size={40} style={{ opacity: 0.6, color: theme.palette.error.main }} />
          <Box sx={{ fontSize: '0.875rem', color: theme.palette.error.main }}>
            Errore nel caricamento dei dati
          </Box>
        </Stack>
      )}

      {!error && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <DataTable<BookingHistoryEntry>
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
          <Box sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
            Pagina {page} di {data.totalPages}
          </Box>
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
