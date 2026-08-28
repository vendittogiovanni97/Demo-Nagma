"use client";

import type { DatesSetArg, DayCellContentArg, EventContentArg, MoreLinkArg } from '@fullcalendar/core';
import { Box } from '@mui/material';
import { format, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PasswordConfirmModal from '@/common/components/modals/PasswordConfirmModal';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import CheckboxInput from '@/common/components/forms/CheckboxInput';
import { useAuth } from '@/common/context/AuthContext';
import { useDeleteConfirm } from '@/common/hooks/useDeleteConfirm';
import BookingModal from '@/modules/booking/components/modals/BookingModal';
import type { BookingModel } from '@/modules/booking/model/booking.model';
import WhatsAppSendModal from '@/modules/whatsapp/components/modals/WhatsAppSendModal';

import CalendarEvent from '../components/CalendarEvent';
// bundle-dynamic-imports (CRITICAL): FullCalendar is ~200KB+ and not needed for SSR.
// Loading it dynamically removes it from the initial bundle entirely.
const AgendaCalendar = dynamic(() => import('../components/AgendaCalendar'), { ssr: false });
import PageHeader from '@/common/components/common/PageHeader';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Calendar as CalendarIcon, LayoutGrid, Plus } from 'lucide-react';
import { KanbanBoard } from '../components/KanbanBoard';
import DayBookingsModal from '../components/DayBookingsModal';
import { useAgendaBookings } from '../hooks/useAgendaBookings';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

const AGENDA_VIEW_MODE_KEY = 'nagma_agenda_view_mode';

export default function AgendaPage() {
  const { isSuperAdmin } = useAuth();
  const { confirmDialogProps } = useDeleteConfirm();

  const [viewMode, setViewMode] = useState<'CALENDAR' | 'KANBAN'>('CALENDAR');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(AGENDA_VIEW_MODE_KEY);
      if (saved === 'KANBAN' || saved === 'CALENDAR') {
        setViewMode(saved);
      }
    }
  }, []);

  const handleViewModeChange = (next: 'CALENDAR' | 'KANBAN') => {
    setViewMode(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AGENDA_VIEW_MODE_KEY, next);
    }
  };

  const [dayBookingsData, setDayBookingsData] = useState<{ date: Date; bookings: BookingModel[] } | null>(null);
  const [refundOnDelete, setRefundOnDelete] = useState(false);

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
    showDeleteConfirm,
    deletePasswordLoading,
    handlePasswordDelete,
    confirmSuperAdminDelete,
    closeDeleteConfirm,
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

  // js-index-maps (LOW-MEDIUM): pre-index bookings by date string for O(1) lookup
  // in handleMoreLinkClick instead of O(n) .filter() on every click.
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, BookingModel[]>();
    for (const b of bookingsList) {
      const key = format(new Date(b.date), 'yyyy-MM-dd');
      const existing = map.get(key);
      if (existing) {
        existing.push(b as BookingModel);
      } else {
        map.set(key, [b as BookingModel]);
      }
    }
    return map;
  }, [bookingsList]);

  const renderEventContent = useCallback((arg: EventContentArg) => (
    <CalendarEvent
      booking={arg.event.extendedProps.booking as BookingModel}
      isMonthView={arg.view.type === 'dayGridMonth'}
    />
  ), []);

  const renderDayCellContent = useCallback((arg: DayCellContentArg) => ({
    html: `<span class="fc-daygrid-day-number" tabindex="0" role="gridcell" aria-label="${format(arg.date, 'EEEE d MMMM', { locale: it })}">${arg.dayNumberText}</span>`,
  }), []);

  const currentMonthRef = useRef<string | null>(null);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    const visibleStart = format(arg.start, 'yyyy-MM');
    const visibleEnd = format(subDays(arg.end, 1), 'yyyy-MM');
    let targetMonth = visibleStart;
    if (visibleEnd !== visibleStart) {
      const mid = new Date((arg.start.getTime() + arg.end.getTime()) / 2);
      targetMonth = format(mid, 'yyyy-MM');
    }
    if (targetMonth !== currentMonthRef.current) {
      currentMonthRef.current = targetMonth;
      setCurrentMonth(targetMonth);
    }
  }, [setCurrentMonth]);

  const handleMoreLinkClick = useCallback((info: MoreLinkArg) => {
    if (info.jsEvent) {
      info.jsEvent.preventDefault();
    }
    const clickedDateStr = format(info.date, 'yyyy-MM-dd');
    // O(1) Map lookup instead of O(n) .filter()
    const dayBookings = bookingsByDate.get(clickedDateStr) ?? [];
    setDayBookingsData({
      date: info.date,
      bookings: dayBookings,
    });
    return 'none';
  }, [bookingsByDate]);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
      }}
    >
      <PageHeader
        title="Agenda Studio"
        subtitle="Visualizza il calendario o gestisci l'operatività live tramite la vista Kanban"
        showButton
        buttonLabel="Nuova Prenotazione"
        buttonIcon={<Plus size={16} />}
        onButtonClick={() => {
          setEditingBooking(null);
          setIsModalOpen(true);
        }}
        actions={
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, next) => next && handleViewModeChange(next)}
            size="small"
            sx={{
              bgcolor: (t) => t.palette.background.paper,
              borderRadius: 2.5,
              p: 0.5,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ToggleButton
              value="CALENDAR"
              sx={{
                borderRadius: 2,
                px: 2,
                py: 0.75,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                gap: 1,
              }}
            >
              <CalendarIcon size={16} />
              Calendario
            </ToggleButton>

            <ToggleButton
              value="KANBAN"
              sx={{
                borderRadius: 2,
                px: 2,
                py: 0.75,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                gap: 1,
              }}
            >
              <LayoutGrid size={16} />
              Kanban del Giorno
            </ToggleButton>
          </ToggleButtonGroup>
        }
      />

      {viewMode === 'KANBAN' ? (
        <KanbanBoard />
      ) : (
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
              xs: 'calc(100vh - 220px)',
              sm: 'calc(100vh - 230px)',
              md: 'calc(100vh - 240px)',
            },
            minHeight: { md: 600 },
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
      )}

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
      {!isSuperAdmin ? (
        <PasswordConfirmModal
          isOpen={showDeletePasswordModal}
          onClose={() => { setShowDeletePasswordModal(false); setPendingDeleteId(null); setRefundOnDelete(false); }}
          onConfirm={(pwd) => handlePasswordDelete(pwd, refundOnDelete)}
          loading={deletePasswordLoading}
          title="Conferma Cancellazione"
          description="Inserisci la password per confermare la cancellazione della prenotazione."
          extra={
            <CheckboxInput
              label="Rimborsa l'acconto al cliente"
              checked={refundOnDelete}
              onChange={setRefundOnDelete}
              sx={{ mb: 1 }}
            />
          }
        />
      ) : (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => { closeDeleteConfirm(); setRefundOnDelete(false); }}
          onConfirm={() => { confirmSuperAdminDelete(refundOnDelete); setRefundOnDelete(false); }}
          title="Conferma Cancellazione"
          message="Vuoi cancellare questa prenotazione?"
          confirmText="Cancella"
          severity="error"
        >
          <CheckboxInput
            label="Rimborsa l'acconto al cliente"
            checked={refundOnDelete}
            onChange={setRefundOnDelete}
          />
        </ConfirmDialog>
      )}
    </Box>
  );
}
