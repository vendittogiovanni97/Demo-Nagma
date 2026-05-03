"use client";

import type { EventContentArg, DatesSetArg, DayCellContentArg } from '@fullcalendar/core';
import itLocale from '@fullcalendar/core/locales/it';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Box } from '@mui/material';
import { useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { Clock } from 'lucide-react';

import StatePanel from '@/components/feedback/StatePanel';
import BookingModal from '@/modules/booking/components/modals/BookingModal';
import PasswordConfirmModal from '@/components/modals/PasswordConfirmModal';
import WhatsAppSendModal from '@/modules/whatsapp/components/modals/WhatsAppSendModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import type { Booking } from '@/modules/booking/model/booking.types';

import CalendarEvent from '../components/CalendarEvent';
import { useAgendaBookings } from '../hooks/useAgendaBookings';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

export default function AgendaPage() {
  const { isSuperAdmin, isAdmin } = useAuth();
  const { confirmDialogProps } = useDeleteConfirm();

  const {
    bookings,
    isLoading,
    error,
    mutate,
    isModalOpen,
    editingBooking,
    whatsAppBooking,
    initialDate,
    initialTime,
    showDeletePasswordModal,
    deletePasswordLoading,
    handleDeleteBooking,
    handlePasswordDelete,
    handleEditBooking,
    handleDateClick,
    handleEventClick,
    setIsModalOpen,
    setEditingBooking,
    setWhatsAppBooking,
    setCurrentMonth,
    setShowDeletePasswordModal,
    setPendingDeleteId,
  } = useAgendaBookings();

  const { events } = useCalendarEvents(bookings);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        mt: { xs: -2, md: -3 },
        pt: 2,
      }}
    >
      <Box
        className="fc-nagma-wrapper"
        sx={{
          height: {
            xs: 'calc(100vh - 100px)',
            sm: 'calc(100vh - 112px)',
            md: 'calc(100vh - 124px)',
          },
          width: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        }}
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
            slotMaxTime="19:30:00"
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
            eventContent={useCallback((arg: EventContentArg) => (
              <CalendarEvent
                booking={arg.event.extendedProps.booking as Booking}
              />
            ), [])}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="100%"
            allDaySlot={false}
            nowIndicator
            eventMinHeight={18}
            dayMaxEvents={3}
            weekText="Settimana"
            dayHeaderFormat={{ weekday: 'short', day: '2-digit', month: '2-digit' }}
            dayCellContent={useCallback((arg: DayCellContentArg) => ({
              html: `<span class="fc-daygrid-day-number" tabindex="0" role="gridcell" aria-label="${format(arg.date, 'EEEE d MMMM', { locale: it })}">${arg.dayNumberText}</span>`,
            }), [])}
            datesSet={useCallback((arg: DatesSetArg) => {
              const visibleStart = format(arg.start, 'yyyy-MM');
              const visibleEnd = format(subDays(arg.end, 1), 'yyyy-MM');
              if (visibleEnd !== visibleStart) {
                const mid = new Date((arg.start.getTime() + arg.end.getTime()) / 2);
                setCurrentMonth(format(mid, 'yyyy-MM'));
              } else {
                setCurrentMonth(visibleStart);
              }
            }, [setCurrentMonth])}
          />
        )}
      </Box>

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
    </Box>
  );
}
