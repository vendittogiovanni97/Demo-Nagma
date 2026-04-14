"use client";

import BookingModal from '@/components/modals/BookingModal';
import ExportModal from '@/components/modals/ExportModal';
import WhatsAppSendModal from '@/components/modals/WhatsAppSendModal';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/hooks/domain';
import { bookingService } from '@/services/booking.service';
import type { Booking } from '@/types/booking';
import { canSendWhatsApp } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';
import { addDays, addWeeks, eachDayOfInterval, format, isSameDay, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, MessageCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 9);

export default function AgendaPage() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [whatsAppBooking, setWhatsAppBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const canSendMessages = canSendWhatsApp(user?.role);

  const monthStr = format(weekStart, 'yyyy-MM');
  const { data: bookings, mutate, isLoading, error } = useBookings(monthStr);

  const weekDays = useMemo(() =>
    eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) }),
    [weekStart]
  );

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return bookings;

    return bookings.filter((booking) => {
      const haystack = [
        booking.customer?.firstName,
        booking.customer?.lastName,
        booking.artist?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [bookings, search]);

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) return;
    try {
      await bookingService.delete(id);
      notifySuccess('Prenotazione eliminata');
      mutate();
    } catch (err: unknown) {
      notifyError(err, 'Errore nell\'eliminazione');
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header: Title left, Search center, Actions right */}
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-outfit font-bold text-white">Agenda Studio</h1>
        </div>

        {/* Search + Week Nav - Center */}
        <div className="flex-1 max-w-3xl mx-auto flex items-center gap-3">
          {/* Week navigation */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-surface-border">
            <button onClick={() => setWeekStart(w => subWeeks(w, 1))} className="p-2 hover:bg-white/10 rounded-md transition">
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 font-bold text-xs min-w-32 text-center uppercase tracking-widest text-accent">
              {format(weekStart, 'dd MMM', { locale: it })} — {format(addDays(weekStart, 6), 'dd MMM yyyy', { locale: it })}
            </span>
            <button onClick={() => setWeekStart(w => addWeeks(w, 1))} className="p-2 hover:bg-white/10 rounded-md transition">
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="text-xs font-bold uppercase tracking-wider px-3 py-2 bg-white/5 border border-surface-border rounded-lg hover:bg-accent hover:text-black transition-colors shrink-0"
          >
            Oggi
          </button>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca cliente, artista..."
              className="w-full rounded-xl border border-surface-border bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-accent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ExportModal
            filenameBase="agenda"
            title="Agenda Studio"
            rows={filteredBookings}
            columns={[
              {
                label: 'Data',
                value: (booking: Booking) =>
                  format(parseISO(booking.date), 'dd/MM/yyyy HH:mm', { locale: it }),
              },
              {
                label: 'Cliente',
                value: (booking: Booking) =>
                  `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim(),
              },
              { label: 'Artista', value: (booking: Booking) => booking.artist?.name || '' },
              { label: 'Stato', value: (booking: Booking) => booking.status },
            ]}
            filtersLabel={`Settimana: ${format(weekStart, 'dd/MM/yyyy')} - Ricerca: ${search || 'nessuna'}`}
          />
          <button
            onClick={() => {
              setEditingBooking(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <Plus size={20} />
            <span>Nuovo</span>
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 glass-panel p-0 overflow-hidden flex flex-col min-h-0 rounded-2xl">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-surface-border bg-white/2">
          <div className="py-3 border-r border-surface-border flex items-center justify-center">
            <Clock size={16} className="text-text-secondary" />
          </div>
          {weekDays.map(day => (
            <div
              key={day.toISOString()}
              className={`py-3 text-center border-r border-surface-border last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-accent/10' : ''}`}
            >
              <div className="text-[10px] text-text-secondary uppercase tracking-[2px] font-bold">
                {format(day, 'EEE', { locale: it })}
              </div>
              <div className={`text-lg font-outfit font-black ${isSameDay(day, new Date()) ? 'text-accent' : 'text-white'}`}>
                {format(day, 'dd')}
              </div>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Clock size={24} className="text-accent" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Carico l&apos agenda</h3>
              <p className="text-sm text-text-secondary">Sto recuperando gli appuntamenti della settimana.</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Impossibile caricare l&apos agenda</h3>
              <p className="text-sm text-text-secondary">Controlla la connessione o riprova tra poco.</p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {search ? 'Nessun risultato trovato' : 'Nessun appuntamento questa settimana'}
              </h3>
              <p className="text-sm text-text-secondary">
                {search
                  ? 'Prova a modificare i termini di ricerca.'
                  : 'Clicca "Nuovo" per aggiungere il primo appuntamento.'}
              </p>
            </div>
          </div>
        ) : (
          /* Time grid */
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-[60px_repeat(7,1fr)]">
              {/* Hours column */}
              <div className="border-r border-surface-border bg-white/1">
                {HOURS.map(h => (
                  <div key={h} className="h-25 border-b border-surface-border/30 flex items-start justify-center pt-2 text-xs font-bold text-text-secondary">
                    {h}:00
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="relative border-r border-surface-border/30 last:border-r-0 group">
                  {HOURS.map(hour => (
                    <div key={hour} className="h-25 border-b border-surface-border/30 group-hover:bg-white/1 transition-colors" />
                  ))}

                  {filteredBookings
                    ?.filter(b => isSameDay(parseISO(b.date), day))
                    .map(booking => {
                      const d = new Date(booking.date);
                      const top = ((d.getHours() - 9) * 100) + (d.getMinutes() * 100 / 60);
                      const height = 100;
                      const color = booking.artist?.color ?? 'var(--color-accent)';
                      return (
                        <div
                          key={booking.id}
                          className="absolute left-1 right-1 rounded-xl p-3 text-xs border-l-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md cursor-default group/card transition-all duration-300 hover:z-20 border"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            backgroundColor: `${color}28`,
                            borderColor: `${color}40`,
                            borderLeftColor: color
                          }}
                        >
                          {/* Actions column */}
                          <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                            {canSendMessages && booking.customer?.id && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setWhatsAppBooking(booking);
                                }}
                                className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm cursor-pointer hover:scale-110 active:scale-95"
                                title="WhatsApp"
                              >
                                <MessageCircle size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleEditBooking(booking);
                              }}
                              className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm cursor-pointer hover:scale-110 active:scale-95"
                              title="Modifica"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteBooking(booking.id);
                              }}
                              className="w-6 h-6 rounded-lg bg-danger/20 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all shadow-sm cursor-pointer hover:scale-110 active:scale-95"
                              title="Elimina"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="flex flex-col h-full justify-between pr-8">
                            <div>
                              <div className="font-bold text-white text-sm truncate leading-tight mb-0.5">
                                {booking.customer?.firstName} {booking.customer?.lastName}
                              </div>
                              <div className="font-semibold uppercase tracking-[0.5px] truncate leading-tight text-xs" style={{ color }}>
                                <span>●</span> {booking.artist?.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary/60">
                              <Clock size={10} />
                              <span>{format(new Date(booking.date), 'HH:mm')}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBooking(null);
        }}
        onSuccess={() => mutate()}
        booking={editingBooking}
      />
      <WhatsAppSendModal
        isOpen={!!whatsAppBooking}
        onClose={() => setWhatsAppBooking(null)}
        booking={whatsAppBooking}
      />
    </div>
  );
}
