"use client";

import type { EventClickArg, EventContentArg } from '@fullcalendar/core';
import itLocale from '@fullcalendar/core/locales/it';
import type { DateClickArg } from '@fullcalendar/interaction';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { MessageCircle, Pencil, Trash2, Clock } from 'lucide-react';

import StatePanel from '@/components/feedback/StatePanel';
import PageHeader from '@/components/layout/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/hooks/domain/useBookings';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { bookingService } from '@/services/booking.service';
import type { Booking } from '@/types/booking';
import { format, subDays } from 'date-fns';
import { it } from 'date-fns/locale';

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
  const theme = useTheme();
  const color = booking.artist?.color ?? theme.palette.primary.main;
  const duration = booking.duration ?? 60;
  const isShort = duration <= 45;
  const isMedium = duration > 45 && duration <= 75;
  const startTime = format(new Date(booking.date), 'HH:mm');
  const isCancelled = booking.status === 'CANCELLED';
  const isRescheduled = booking.status === 'RESCHEDULED';

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'hidden',
        px: 0.75,
        py: 0.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.25,
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
        opacity: isCancelled ? 0.5 : 1,
        '&:hover .event-actions': { opacity: 1 },
      }}
    >
      {/* Top row: time + badges + icons (on hover) */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: 20 }}>
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: `${color}cc`, lineHeight: 1, letterSpacing: '0.04em' }}>
          {startTime}
          {!isShort && ` · ${duration}min`}
        </Typography>
        <Stack
          className="event-actions"
          direction="row"
          useFlexGap
          sx={{ gap: 0.25, opacity: 0, transition: 'opacity 0.15s ease', zIndex: 10, backgroundColor: 'rgba(10,20,35,0.75)', borderRadius: '6px', p: 0.25 }}
        >
          {canSendWhatsApp && booking.customer?.id && (
            <Tooltip title="WhatsApp">
              <IconButton
                size="small"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onWhatsApp(booking); }}
                sx={{ width: 22, height: 22, color: theme.palette.success.main, '&:hover': { backgroundColor: `${theme.palette.success.main}20` } }}
              >
                <MessageCircle size={12} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Modifica">
            <IconButton
              size="small"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onEdit(booking); }}
              sx={{ width: 22, height: 22, color: theme.palette.info.main, '&:hover': { backgroundColor: `${theme.palette.info.main}20` } }}
            >
              <Pencil size={12} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Elimina">
            <IconButton
              size="small"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(booking.id); }}
              sx={{ width: 22, height: 22, color: theme.palette.error.main, '&:hover': { backgroundColor: `${theme.palette.error.main}20` } }}
            >
              <Trash2 size={12} />
            </IconButton>
          </Tooltip>
        </Stack>
        {(isCancelled || isRescheduled) && (
          <Box sx={{
            px: 0.5, py: 0.1, borderRadius: '3px',
            backgroundColor: isCancelled ? `${theme.palette.error.main}30` : `${theme.palette.warning.main}30`,
            fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.06em',
            color: isCancelled ? theme.palette.error.main : theme.palette.warning.main,
            textTransform: 'uppercase', lineHeight: 1.4,
          }}>
            {isCancelled ? 'Ann.' : 'Risc.'}
          </Box>
        )}
      </Stack>

      {/* Customer name */}
      <Typography sx={{
        fontWeight: 700,
        color: '#fff',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        fontSize: isShort ? '0.75rem' : '0.8rem',
        textAlign: 'center',
      }}>
        {booking.customer?.firstName} {booking.customer?.lastName}
      </Typography>

      {/* Artist pill */}
      {!isShort && booking.artist && (
        <Box sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.4,
          px: 0.6,
          py: 0.15,
          borderRadius: '4px',
          backgroundColor: `${color}25`,
          border: `1px solid ${color}40`,
          alignSelf: 'center',
          maxWidth: '100%',
          overflow: 'hidden',
        }}>
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
          <Typography sx={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: color,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}>
            {booking.artist.name}
          </Typography>
        </Box>
      )}
    </Box>
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
      backgroundColor: `${booking.artist?.color ?? '#00BFFF'}15`,
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
            eventMinHeight={18}
            dayMaxEvents={3}
            weekText="Settimana"
            dayHeaderFormat={{ weekday: 'short', day: '2-digit', month: '2-digit' }}
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
