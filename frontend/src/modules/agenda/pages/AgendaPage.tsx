"use client";

import type { DatesSetArg, DayCellContentArg, EventContentArg } from '@fullcalendar/core';
import { Box } from '@mui/material';
import { format, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { useCallback, useState } from 'react';

import PasswordConfirmModal from '@/common/components/modals/PasswordConfirmModal';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import { useAuth } from '@/common/context/AuthContext';
import { useDeleteConfirm } from '@/common/hooks/useDeleteConfirm';
import BookingModal from '@/modules/booking/components/modals/BookingModal';
import type { BookingModel } from '@/modules/booking/model/booking.model';
import WhatsAppSendModal from '@/modules/whatsapp/components/modals/WhatsAppSendModal';

import CalendarEvent from '../components/CalendarEvent';
import AgendaCalendar from '../components/AgendaCalendar';
import DayBookingsModal from '../components/DayBookingsModal';
import { useAgendaBookings } from '../hooks/useAgendaBookings';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

export default function AgendaPage() {
  const { isSuperAdmin } = useAuth();
  const { confirmDialogProps } = useDeleteConfirm();

  const [dayBookingsData, setDayBookingsData] = useState<{ date: Date; bookings: BookingModel[] } | null>(null);

  const {
    bookings,
    isLoading: isBookingsLoading,
    error: bookingsError,
    mutate,
    isModalOpen,
    editingBooking,
    whatsAppBooking,
    initialDate,
    initialTime,
    showDeletePasswordModal,
    deletePasswordLoading,
    handlePasswordDelete,
    handleDateClick,
    handleEventClick,
    setIsModalOpen,
    setEditingBooking,
    setWhatsAppBooking,
    setCurrentMonth,
    setShowDeletePasswordModal,
    setPendingDeleteId,
  } = useAgendaBookings();

  const bookingsList = bookings || [];
  const { events } = useCalendarEvents(bookingsList);

  const renderEventContent = useCallback((arg: EventContentArg) => (
    <CalendarEvent
      booking={arg.event.extendedProps.booking as BookingModel}
      isMonthView={arg.view.type === 'dayGridMonth'}
    />
  ), []);

  const renderDayCellContent = useCallback((arg: DayCellContentArg) => ({
    html: `<span class="fc-daygrid-day-number" tabindex="0" role="gridcell" aria-label="${format(arg.date, 'EEEE d MMMM', { locale: it })}">${arg.dayNumberText}</span>`,
  }), []);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    const visibleStart = format(arg.start, 'yyyy-MM');
    const visibleEnd = format(subDays(arg.end, 1), 'yyyy-MM');
    if (visibleEnd !== visibleStart) {
      const mid = new Date((arg.start.getTime() + arg.end.getTime()) / 2);
      setCurrentMonth(format(mid, 'yyyy-MM'));
    } else {
      setCurrentMonth(visibleStart);
    }
  }, [setCurrentMonth]);

  const handleMoreLinkClick = useCallback((info: any) => {
    if (info.jsEvent) {
      info.jsEvent.preventDefault();
    }
    const clickedDateStr = format(info.date, 'yyyy-MM-dd');
    const dayBookings = bookingsList.filter(b => {
      const bDateStr = format(new Date(b.date), 'yyyy-MM-dd');
      return bDateStr === clickedDateStr;
    });
    setDayBookingsData({
      date: info.date,
      bookings: dayBookings as BookingModel[],
    });
    return 'none';
  }, [bookingsList]);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        mt: { xs: -2, md: -3 },
        pt: 2,
        height: '100%',
        gap: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-surface-border)',
          borderRadius: 2,
          overflow: 'hidden',
          height: {
            xs: 'calc(100vh - 120px)',
            sm: 'calc(100vh - 130px)',
            md: 'calc(100vh - 140px)',
          },
          minHeight: { md: 680 },
        }}
      >
        <AgendaCalendar
          isLoading={isBookingsLoading}
          error={bookingsError}
          events={events}
          renderEventContent={renderEventContent}
          renderDayCellContent={renderDayCellContent}
          handleDateClick={handleDateClick}
          handleEventClick={handleEventClick}
          handleDatesSet={handleDatesSet}
          handleMoreLinkClick={handleMoreLinkClick}
        />
      </Box>

      <DayBookingsModal
        isOpen={dayBookingsData !== null}
        onClose={() => setDayBookingsData(null)}
        date={dayBookingsData?.date ?? null}
        bookings={dayBookingsData?.bookings ?? []}
        onBookingClick={(booking) => {
          setEditingBooking(booking);
          setIsModalOpen(true);
        }}
      />

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
