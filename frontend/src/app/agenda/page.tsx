"use client";

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { format, startOfWeek, addDays, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { ENDPOINTS } from '@/api/endpoints';
import BookingModal from '@/components/modals/BookingModal';
import type { Booking } from '@/types';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 9);

export default function AgendaPage() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthStr = format(weekStart, 'yyyy-MM');
  const { data: bookings, mutate } = useSWR<Booking[]>(
    [ENDPOINTS.BOOKINGS.BASE, monthStr],
    () => bookingService.getAll(monthStr)
  );

  const weekDays = useMemo(() =>
    eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) }),
    [weekStart]
  );

  return (
    <div className="flex-1 flex flex-col gap-6 h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex justify-between items-center bg-surface p-6 rounded-[25px] border border-surface-border shadow-xl">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-outfit font-bold text-white">Agenda Studio</h1>
          <div className="flex items-center bg-white/5 rounded-xl p-1 border border-surface-border">
            <button onClick={() => setWeekStart(w => subWeeks(w, 1))} className="p-2 hover:bg-white/10 rounded-lg transition">
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 font-bold text-sm min-w-40 text-center uppercase tracking-widest text-accent">
              {format(weekStart, 'dd MMM', { locale: it })} — {format(addDays(weekStart, 6), 'dd MMM yyyy', { locale: it })}
            </span>
            <button onClick={() => setWeekStart(w => addWeeks(w, 1))} className="p-2 hover:bg-white/10 rounded-lg transition">
              <ChevronRight size={20} />
            </button>
          </div>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 bg-white/5 border border-surface-border rounded-xl hover:bg-accent hover:text-black transition-colors"
          >
            Oggi
          </button>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-6">
          <Plus size={20} />
          <span>Nuovo Appuntamento</span>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 glass-panel p-0 overflow-hidden flex flex-col">
        {/* Day headers */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-surface-border bg-white/2">
          <div className="p-4 border-r border-surface-border flex items-center justify-center">
            <Clock size={18} className="text-text-secondary" />
          </div>
          {weekDays.map(day => (
            <div
              key={day.toISOString()}
              className={`p-4 text-center border-r border-surface-border last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-accent/10' : ''}`}
            >
              <div className="text-[10px] text-text-secondary uppercase tracking-[2px] font-bold mb-1">
                {format(day, 'EEE', { locale: it })}
              </div>
              <div className={`text-xl font-outfit font-black ${isSameDay(day, new Date()) ? 'text-accent' : 'text-white'}`}>
                {format(day, 'dd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] min-h-200">
            {/* Hours column */}
            <div className="border-r border-surface-border bg-white/1">
              {HOURS.map(h => (
                <div key={h} className="h-20 border-b border-surface-border/30 flex items-start justify-center pt-2 text-[10px] font-bold text-text-secondary">
                  {h}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="relative border-r border-surface-border/30 last:border-r-0 group">
                {HOURS.map(hour => (
                  <div key={hour} className="h-20 border-b border-surface-border/30 group-hover:bg-white/[0.01] transition-colors" />
                ))}

                {bookings
                  ?.filter(b => isSameDay(parseISO(b.date), day))
                  .map(booking => {
                    const d = new Date(booking.date);
                    const top = ((d.getHours() - 9) * 80) + (d.getMinutes() * 80 / 60);
                    const height = (booking.duration ?? 60) * 80 / 60;
                    const color = booking.artist?.color ?? 'var(--color-accent)';
                    return (
                      <div
                        key={booking.id}
                        className="absolute left-1 right-1 rounded-xl p-2 text-[10px] overflow-hidden border-l-4 shadow-xl cursor-pointer hover:scale-[1.02] transition-transform z-10"
                        style={{ top: `${top}px`, height: `${height}px`, backgroundColor: `${color}20`, borderColor: color }}
                      >
                        <div className="font-bold text-white truncate">{booking.customer?.firstName} {booking.customer?.lastName}</div>
                        <div className="text-text-secondary opacity-80 uppercase tracking-tighter truncate">{booking.type} • {booking.artist?.name}</div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => mutate()} />
    </div>
  );
}
