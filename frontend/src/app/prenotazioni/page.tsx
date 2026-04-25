"use client";

import {
  Box,
  Stack,
  Typography,
  TextField,
  Button as MuiButton,
  IconButton,
  Chip,
  useTheme,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Edit, Phone, Plus, Timer, Trash2 } from 'lucide-react';

import PermissionGate from '@/components/auth/PermissionGate';
import Avatar from '@/components/data-display/Avatar';
import DataTable, { type Column } from '@/components/data-display/DataTable';
import StatePanel from '@/components/feedback/StatePanel';
import SearchInput from '@/components/forms/SearchInput';
import PageHeader from '@/components/layout/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import { DEBOUNCE_SEARCH_DELAY } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/hooks/domain/useBookings';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { bookingService } from '@/services/booking.service';
import type { Booking, BookingStatus } from '@/types/booking';

import BookingModal from '@/components/modals/BookingModal';
import ExportModal, { type ExportFilter } from '@/components/modals/ExportModal';
import PasswordConfirmModal from '@/components/modals/PasswordConfirmModal';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useMemo, useState } from 'react';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: 'primary' | 'success' | 'error' | 'warning' }> = {
  CONFIRMED: { label: 'Confermato', color: 'primary' },
  COMPLETED: { label: 'Completato', color: 'success' },
  CANCELLED: { label: 'Annullato', color: 'error' },
  RESCHEDULED: { label: 'Spostato', color: 'warning' },
};

function monthKey(date: Date) {
  return format(date, 'yyyy-MM');
}

export default function PrenotazioniPage() {
  const { isSuperAdmin } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
  const [deletePasswordLoading, setDeletePasswordLoading] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();
  const theme = useTheme();

  const month = monthKey(currentMonth);
  const { data: bookings, mutate, isLoading, error } = useBookings(month);
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_DELAY);

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: it });

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    const filtered = bookings.filter(b => {
      if (!showCancelled && b.status === 'CANCELLED') return false;
      return true;
    });
    if (!debouncedSearch.trim()) return filtered;
    const q = debouncedSearch.toLowerCase();
    return filtered.filter((b) => {
      const clienteName = b.customer ? `${b.customer.firstName} ${b.customer.lastName}`.toLowerCase() : '';
      const phone = b.customer?.phone?.toLowerCase() ?? '';
      const artist = b.artist?.name?.toLowerCase() ?? '';
      return clienteName.includes(q) || phone.includes(q) || artist.includes(q);
    });
  }, [bookings, debouncedSearch, showCancelled]);

  const exportColumns = useMemo(() => [
    { label: 'Cliente', value: (b: Booking) => b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : '-' },
    { label: 'Artista', value: (b: Booking) => b.artist?.name ?? '-' },
    { label: 'Data', value: (b: Booking) => format(new Date(b.date), 'dd/MM/yyyy HH:mm', { locale: it }) },
    { label: 'Durata (min)', value: (b: Booking) => b.duration },
    { label: 'Stato', value: (b: Booking) => STATUS_CONFIG[b.status]?.label ?? b.status },
    { label: 'Prezzo (€)', value: (b: Booking) => b.price ?? '' },
    { label: 'Acconto (€)', value: (b: Booking) => b.deposit ?? '' },
    { label: 'Note', value: (b: Booking) => b.notes ?? '' },
  ], []);

  const bookingColumns: Column<Booking>[] = useMemo(() => [
    {
      key: 'cliente',
      label: 'Cliente',
      width: '250px',
      render: (booking) => (
        booking.customer ? (
          <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center' }}>
            <Avatar
              firstName={booking.customer.firstName}
              lastName={booking.customer.lastName}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {booking.customer.firstName} {booking.customer.lastName}
              </Typography>
              {booking.customer.phone && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: 'block',
                    mt: 0.25,
                    fontFamily: 'monospace',
                  }}
                >
                  {booking.customer.phone}
                </Typography>
              )}
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
            —
          </Typography>
        )
      ),
    },
    {
      key: 'artista',
      label: 'Artista',
      width: '180px',
      render: (booking) => (
        <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center' }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: booking.artist?.color ?? theme.palette.action.disabled,
              flexShrink: 0,
            }}
          />
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {booking.artist?.name ?? '—'}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'telefono',
      label: 'Telefono',
      width: '150px',
      render: (booking) => (
        <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center' }}>
          {booking.customer?.phone ? (
            <>
              <Phone size={12} color={theme.palette.primary.main} />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  color: theme.palette.text.secondary,
                }}
              >
                {booking.customer.phone}
              </Typography>
            </>
          ) : (
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
              —
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      key: 'data_ora',
      label: 'Data & Ora',
      width: '170px',
      render: (booking) => (
        <Stack useFlexGap sx={{ gap: 0.25 }}>
          <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center' }}>
            <Clock size={13} color={theme.palette.primary.main} />
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {format(new Date(booking.date), 'dd MMM yyyy', { locale: it })}
            </Typography>
          </Stack>
          <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center' }}>
            <Clock size={11} />
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {format(new Date(booking.date), 'HH:mm')}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      key: 'durata',
      label: 'Durata',
      align: 'center',
      width: '110px',
      render: (booking) => (
        <Stack direction="row" useFlexGap sx={{ gap: 0.75, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Timer size={12} color={theme.palette.primary.main} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.secondary,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {booking.duration} min
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'prenotato_il',
      label: 'Prenotato il',
      width: '125px',
      render: (booking) => (
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {format(new Date(booking.createdAt), 'dd MMM yyyy', { locale: it })}
        </Typography>
      ),
    },
    {
      key: 'stato',
      label: 'Stato',
      width: '120px',
      render: (booking) => (
        <Chip
          label={STATUS_CONFIG[booking.status]?.label ?? booking.status}
          color={STATUS_CONFIG[booking.status]?.color ?? 'default'}
          variant="filled"
          size="small"
        />
      ),
    },
    {
      key: 'prezzo',
      label: 'Prezzo',
      align: 'right',
      width: '110px',
      render: (booking) => (
        <Box sx={{ textAlign: 'right', width: '100%' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {booking.price != null ? `€ ${booking.price.toFixed(2)}` : '—'}
          </Typography>
          {booking.deposit != null && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: 'block',
                mt: 0.25,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              acc. € {booking.deposit.toFixed(2)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'saldo',
      label: 'Saldo',
      align: 'right',
      width: '110px',
      render: (booking) => {
        if (booking.status === 'COMPLETED') {
          return (
            <Box sx={{ textAlign: 'right', width: '100%' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.success.main,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                € 0.00
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.success.main,
                  opacity: 0.6,
                  display: 'block',
                  mt: 0.25,
                }}
              >
                Fine
              </Typography>
            </Box>
          );
        }

        if (booking.status === 'CANCELLED') {
          return (
            <Box sx={{ textAlign: 'right', width: '100%' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                € 0.00
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  opacity: 0.6,
                  display: 'block',
                  mt: 0.25,
                }}
              >
                —
              </Typography>
            </Box>
          );
        }

        if (booking.price == null) {
          return (
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
              —
            </Typography>
          );
        }

        const remaining = booking.price - (booking.deposit ?? 0);
        return (
          <Box sx={{ textAlign: 'right', width: '100%' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: remaining <= 0 ? theme.palette.success.main : theme.palette.warning.main,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              € {remaining.toFixed(2)}
            </Typography>
            {remaining <= 0 && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.success.main,
                  opacity: 0.6,
                  display: 'block',
                  mt: 0.25,
                }}
              >
                Saldato
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      key: 'note',
      label: 'Note',
      width: '160px',
      render: (booking) => (
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxWidth: 160,
          }}
        >
          {booking.notes || '—'}
        </Typography>
      ),
    },
  ], [theme]);

  const exportFilters: ExportFilter<Booking>[] = useMemo(() => [
    {
      key: 'cliente',
      label: 'Cliente',
      type: 'text',
      placeholder: 'Cerca per nome...',
      filterFn: (b, v) => {
        const name = `${b.customer?.firstName ?? ''} ${b.customer?.lastName ?? ''}`.toLowerCase();
        return name.includes(v.toLowerCase());
      },
    },
    {
      key: 'artista',
      label: 'Artista',
      type: 'text',
      placeholder: 'Cerca per artista...',
      filterFn: (b, v) => {
        if (!v) return true;
        return b.artist?.name?.toLowerCase().includes(v.toLowerCase()) ?? false;
      },
    },
    {
      key: 'stato',
      label: 'Stato',
      type: 'select',
      options: [
        { value: '', label: 'Tutti gli stati' },
        { value: 'CONFIRMED', label: 'Confermato' },
        { value: 'COMPLETED', label: 'Completato' },
        { value: 'CANCELLED', label: 'Annullato' },
        { value: 'RESCHEDULED', label: 'Spostato' },
      ],
      filterFn: (b, v) => !v || b.status === v,
    },
    {
      key: 'mese',
      label: 'Mese',
      type: 'month',
      filterFn: (b, v) => {
        if (!v) return true;
        const bookingMonth = format(new Date(b.date), 'yyyy-MM');
        return bookingMonth === v;
      },
    },
  ], []);

  const handleComplete = async (id: number) => {
    try {
      await bookingService.update(id, { status: 'COMPLETED' });
      await mutate();
    } catch {
      // errore silenzioso — il toast viene gestito dal service
    }
  };

  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
    if (isSuperAdmin) {
      setShowDeletePasswordModal(false);
      handleSuperAdminDelete(id);
    } else {
      setShowDeletePasswordModal(true);
    }
  };

  const handleSuperAdminDelete = async (id: number) => {
    await bookingService.delete(id);
    await mutate();
  };

  const handlePasswordDelete = async (password: string) => {
    if (!pendingDeleteId) return;
    setDeletePasswordLoading(true);
    try {
      await bookingService.verifyPassword(password);
      setShowDeletePasswordModal(false);
      const idToDelete = pendingDeleteId;
      setPendingDeleteId(null);
      await bookingService.delete(idToDelete);
      await mutate();
    } catch {
      throw new Error('Password non corretta');
    } finally {
      setDeletePasswordLoading(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <PageHeader
        title="Prenotazioni"
        actions={
          <>
            <ExportModal
              filenameBase={`prenotazioni-${month}`}
              title={`Prenotazioni — ${monthLabel}`}
              rows={bookings || []}
              columns={exportColumns}
              filters={exportFilters}
              filtersLabel={`Mese: ${monthLabel}`}
              resolveRows={async () => bookings || []}
            />
            <PermissionGate requireAdmin>
              <MuiButton
                variant="contained"
                color="primary"
                startIcon={<Plus size={18} />}
                onClick={() => { setEditingBooking(null); setIsModalOpen(true); }}
              >
                Nuova Prenotazione
              </MuiButton>
            </PermissionGate>
          </>
        }
      >
        <Stack
          direction="row"
          useFlexGap
          sx={{
            gap: 1.25,
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', xl: 'center' },
            flex: '1 1 auto',
            minWidth: 0,
            flexWrap: { xs: 'wrap', xl: 'nowrap' },
          }}
        >
          <Stack
            direction="row"
            useFlexGap
            sx={{ gap: 0.5, alignItems: 'center', flexShrink: 0 }}
          >
            <IconButton
              size="small"
              onClick={prevMonth}
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
              onClick={nextMonth}
              sx={{ p: 0.75 }}
            >
              <ChevronRight size={16} />
            </IconButton>
          </Stack>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 240px' }, minWidth: { xs: '100%', xl: 240 }, maxWidth: { xs: '100%', xl: 320 } }}>
            <SearchInput
              value={search}
              onChange={(v) => setSearch(v)}
              placeholder="Cerca cliente, artista, telefono..."
            />
          </Box>

          <Stack
            direction="row"
            useFlexGap
            sx={{ gap: 0.75, alignItems: 'center', flexShrink: 0, flexWrap: { xs: 'wrap', md: 'nowrap' } }}
          >
            <TextField
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="small"
              sx={{ width: 138 }}
            />
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.8125rem' }}>
              —
            </Typography>
            <TextField
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="small"
              sx={{ width: 138 }}
            />
            {(startDate || endDate) && (
              <MuiButton
                variant="text"
                size="small"
                onClick={() => { setStartDate(''); setEndDate(''); }}
              >
                Reset
              </MuiButton>
            )}
          </Stack>

          {/* Cancelled checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={showCancelled}
                onChange={(e) => setShowCancelled(e.target.checked)}
              />
            }
            label="Annullate"
            sx={{
              ml: 0,
              mr: 0,
              flexShrink: 0,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.8125rem',
              },
            }}
          />
        </Stack>
      </PageHeader>

      {error && (
        <StatePanel
          variant="error"
          fullPage
          title="Impossibile caricare le prenotazioni"
          description="Riprova tra qualche secondo o aggiorna la pagina."
        />
      )}

      {!error && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <DataTable<Booking>
            columns={bookingColumns}
            data={filteredBookings}
            isLoading={isLoading}
            emptyMessage={
              debouncedSearch
                ? 'Nessun risultato. Prova a modificare i termini di ricerca.'
                : 'Nessuna prenotazione per questo mese.'
            }
            keyExtractor={(booking) => booking.id}
            pageSize={8}
            actions={(booking) => (
              <Stack direction="row" useFlexGap sx={{ gap: 0.5, justifyContent: 'center', width: '100%' }}>
                <PermissionGate requireAdmin>
                  <>
                    {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                      <Button
                        variant="icon"
                        icon={<CheckCircle2 size={18} />}
                        title="Completato"
                        sx={{
                          color: `${theme.palette.success.main}99`,
                          '&:hover': {
                            color: theme.palette.success.main,
                            backgroundColor: `${theme.palette.success.main}10`,
                          },
                        }}
                        onClick={() => handleComplete(booking.id)}
                      />
                    )}
                    <Button
                      variant="icon"
                      icon={<Edit size={18} />}
                      title="Modifica"
                      onClick={() => { setEditingBooking(booking); setIsModalOpen(true); }}
                    />
                    <Button
                      variant="icon"
                      icon={<Trash2 size={18} />}
                      sx={{
                        color: `${theme.palette.error.main}99`,
                        '&:hover': {
                          color: theme.palette.error.main,
                          backgroundColor: `${theme.palette.error.main}10`,
                        },
                      }}
                      title="Elimina"
                      onClick={() => handleDelete(booking.id)}
                    />
                  </>
                </PermissionGate>
              </Stack>
            )}
          />
        </Box>
      )}

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
        booking={editingBooking}
      />
      <ConfirmDialog {...confirmDialogProps} />
      {!isSuperAdmin && (
        <PasswordConfirmModal
          isOpen={showDeletePasswordModal}
          onClose={() => {
            setShowDeletePasswordModal(false);
            setPendingDeleteId(null);
          }}
          onConfirm={handlePasswordDelete}
          loading={deletePasswordLoading}
        />
      )}
    </Box>
  );
}
