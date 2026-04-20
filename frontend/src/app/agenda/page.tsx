"use client";

import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import itLocale from '@fullcalendar/core/locales/it';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg, EventContentArg } from '@fullcalendar/core';

import StatePanel from '@/components/feedback/StatePanel';
import SearchInput from '@/components/forms/SearchInput';
import PageHeader from '@/components/layout/PageHeader';
import BookingModal from '@/components/modals/BookingModal';
import ExportModal, { type ExportFilter } from '@/components/modals/ExportModal';
import WhatsAppSendModal from '@/components/modals/WhatsAppSendModal';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/hooks/domain';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { bookingService } from '@/services/booking.service';
import type { Booking } from '@/types/booking';
import { format, parseISO, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { Clock, MessageCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface EventContentProps {
  booking: Booking;
  canSendWhatsApp: boolean;
  onEdit: (b: Booking) => void;
  onDelete: (id: number) => void;
  onWhatsApp: (b: Booking) => void;
}

function CalendarEvent({ booking, canSendWhatsApp, onEdit, onDelete, onWhatsApp }: EventContentProps) {
  const color = booking.artist?.color ?? '#00BFFF';
  const isShort = (booking.duration ?? 60) <= 30;

  return (
    <div className="h-full overflow-hidden px-2 py-1 flex flex-col gap-0.5 relative group/ev cursor-pointer select-none">
      <p className="font-bold text-white text-xs truncate leading-tight">
        {booking.customer?.firstName} {booking.customer?.lastName}
      </p>
      {!isShort && (
        <p className="text-[10px] font-semibold truncate leading-tight" style={{ color }}>
          ● {booking.artist?.name}
        </p>
      )}

      <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover/ev:opacity-100 transition-opacity z-10">
        {canSendWhatsApp && booking.customer?.id && (
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onWhatsApp(booking); }}
            className="w-5 h-5 flex items-center justify-center rounded bg-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
            title="WhatsApp"
          >
            <MessageCircle size={11} />
          </button>
        )}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onEdit(booking); }}
          className="w-5 h-5 flex items-center justify-center rounded bg-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
          title="Modifica"
        >
          <Pencil size={11} />
        </button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDelete(booking.id); }}
          className="w-5 h-5 flex items-center justify-center rounded bg-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
          title="Elimina"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const { can } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [whatsAppBooking, setWhatsAppBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [initialDate, setInitialDate] = useState('');
  const [initialTime, setInitialTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));

  const { deleteItem, confirmDialogProps } = useDeleteConfirm();
  const { data: bookings, mutate, isLoading, error } = useBookings(currentMonth);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    const q = search.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) => {
      const haystack = [b.customer?.firstName, b.customer?.lastName, b.artist?.name]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [bookings, search]);

  const artistOptions = useMemo(() => {
    const seen = new Set<number>();
    const opts: { value: string; label: string }[] = [{ value: '', label: 'Tutti gli artisti' }];
    (bookings ?? []).forEach(b => {
      if (b.artist && !seen.has(b.artistId)) {
        seen.add(b.artistId);
        opts.push({ value: b.artistId.toString(), label: b.artist.name });
      }
    });
    return opts;
  }, [bookings]);

  const exportFilters: ExportFilter<Booking>[] = useMemo(() => [
    {
      key: 'cliente',
      label: 'Cliente',
      type: 'text',
      placeholder: 'Cerca per nome...',
      filterFn: (b, v) =>
        `${b.customer?.firstName ?? ''} ${b.customer?.lastName ?? ''}`.toLowerCase().includes(v.toLowerCase()),
    },
    {
      key: 'artista',
      label: 'Artista',
      type: 'select',
      options: artistOptions,
      filterFn: (b, v) => !v || b.artistId.toString() === v,
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
        { value: 'RESCHEDULED', label: 'Riprogrammato' },
      ],
      filterFn: (b, v) => !v || b.status === v,
    },
    {
      key: 'dal',
      label: 'Dal',
      type: 'date',
      filterFn: (b, v) => !v || new Date(b.date).toISOString().slice(0, 10) >= v,
    },
    {
      key: 'al',
      label: 'Al',
      type: 'date',
      filterFn: (b, v) => !v || new Date(b.date).toISOString().slice(0, 10) <= v,
    },
  ], [artistOptions]);

  const events = useMemo(() =>
    filteredBookings.map((booking) => ({
      id: booking.id.toString(),
      start: booking.date,
      end: new Date(new Date(booking.date).getTime() + (booking.duration ?? 60) * 60000).toISOString(),
      extendedProps: { booking },
      backgroundColor: `${booking.artist?.color ?? '#00BFFF'}22`,
      borderColor: booking.artist?.color ?? '#00BFFF',
      textColor: '#ffffff',
    })),
    [filteredBookings]
  );

  const handleDeleteBooking = useCallback(async (id: number) => {
    await deleteItem({
      confirmMessage: 'Sei sicuro di voler eliminare questa prenotazione?',
      action: () => bookingService.delete(id),
      successMessage: 'Prenotazione eliminata',
      errorMessage: "Errore nell'eliminazione",
      onSuccess: mutate,
    });
  }, [deleteItem, mutate]);

  const handleEditBooking = useCallback((booking: Booking) => {
    setEditingBooking(booking);
    setInitialDate('');
    setInitialTime('');
    setIsModalOpen(true);
  }, []);

  const handleDateClick = useCallback((arg: DateClickArg) => {
    const d = new Date(arg.date);
    setEditingBooking(null);
    setInitialDate(format(d, 'yyyy-MM-dd'));
    setInitialTime(format(d, 'HH:mm'));
    setIsModalOpen(true);
  }, []);

  const handleEventClick = useCallback((arg: EventClickArg) => {
    const booking = arg.event.extendedProps.booking as Booking;
    handleEditBooking(booking);
  }, [handleEditBooking]);

  return (
    <div className="flex-1 flex flex-col gap-4">
      <PageHeader
        title="Agenda Studio"
        actions={
          <>
            <ExportModal
              filenameBase="agenda"
              title="Agenda Studio"
              rows={filteredBookings}
              columns={[
                { label: 'Data', value: (b: Booking) => format(parseISO(b.date), 'dd/MM/yyyy HH:mm', { locale: it }) },
                { label: 'Cliente', value: (b: Booking) => `${b.customer?.firstName || ''} ${b.customer?.lastName || ''}`.trim() },
                { label: 'Artista', value: (b: Booking) => b.artist?.name || '' },
                { label: 'Stato', value: (b: Booking) => b.status },
                { label: 'Durata (min)', value: (b: Booking) => b.duration?.toString() || '' },
                { label: 'Prezzo (€)', value: (b: Booking) => b.price?.toString() || '' },
              ]}
              filters={exportFilters}
            />
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setEditingBooking(null);
                setInitialDate('');
                setInitialTime('');
                setIsModalOpen(true);
              }}
            >
              Nuovo
            </Button>
          </>
        }
      >
        <div className="flex-1 max-w-3xl mx-auto flex items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Cerca cliente, artista..." />
        </div>
      </PageHeader>

      <div
        className="fc-nagma-wrapper border border-surface-border rounded-2xl overflow-hidden"
        style={{ height: 'calc(100vh - 210px)' }}
      >
        {isLoading ? (
          <StatePanel
            variant="loading"
            fullPage
            icon={Clock}
            title="Carico l'agenda"
            description="Sto recuperando gli appuntamenti."
          />
        ) : error ? (
          <StatePanel
            variant="error"
            fullPage
            title="Impossibile caricare l'agenda"
            description="Controlla la connessione o riprova tra poco."
          />
        ) : (
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale={itLocale}
            firstDay={1}
            slotMinTime="08:00:00"
            slotMaxTime="21:00:00"
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridWeek,timeGridDay',
            }}
            buttonText={{ today: 'Oggi', week: 'Settimana', day: 'Giorno' }}
            events={events}
            eventContent={(arg: EventContentArg) => (
              <CalendarEvent
                booking={arg.event.extendedProps.booking as Booking}
                canSendWhatsApp={can.sendWhatsApp}
                onEdit={handleEditBooking}
                onDelete={handleDeleteBooking}
                onWhatsApp={setWhatsAppBooking}
              />
            )}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="100%"
            allDaySlot={false}
            nowIndicator
            datesSet={(arg) => {
              const visibleStart = format(arg.start, 'yyyy-MM');
              const visibleEnd = format(subDays(arg.end, 1), 'yyyy-MM');
              if (visibleEnd !== visibleStart) {
                // Week spans two months — fetch the month with more days visible
                const mid = new Date((arg.start.getTime() + arg.end.getTime()) / 2);
                setCurrentMonth(format(mid, 'yyyy-MM'));
              } else {
                setCurrentMonth(visibleStart);
              }
            }}
          />
        )}
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBooking(null); }}
        onSuccess={() => mutate()}
        booking={editingBooking}
        initialDate={initialDate}
        initialTime={initialTime}
      />
      <WhatsAppSendModal
        isOpen={!!whatsAppBooking}
        onClose={() => setWhatsAppBooking(null)}
        booking={whatsAppBooking}
      />
      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
