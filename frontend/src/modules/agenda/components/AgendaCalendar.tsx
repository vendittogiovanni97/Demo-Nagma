"use client";

import type { DatesSetArg, DayCellContentArg, EventContentArg } from '@fullcalendar/core';
import itLocale from '@fullcalendar/core/locales/it';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Box } from '@mui/material';
import { Clock } from 'lucide-react';

import StatePanel from '@/components/feedback/StatePanel';

interface AgendaCalendarProps {
  isLoading: boolean;
  error: unknown;
  events: any[];
  renderEventContent: (arg: EventContentArg) => React.ReactNode;
  renderDayCellContent: (arg: DayCellContentArg) => any;
  handleDateClick: (arg: any) => void;
  handleEventClick: (arg: any) => void;
  handleDatesSet: (arg: DatesSetArg) => void;
  handleMoreLinkClick: (arg: any) => void;
}

export default function AgendaCalendar({
  isLoading,
  error,
  events,
  renderEventContent,
  renderDayCellContent,
  handleDateClick,
  handleEventClick,
  handleDatesSet,
  handleMoreLinkClick,
}: AgendaCalendarProps) {
  return (
    <Box
      className="fc-materio-wrapper"
      sx={{
        flex: 1,
        p: 3,
        overflow: 'hidden',
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
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={itLocale}
          firstDay={1}
          slotMinTime="08:00:00"
          slotMaxTime="19:30:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00:00"
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          headerToolbar={{
            left: 'prev,next title',
            center: '',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          buttonText={{ today: 'Oggi', month: 'Month', week: 'Week', day: 'Day' }}
          events={events}
          eventContent={renderEventContent}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="100%"
          allDaySlot={false}
          nowIndicator
          eventMinHeight={18}
          dayMaxEvents={2}
          moreLinkClick={handleMoreLinkClick}
          weekText="Settimana"
          dayHeaderFormat={{ weekday: 'short', day: '2-digit', month: '2-digit' }}
          dayCellContent={renderDayCellContent}
          datesSet={handleDatesSet}
        />
      )}
    </Box>
  );
}
