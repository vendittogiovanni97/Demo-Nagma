"use client";

import PermissionGate from '@/components/auth/PermissionGate';
import Avatar from '@/components/data-display/Avatar';
import DataTable, { type Column } from '@/components/data-display/DataTable';
import StatePanel from '@/components/feedback/StatePanel';
import SearchInput from '@/components/forms/SearchInput';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
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
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Edit, Phone, Plus, Timer, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  CONFIRMED: { label: 'Confermato', className: 'bg-accent/15 text-accent' },
  COMPLETED: { label: 'Completato', className: 'bg-emerald-500/15 text-emerald-400' },
  CANCELLED: { label: 'Annullato', className: 'bg-red-500/15 text-red-400' },
  RESCHEDULED: { label: 'Spostato', className: 'bg-amber-500/15 text-amber-400' },
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

  const columns: Column<Booking>[] = useMemo(() => [
    {
      key: 'cliente',
      label: 'Cliente',
      render: (b) => b.customer ? (
        <div className="flex items-center gap-3">
          <Avatar firstName={b.customer.firstName} lastName={b.customer.lastName} />
          <div>
            <div className="text-white font-semibold leading-tight">
              {b.customer.firstName} {b.customer.lastName}
            </div>
            {b.customer.phone && (
              <div className="text-xs text-text-secondary mt-0.5 font-mono">{b.customer.phone}</div>
            )}
          </div>
        </div>
      ) : <span className="text-text-secondary/40">—</span>,
    },
    {
      key: 'artista',
      label: 'Artista',
      width: '160px',
      render: (b) => (
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/10"
            style={{ backgroundColor: b.artist?.color ?? '#4b5563' }}
          />
          <span className="text-sm text-text-secondary font-medium">{b.artist?.name ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'telefono',
      label: 'Telefono',
      width: '150px',
      render: (b) => b.customer?.phone ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Phone size={12} className="text-accent shrink-0" />
          <span className="font-mono tracking-wide">{b.customer.phone}</span>
        </div>
      ) : <span className="text-text-secondary/30 text-sm">—</span>,
    },
    {
      key: 'data',
      label: 'Data & Ora',
      width: '150px',
      render: (b) => (
        <div>
          <div className="flex items-center gap-1.5 text-sm text-white font-medium tabular-nums">
            <CalendarDays size={13} className="text-accent shrink-0" />
            {format(new Date(b.date), 'dd MMM yyyy', { locale: it })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5 tabular-nums">
            <Clock size={11} className="shrink-0" />
            {format(new Date(b.date), 'HH:mm')}
          </div>
        </div>
      ),
    },
    {
      key: 'durata',
      label: 'Durata',
      align: 'center',
      width: '100px',
      render: (b) => (
        <div className="flex items-center justify-center gap-1.5 text-sm text-text-secondary tabular-nums">
          <Timer size={12} className="text-accent shrink-0" />
          {b.duration} min
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Prenotato il',
      width: '130px',
      render: (b) => (
        <span className="text-xs text-text-secondary tabular-nums">
          {format(new Date(b.createdAt), 'dd MMM yyyy', { locale: it })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Stato',
      width: '130px',
      render: (b) => {
        const cfg = STATUS_CONFIG[b.status];
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${cfg?.className ?? ''}`}>
            {cfg?.label ?? b.status}
          </span>
        );
      },
    },
    {
      key: 'prezzo',
      label: 'Prezzo',
      align: 'right',
      width: '130px',
      render: (b) => (
        <div className="text-right">
          <div className="text-sm text-white font-semibold tabular-nums">
            {b.price != null ? `€ ${b.price.toFixed(2)}` : '—'}
          </div>
          {b.deposit != null && (
            <div className="text-xs text-text-secondary tabular-nums mt-0.5">
              acc. € {b.deposit.toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'saldo',
      label: 'Saldo',
      align: 'right',
      width: '110px',
      render: (b) => {
        if (b.status === 'COMPLETED') {
          return (
            <div className="text-right">
              <span className="text-sm font-semibold tabular-nums text-emerald-400">€ 0.00</span>
              <div className="text-[10px] text-emerald-400/60 mt-0.5">Fine</div>
            </div>
          );
        }
        if (b.status === 'CANCELLED') {
          return (
            <div className="text-right">
              <span className="text-sm font-semibold tabular-nums text-text-secondary">€ 0.00</span>
              <div className="text-[10px] text-text-secondary/60 mt-0.5">—</div>
            </div>
          );
        }
        if (b.price == null) return <span className="text-text-secondary/30 text-sm text-right block">—</span>;
        const saldo = b.price - (b.deposit ?? 0);
        return (
          <div className="text-right">
            <span className={`text-sm font-semibold tabular-nums ${saldo <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              € {saldo.toFixed(2)}
            </span>
            {saldo <= 0 && (
              <div className="text-[10px] text-emerald-400/60 mt-0.5">Saldato</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'note',
      label: 'Note',
      render: (b) => b.notes ? (
        <span className="text-xs text-text-secondary line-clamp-2 max-w-45">{b.notes}</span>
      ) : <span className="text-text-secondary/30 text-sm">—</span>,
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
    <div className="flex-1 flex flex-col gap-6">
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
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => { setEditingBooking(null); setIsModalOpen(true); }}
              >
                Nuova Prenotazione
              </Button>
            </PermissionGate>
          </>
        }
      >
        <div className="flex items-center justify-center gap-4 flex-1">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={prevMonth} icon={<ChevronLeft size={16} />} className="p-2" />
            <span className="text-sm font-semibold text-white capitalize min-w-35 text-center">
              {monthLabel}
            </span>
            <Button variant="ghost" size="sm" onClick={nextMonth} icon={<ChevronRight size={16} />} className="p-2" />
          </div>
          <div className="w-72">
            <SearchInput
              value={search}
              onChange={(v) => setSearch(v)}
              placeholder="Cerca cliente, artista, telefono..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-accent w-36"
            />
            <span className="text-text-secondary text-sm">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-accent w-36"
            />
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs"
              >
                Reset
              </Button>
            )}
            <label className="flex items-center gap-2 text-sm cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={showCancelled}
                onChange={(e) => setShowCancelled(e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-text-secondary">Annullate</span>
            </label>
          </div>
        </div>
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
        <div className="flex-1 flex flex-col overflow-hidden">
          <DataTable<Booking>
            columns={columns}
            data={filteredBookings}
            isLoading={isLoading}
            emptyMessage={
              debouncedSearch
                ? 'Nessun risultato. Prova a modificare i termini di ricerca.'
                : 'Nessuna prenotazione per questo mese.'
            }
            keyExtractor={(b) => b.id}
            actions={(b) => (
              <div className="flex items-center justify-center gap-2 w-full">
                <PermissionGate requireAdmin>
                  <>
                    {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                      <Button
                        variant="icon"
                        icon={<CheckCircle2 size={18} />}
                        className="text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-400/10"
                        title="Completato"
                        onClick={() => handleComplete(b.id)}
                        aria-label="Segna come completato"
                      />
                    )}
                    <Button
                      variant="icon"
                      icon={<Edit size={18} />}
                      title="Modifica"
                      onClick={() => { setEditingBooking(b); setIsModalOpen(true); }}
                      aria-label="Modifica prenotazione"
                    />
                    <Button
                      variant="icon"
                      icon={<Trash2 size={18} />}
                      className="text-danger/60 hover:text-danger hover:bg-danger/10"
                      title="Elimina"
                      onClick={() => handleDelete(b.id)}
                      aria-label="Elimina prenotazione"
                    />
                  </>
                </PermissionGate>
              </div>
            )}
          />
        </div>
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
    </div>
  );
}
