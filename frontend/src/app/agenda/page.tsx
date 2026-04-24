"use client";


import type { EventClickArg, EventContentArg } from '@fullcalendar/core';
import itLocale from '@fullcalendar/core/locales/it';
import type { DateClickArg } from '@fullcalendar/interaction';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

import StatePanel from '@/components/feedback/StatePanel';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/hooks/domain';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { bookingService } from '@/services/booking.service';
import type { Booking } from '@/types/booking';
import { format, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { Clock, MessageCircle, Pencil, Trash2 } from 'lucide-react';

import BookingModal from '@/components/modals/BookingModal';
import PasswordConfirmModal from '@/components/modals/PasswordConfirmModal';
import WhatsAppSendModal from '@/components/modals/WhatsAppSendModal';
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
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onWhatsApp(booking); }}
            className="w-5 h-5 p-0 text-emerald-400 hover:bg-emerald-500 hover:text-white"
            title="WhatsApp"
            icon={<MessageCircle size={11} />}
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onEdit(booking); }}
          className="w-5 h-5 p-0 text-blue-400 hover:bg-blue-500 hover:text-white"
          title="Modifica"
          icon={<Pencil size={11} />}
        />
        <Button
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDelete(booking.id); }}
          className="w-5 h-5 p-0 text-red-400 hover:bg-red-500 hover:text-white"
          title="Elimina"
          icon={<Trash2 size={11} />}
        />
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const { isSuperAdmin, isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [whatsAppBooking, setWhatsAppBooking] = useState<Booking | null>(null);
  const [initialDate, setInitialDate] = useState('');
  const [initialTime, setInitialTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
  const [deletePasswordLoading, setDeletePasswordLoading] = useState(false);

  const { deleteItem, confirmDialogProps } = useDeleteConfirm();
  const { data: bookings, mutate, isLoading, error } = useBookings(currentMonth);

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

  const events = useMemo(() =>
    (bookings || []).map((booking) => ({
      id: booking.id.toString(),
      start: booking.date,
      end: new Date(new Date(booking.date).getTime() + (booking.duration ?? 60) * 60000).toISOString(),
      extendedProps: { booking },
      backgroundColor: `${booking.artist?.color ?? '#00BFFF'}22`,
      borderColor: booking.artist?.color ?? '#00BFFF',
      textColor: '#ffffff',
    })),
    [bookings]
  );

  const handleDeleteBooking = useCallback(async (id: number) => {
    setPendingDeleteId(id);
    if (isSuperAdmin) {
      setShowDeletePasswordModal(false);
      await bookingService.delete(id);
      await mutate();
    } else {
      setShowDeletePasswordModal(true);
    }
  }, [isSuperAdmin, mutate]);

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
      <PageHeader title="Agenda Studio" />

      <div
        className="fc-nagma-wrapper border border-surface-border rounded-2xl overflow-hidden"
        style={{ height: 'calc(100vh - 210px)' }}
        role="grid"
        aria-label="Calendario appuntamenti"
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
                canSendWhatsApp={isAdmin}
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
            dayMaxEvents={3}
            weekText="Settimana"
            dayHeaderFormat={{ weekday: 'long', day: 'numeric', month: 'numeric' }}
            dayCellContent={(arg) => ({
              html: `<span class="fc-daygrid-day-number" tabindex="0" role="gridcell" aria-label="${format(arg.date, 'EEEE d MMMM', { locale: it })}">${arg.dayNumberText}</span>`,
            })}
            datesSet={(arg) => {
              const visibleStart = format(arg.start, 'yyyy-MM');
              const visibleEnd = format(subDays(arg.end, 1), 'yyyy-MM');
              if (visibleEnd !== visibleStart) {
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
      {!isSuperAdmin && (
        <PasswordConfirmModal
          isOpen={showDeletePasswordModal}
          onClose={() => { setShowDeletePasswordModal(false); setPendingDeleteId(null); }}
          onConfirm={handlePasswordDelete}
          loading={deletePasswordLoading}
        />
      )}
    </div>
  );
}
