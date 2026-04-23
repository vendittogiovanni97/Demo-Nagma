"use client";

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import PageHeader from '@/components/layout/PageHeader';
import DataTable, { type Column } from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import { bookingHistoryService, type BookingHistoryEntry, type BookingAction, type BookingHistoryResponse } from '@/services/booking-history.service';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, User, Clock, History, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

const ACTION_CONFIG: Record<BookingAction, { label: string; className: string }> = {
  CREATED: { label: 'Creato', className: 'bg-blue-500/15 text-blue-400' },
  UPDATED: { label: 'Modificato', className: 'bg-amber-500/15 text-amber-400' },
  RESCHEDULED: { label: 'Spostato', className: 'bg-purple-500/15 text-purple-400' },
  CANCELLED: { label: 'Annullato', className: 'bg-red-500/15 text-red-400' },
  COMPLETED: { label: 'Completato', className: 'bg-emerald-500/15 text-emerald-400' },
};

const ACTION_OPTIONS: { value: BookingAction | ''; label: string }[] = [
  { value: '', label: 'Tutte le azioni' },
  { value: 'CREATED', label: 'Creato' },
  { value: 'UPDATED', label: 'Modificato' },
  { value: 'RESCHEDULED', label: 'Spostato' },
  { value: 'CANCELLED', label: 'Annullato' },
  { value: 'COMPLETED', label: 'Completato' },
];

export default function BookingHistoryPage() {
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

  const renderDateChange = (entry: BookingHistoryEntry) => {
    const actionType = entry.action;
    
    if (entry.oldDate || entry.newDate) {
      return (
        <div className="text-sm">
          {entry.oldDate && (
            <span className="text-red-400 line-through mr-2">
              {format(new Date(entry.oldDate), 'dd/MM/yyyy HH:mm', { locale: it })}
            </span>
          )}
          {entry.newDate && (
            <span className="text-emerald-400">
              {format(new Date(entry.newDate), 'dd/MM/yyyy HH:mm', { locale: it })}
            </span>
          )}
        </div>
      );
    }
    
    if (actionType === 'CREATED') {
      return <span className="text-blue-400 text-sm">Nuova prenotazione</span>;
    }
    if (actionType === 'CANCELLED') {
      return <span className="text-red-400 text-sm">Prenotazione annullata</span>;
    }
    if (actionType === 'COMPLETED') {
      return <span className="text-emerald-400 text-sm">Prenotazione completata</span>;
    }
    
    return <span className="text-text-secondary text-sm">—</span>;
  };

  const columns: Column<BookingHistoryEntry>[] = useMemo(() => [
    {
      key: 'changedAt',
      label: 'Data',
      width: '150px',
      render: (entry) => (
        <div className="flex items-center gap-1.5 text-sm text-white">
          <CalendarDays size={14} className="text-accent shrink-0" />
          {format(new Date(entry.changedAt), 'dd MMM yyyy', { locale: it })}
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Azione',
      width: '120px',
      render: (entry) => {
        const cfg = ACTION_CONFIG[entry.action];
        return (
          <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide', cfg?.className)}>
            {getActionLabel(entry.action)}
          </span>
        );
      },
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (entry) => entry.booking?.customer ? (
        <div>
          <div className="text-white font-semibold">
            {entry.booking.customer.firstName} {entry.booking.customer.lastName}
          </div>
          <div className="text-xs text-text-secondary font-mono">{entry.booking.customer.phone}</div>
        </div>
      ) : <span className="text-text-secondary/40">—</span>,
    },
    {
      key: 'artista',
      label: 'Artista',
      width: '140px',
      render: (entry) => entry.booking?.artist ? (
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0 ring-1 ring-white/10"
            style={{ backgroundColor: entry.booking.artist.color }}
          />
          <span className="text-sm text-text-secondary">{entry.booking.artist.name}</span>
        </div>
      ) : <span className="text-text-secondary/40 text-sm">—</span>,
    },
    {
      key: 'data',
      label: 'Dettagli',
      render: (entry) => renderDateChange(entry),
    },
    {
      key: 'changedByUser',
      label: 'Utente',
      width: '150px',
      render: (entry) => (
        <div className="flex items-center gap-1.5 text-sm text-white">
          <User size={12} className="text-accent shrink-0" />
          <span className="truncate font-medium">{entry.changedByUser?.name || 'Sistema'}</span>
        </div>
      ),
    },
  ], []);

  return (
    <div className="flex-1 flex flex-col gap-6">
      <PageHeader
        title="Storico Prenotazioni"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-secondary font-medium">Dal:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-secondary font-medium">Al:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as BookingAction | '')}
              className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" size="sm" onClick={handleSearch}>
            Filtra
          </Button>
        </div>
      </PageHeader>

      {error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-400">
          <AlertCircle size={40} className="opacity-60" />
          <p className="text-sm">Errore nel caricamento dei dati</p>
        </div>
      )}

      {!error && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <DataTable<BookingHistoryEntry>
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="Nessuna modifica trovata per i filtri selezionati."
            keyExtractor={(entry) => entry.id}
          />
        </div>
      )}

      {!error && data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4 border-t border-surface-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevPage}
            disabled={page <= 1}
            icon={<ChevronLeft size={16} />}
          >
            Precedente
          </Button>
          <span className="text-sm text-text-secondary">
            Pagina {page} di {data.totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            disabled={page >= data.totalPages}
            icon={<ChevronRight size={16} />}
          >
            Successiva
          </Button>
        </div>
      )}
    </div>
  );
}