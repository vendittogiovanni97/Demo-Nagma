"use client";

import StatePanel from '@/components/feedback/StatePanel';
import SearchInput from '@/components/forms/SearchInput';
import PageHeader from '@/components/layout/PageHeader';
import WeekNavigator from '@/components/layout/WeekNavigator';
import Button from '@/components/ui/Button';
import BookingModal from '@/components/modals/BookingModal';
import ExportModal from '@/components/modals/ExportModal';
import WhatsAppSendModal from '@/components/modals/WhatsAppSendModal';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/hooks/domain';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { bookingService } from '@/services/booking.service';
import type { Booking } from '@/types/booking';
import { addDays, addWeeks, eachDayOfInterval, format, getDay, isSameDay, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { it } from 'date-fns/locale';
import BookingCard from '@/components/widgets/agenda/BookingCard';
import { Calendar, Clock, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 9);
const DAY_LABELS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

export default function AgendaPage() {
  const { can } = useAuth();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [whatsAppBooking, setWhatsAppBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [selectedDayIndex, setSelectedDayIndex] = useState(getDay(new Date()) === 0 ? 6 : getDay(new Date()) - 1);
  const [mobileView, setMobileView] = useState<'day' | 'week'>('day');
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const monthStr = format(weekStart, 'yyyy-MM');
  const { data: bookings, mutate, isLoading, error } = useBookings(monthStr);

  const weekDays = useMemo(() =>
    eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) }),
    [weekStart]
  );

  const selectedDay = useMemo(() => weekDays[selectedDayIndex], [weekDays, selectedDayIndex]);

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

  const handleDeleteBooking = async (id: number) => {
    await deleteItem({
      confirmMessage: 'Sei sicuro di voler eliminare questa prenotazione?',
      action: () => bookingService.delete(id),
      successMessage: 'Prenotazione eliminata',
      errorMessage: 'Errore nell\'eliminazione',
      onSuccess: mutate,
    });
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      <PageHeader
        title="Agenda Studio"
        actions={
          <>
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
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setEditingBooking(null);
                setIsModalOpen(true);
              }}
            >
              Nuovo
            </Button>
          </>
        }
      >
        <div className="flex-1 max-w-3xl mx-auto flex items-center gap-3">
          <WeekNavigator
            weekStart={weekStart}
            onPrev={() => setWeekStart(w => subWeeks(w, 1))}
            onNext={() => setWeekStart(w => addWeeks(w, 1))}
            format="full"
            variant="minimal"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="shrink-0"
          >
            Oggi
          </Button>

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cerca cliente, artista..."
          />
        </div>
      </PageHeader>

      {/* Calendar grid */}
      <div className="flex-1 glass-panel p-0 overflow-hidden flex flex-col min-h-0 rounded-2xl">
        {/* Mobile view toggle - only visible on mobile */}
        <div className="md:hidden px-4 py-3 flex items-center gap-2 border-b border-surface-border bg-white/1">
          <Button
            variant={mobileView === 'day' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMobileView('day')}
          >
            Giorno
          </Button>
          <Button
            variant={mobileView === 'week' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMobileView('week')}
          >
            Settimana
          </Button>
        </div>

        {/* Day pills navigation - only visible on mobile day view */}
        {mobileView === 'day' && (
          <div className="md:hidden px-4 py-3 border-b border-surface-border bg-white/1 flex flex-col gap-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {weekDays.map((day, index) => (
                <Button
                  key={day.toISOString()}
                  variant={index === selectedDayIndex ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedDayIndex(index)}
                  className="flex-shrink-0"
                >
                  {DAY_LABELS[index]}
                </Button>
              ))}
            </div>
            <div className="text-sm font-semibold text-white">
              {format(selectedDay, 'EEEE dd MMM', { locale: it })}
            </div>
          </div>
        )}

        {/* Day headers - hidden on mobile day view */}
        {mobileView === 'week' && (
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
        )}

        {/* Day headers for desktop - always visible on md+ */}
        <div className="hidden md:grid grid-cols-[60px_repeat(7,1fr)] border-b border-surface-border bg-white/2">
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

        {isLoading ? (
          <StatePanel
            variant="loading"
            fullPage
            icon={Clock}
            title="Carico l'agenda"
            description="Sto recuperando gli appuntamenti della settimana."
          />
        ) : error ? (
          <StatePanel
            variant="error"
            fullPage
            title="Impossibile caricare l'agenda"
            description="Controlla la connessione o riprova tra poco."
          />
        ) : filteredBookings.length === 0 ? (
          <StatePanel
            variant="empty"
            fullPage
            icon={Calendar}
            title={search ? 'Nessun risultato trovato' : 'Nessun appuntamento questa settimana'}
            description={search
              ? 'Prova a modificare i termini di ricerca.'
              : 'Clicca "Nuovo" per aggiungere il primo appuntamento.'}
          />
        ) : (
          <>
            {/* Mobile day view - only on mobile */}
            {mobileView === 'day' && (
              <div className="md:hidden flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-[60px_1fr]">
                  <div className="border-r border-surface-border bg-white/1">
                    {HOURS.map(h => (
                      <div key={h} className="h-25 border-b border-surface-border/30 flex items-start justify-center pt-2 text-xs font-bold text-text-secondary">
                        {h}:00
                      </div>
                    ))}
                  </div>
                  <div className="relative border-r border-surface-border/30 group">
                    {HOURS.map(hour => (
                      <div key={hour} className="h-25 border-b border-surface-border/30 group-hover:bg-white/1 transition-colors" />
                    ))}
                    {filteredBookings
                      ?.filter(b => isSameDay(parseISO(b.date), selectedDay))
                      .map(booking => {
                        const d = new Date(booking.date);
                        const top = ((d.getHours() - 9) * 100) + (d.getMinutes() * 100 / 60);
                        const height = Math.max(50, (booking.duration / 60) * 100);
                        return (
                          <BookingCard
                            key={booking.id}
                            booking={booking}
                            top={top}
                            height={height}
                            canSendWhatsApp={can.sendWhatsApp}
                            onWhatsApp={setWhatsAppBooking}
                            onEdit={handleEditBooking}
                            onDelete={handleDeleteBooking}
                          />
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Week view - always visible on desktop, visible on mobile only in week mode */}
            <div className={`${mobileView === 'day' ? 'hidden md:flex md:flex-col' : 'flex flex-col'} flex-1 overflow-y-auto custom-scrollbar`}>
              <div className={`${mobileView === 'week' ? 'md:hidden overflow-x-auto' : ''}`}>
                <div className={`grid ${mobileView === 'week' ? 'grid-cols-[60px_repeat(7,minmax(140px,1fr))]' : 'grid-cols-[60px_repeat(7,1fr)]'}`}>
                  <div className="border-r border-surface-border bg-white/1 md:sticky md:left-0">
                    {HOURS.map(h => (
                      <div key={h} className="h-25 border-b border-surface-border/30 flex items-start justify-center pt-2 text-xs font-bold text-text-secondary">
                        {h}:00
                      </div>
                    ))}
                  </div>
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
                          const height = Math.max(50, (booking.duration / 60) * 100);
                          return (
                            <BookingCard
                              key={booking.id}
                              booking={booking}
                              top={top}
                              height={height}
                              canSendWhatsApp={can.sendWhatsApp}
                              onWhatsApp={setWhatsAppBooking}
                              onEdit={handleEditBooking}
                              onDelete={handleDeleteBooking}
                            />
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
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
      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
