"use client";

import type { DateClickArg } from '@fullcalendar/interaction';
import type {
  DatesSetArg,
  DayCellContentArg,
  EventClickArg,
  EventContentArg,
  EventInput,
  MoreLinkArg,
} from '@fullcalendar/core';

import itLocale from '@fullcalendar/core/locales/it';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import Icon from '@/common/components/ui/Icon';
import Button from '@/common/components/ui/Button';

import StatePanel from '@/common/components/feedback/StatePanel';
import { useBreakpoint } from '@/common/hooks/useBreakpoint';
import { useCallback, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

interface AgendaCalendarProps {
  isLoading: boolean;
  error: unknown;
  events: EventInput[];
  renderEventContent: (arg: EventContentArg) => React.ReactNode;
  renderDayCellContent: (arg: DayCellContentArg) => { html: string } | React.ReactNode;
  handleDateClick: (arg: DateClickArg) => void;
  handleEventClick: (arg: EventClickArg) => void;
  handleDatesSet: (arg: DatesSetArg) => void;
  handleMoreLinkClick: (arg: MoreLinkArg) => void;
}

// ─── View config ──────────────────────────────────────────────────────────────
const VIEWS: { id: CalendarView; label: string; labelShort: string }[] = [
  { id: 'dayGridMonth', label: 'Mese', labelShort: 'M' },
  { id: 'timeGridWeek', label: 'Settimana', labelShort: 'S' },
  { id: 'timeGridDay', label: 'Giorno', labelShort: 'G' },
];

// ─── Custom Toolbar ───────────────────────────────────────────────────────────
interface CalendarToolbarProps {
  title: string;
  activeView: CalendarView;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  isSmall: boolean;
}

function CalendarToolbar({
  title,
  activeView,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  isSmall,
}: CalendarToolbarProps) {
  const theme = useTheme();

  const isLight = theme.palette.mode === 'light';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 1.5, md: 2 },
        py: 1.25,
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: isLight ? alpha(theme.palette.background.paper, 0.8) : alpha(theme.palette.background.default, 0.6),
        backdropFilter: 'blur(12px)',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {/* LEFT: Navigation */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        {/* Prev */}
        <Box
          component="button"
          onClick={onPrev}
          aria-label="Mese precedente"
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.2 : 0.1)}`,
            backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.common.white, 0.04),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: theme.palette.text.primary,
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              borderColor: alpha(theme.palette.primary.main, 0.3),
              color: theme.palette.primary.main,
            },
          }}
        >
          <Icon name="chevronLeft" size={16} />
        </Box>

        {/* Title */}
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '0.9rem', md: '1.05rem' },
            color: 'text.primary',
            letterSpacing: '-0.2px',
            fontFamily: 'Outfit, sans-serif',
            minWidth: { xs: 110, md: 170 },
            textAlign: 'center',
            textTransform: 'capitalize',
            px: 0.5,
          }}
        >
          {title}
        </Typography>

        {/* Next */}
        <Box
          component="button"
          onClick={onNext}
          aria-label="Mese successivo"
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.2 : 0.1)}`,
            backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.common.white, 0.04),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: theme.palette.text.primary,
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              borderColor: alpha(theme.palette.primary.main, 0.3),
              color: theme.palette.primary.main,
            },
          }}
        >
          <Icon name="chevronRight" size={16} />
        </Box>
      </Stack>

      {/* CENTER / RIGHT: Today + View selector */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        {/* Today button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToday}
          sx={{
            px: 1.5,
            py: 0.5,
            fontSize: '0.75rem',
            fontWeight: 700,
            color: theme.palette.primary.main,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              borderColor: alpha(theme.palette.primary.main, 0.5),
            },
          }}
        >
          Oggi
        </Button>

        {/* View pill tabs */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.4,
            borderRadius: '10px',
            backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.06) : alpha(theme.palette.common.white, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.15 : 0.08)}`,
            gap: 0.25,
          }}
        >
          {VIEWS.map((view) => {
            const isActive = activeView === view.id;
            return (
              <Box
                key={view.id}
                component="button"
                onClick={() => onViewChange(view.id)}
                aria-label={view.label}
                aria-pressed={isActive}
                sx={{
                  px: { xs: 0.75, md: 1.25 },
                  py: 0.5,
                  borderRadius: '7px',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'text.secondary',
                  backgroundColor: isActive
                    ? theme.palette.primary.main
                    : 'transparent',
                  boxShadow: isActive
                    ? `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`
                    : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '0.01em',
                  '&:hover': isActive ? {} : {
                    backgroundColor: isLight
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.common.white, 0.06),
                    color: 'text.primary',
                  },
                }}
              >
                {isSmall ? view.labelShort : view.label}
              </Box>
            );
          })}
        </Box>
      </Stack>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgendaCalendar({
  error,
  events,
  renderEventContent,
  renderDayCellContent,
  handleDateClick,
  handleEventClick,
  handleDatesSet,
  handleMoreLinkClick,
}: AgendaCalendarProps) {
  const { isSmall } = useBreakpoint();
  const calendarRef = useRef<FullCalendar>(null);
  const [activeView, setActiveView] = useState<CalendarView>('dayGridMonth');
  const [title, setTitle] = useState('');

  const handleDatesSetInternal = useCallback(
    (arg: DatesSetArg) => {
      const viewTitle = arg.view?.title || calendarRef.current?.getApi().view.title || '';
      setTitle(viewTitle);
      setActiveView((arg.view?.type as CalendarView) || 'dayGridMonth');
      handleDatesSet(arg);
    },
    [handleDatesSet],
  );

  const handlePrev = useCallback(() => calendarRef.current?.getApi().prev(), []);
  const handleNext = useCallback(() => calendarRef.current?.getApi().next(), []);
  const handleToday = useCallback(() => calendarRef.current?.getApi().today(), []);
  const handleViewChange = useCallback((view: CalendarView) => {
    calendarRef.current?.getApi().changeView(view);
    setActiveView(view);
  }, []);

  return (
    <Box
      className="fc-materio-wrapper"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      role="grid"
      aria-label="Calendario appuntamenti"
    >
      {error ? (
        <StatePanel
          variant="error"
          fullPage
          title="Impossibile caricare l'agenda"
          description="Controlla la connessione o riprova tra poco."
        />
      ) : (
        <>
          {/* Custom glassmorphism toolbar */}
          <CalendarToolbar
            title={title}
            activeView={activeView}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
            onViewChange={handleViewChange}
            isSmall={isSmall}
          />

          {/* FullCalendar without native toolbar — kept mounted (no loading overlay) */}
          <Box sx={{ flex: 1, overflow: 'hidden', p: { xs: 0.5, md: 1 } }}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={itLocale}
              firstDay={1}
              headerToolbar={false}
              slotMinTime="08:00:00"
              slotMaxTime="19:30:00"
              slotDuration="00:30:00"
              slotLabelInterval="01:00:00"
              slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
              events={events}
              eventContent={renderEventContent}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="100%"
              allDaySlot={false}
              nowIndicator
              eventMinHeight={26}
              dayMaxEvents={4}
              moreLinkClick={handleMoreLinkClick}
              weekText="Settimana"
              dayHeaderFormat={
                isSmall
                  ? { weekday: 'short' }
                  : { weekday: 'short', day: '2-digit', month: '2-digit' }
              }
              dayCellContent={renderDayCellContent}
              datesSet={handleDatesSetInternal}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
