"use client";

import StatePanel from '@/components/feedback/StatePanel';
import PageHeader from '@/components/layout/PageHeader';
import DataTable, { type Column } from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import BookingModal from '@/components/modals/BookingModal';
import ExportModal from '@/components/modals/ExportModal';
import PermissionGate from '@/components/auth/PermissionGate';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Avatar from '@/components/data-display/Avatar';
import { useBookings } from '@/hooks/domain/useBookings';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { bookingService } from '@/services/booking.service';
import type { Booking, BookingStatus } from '@/types/booking';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Edit, Plus, Trash2 } from 'lucide-react';
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const month = monthKey(currentMonth);
  const { data: bookings, mutate, isLoading, error } = useBookings(month);

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: it });

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
      key: 'data',
      label: 'Data & Ora',
      width: '170px',
      render: (b) => (
        <div>
          <div className="flex items-center gap-1.5 text-sm text-white font-medium tabular-nums">
            <CalendarDays size={13} className="text-accent shrink-0" />
            {format(new Date(b.date), 'dd MMM yyyy', { locale: it })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5 tabular-nums">
            <Clock size={11} className="shrink-0" />
            {format(new Date(b.date), 'HH:mm')}
            <span className="text-text-secondary/50">·</span>
            {b.duration} min
          </div>
        </div>
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
      key: 'note',
      label: 'Note',
      render: (b) => b.notes ? (
        <span className="text-xs text-text-secondary line-clamp-2 max-w-[180px]">{b.notes}</span>
      ) : <span className="text-text-secondary/30 text-sm">—</span>,
    },
  ], []);

  const handleDelete = async (id: number) => {
    await deleteItem({
      confirmMessage: 'Sei sicuro di voler eliminare questa prenotazione?',
      action: () => bookingService.delete(id),
      successMessage: 'Prenotazione eliminata',
      errorMessage: "Errore durante l'eliminazione",
      onSuccess: mutate,
    });
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={prevMonth} icon={<ChevronLeft size={16} />} className="p-2" />
          <span className="text-sm font-semibold text-white capitalize min-w-[140px] text-center">
            {monthLabel}
          </span>
          <Button variant="ghost" size="sm" onClick={nextMonth} icon={<ChevronRight size={16} />} className="p-2" />
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
            data={bookings || []}
            isLoading={isLoading}
            emptyMessage="Nessuna prenotazione per questo mese."
            keyExtractor={(b) => b.id}
            actions={(b) => (
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGate requireAdmin>
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingBooking(b); setIsModalOpen(true); }}
                      icon={<Edit size={16} />}
                      className="p-2"
                      title="Modifica"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(b.id)}
                      icon={<Trash2 size={16} />}
                      className="p-2"
                      title="Elimina"
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
    </div>
  );
}
