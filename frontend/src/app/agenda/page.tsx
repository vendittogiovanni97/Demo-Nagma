"use client";

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { format, startOfWeek, addDays, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { ENDPOINTS } from '@/api/endpoints';
import BookingModal from '@/components/BookingModal';
import { Skeleton } from '@/components/Skeleton';
import type { Booking } from '@/types';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 9);

export default function AgendaPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const monthStr = format(currentWeekStart, 'yyyy-MM');
  const { data: bookings, isLoading, mutate } = useSWR<Booking[]>(
    [ENDPOINTS.BOOKINGS.BASE, monthStr],
    () => bookingService.getAll(monthStr)
  );

  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: currentWeekStart,
      end: addDays(currentWeekStart, 6)
    });
  }, [currentWeekStart]);

  const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const today = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <div className="flex-1 flex flex-col gap-6 h-[calc(100vh-140px)]">
      <div className="flex justify-between items-center bg-surface p-6 rounded-[25px] border border-surface-border shadow-xl">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-outfit font-bold text-white">Agenda Studio</h1>
          <div className="flex items-center bg-white/5 rounded-xl p-1 border border-surface-border">
            <button onClick={prevWeek} className="p-2 hover:bg-white/10 rounded-lg transition"><ChevronLeft size={20} /></button>
            <span className="px-4 font-bold text-sm min-w-[150px] text-center uppercase tracking-widest text-accent">
              {format(currentWeekStart, 'dd MMM', { locale: it })} - {format(addDays(currentWeekStart, 6), 'dd MMM yyyy', { locale: it })}
            </span>
            <button onClick={nextWeek} className="p-2 hover:bg-white/10 rounded-lg transition"><ChevronRight size={20} /></button>
          </div>
          <button onClick={today} className="text-xs font-bold uppercase tracking-widest px-4 py-2 bg-white/5 border border-surface-border rounded-xl hover:bg-accent hover:text-black transition-colors">Oggi</button>
        </div>
        <button onClick={() => setIsBookingOpen(true)} className="btn-primary flex items-center gap-2 px-6">
          <Plus size={20} />
          <span>Nuovo Appuntamento</span>
        </button>
      </div>

      <div className="flex-1 glass-panel p-0 overflow-hidden flex flex-col">
        {/* Header Giorni */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-surface-border bg-white/[0.02]">
          <div className="p-4 border-r border-surface-border flex items-center justify-center">
            <Clock size={18} className="text-text-secondary" />
          </div>
          {weekDays.map((day) => (
            <div key={day.toString()} className={`p-4 text-center border-r border-surface-border last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-accent/10' : ''}`}>
              <div className="text-[10px] text-text-secondary uppercase tracking-[2px] font-bold mb-1">{format(day, 'EEE', { locale: it })}</div>
              <div className={`text-xl font-outfit font-black ${isSameDay(day, new Date()) ? 'text-accent' : 'text-white'}`}>{format(day, 'dd')}</div>
            </div>
          ))}
        </div>

        {/* Griglia Orari */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] min-h-[800px]">
             {/* Colonna Orari */}
             <div className="border-r border-surface-border bg-white/[0.01]">
                {HOURS.map(hour => (
                  <div key={hour} className="h-20 border-b border-surface-border/30 flex items-start justify-center pt-2 text-[10px] font-bold text-text-secondary">
                    {hour}:00
                  </div>
                ))}
             </div>

             {/* Colonne Giorni */}
             {weekDays.map((day) => (
               <div key={day.toString()} className="relative border-r border-surface-border/30 last:border-r-0 group">
                  {HOURS.map(hour => (
                    <div key={hour} className="h-20 border-b border-surface-border/30 group-hover:bg-white/[0.01] transition-colors" />
                  ))}
                  
                  {/* Container Appuntamenti */}
                  {bookings?.filter((b) => isSameDay(parseISO(b.date), day)).map((booking) => {
                    const startHour = new Date(booking.date).getHours();
                    const startMin = new Date(booking.date).getMinutes();
                    const top = ((startHour - 9) * 80) + (startMin * 80 / 60);
                    const height = (booking.duration || 60) * 80 / 60;
                    const artistColor = booking.artist?.color || 'var(--color-accent)';

                    return (
                      <div 
                        key={booking.id}
                        className="absolute left-1 right-1 rounded-xl p-2 text-[10px] overflow-hidden border-l-4 shadow-xl cursor-pointer hover:scale-[1.02] transition-transform z-10"
                        style={{ 
                          top: `${top}px`, 
                          height: `${height}px`,
                          backgroundColor: `${artistColor}20`,
                          borderColor: artistColor,
                        }}
                      >
                        <div className="font-bold text-white truncate truncate-2-lines">{booking.customer?.firstName} {booking.customer?.lastName}</div>
                        <div className="text-text-secondary opacity-80 uppercase tracking-tighter truncate">{booking.type} • {booking.artist?.name}</div>
                      </div>
                    );
                  })}
               </div>
             ))}
          </div>
        </div>
      </div>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} onSuccess={() => mutate()} />
    </div>
  );
}
