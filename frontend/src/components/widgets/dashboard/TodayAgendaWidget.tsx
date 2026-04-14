"use client";

import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

import BentoCard from '@/components/data-display/BentoCard';
import { Skeleton } from '@/components/feedback/Skeleton';
import type { Booking } from '@/types/booking';
import { it } from 'date-fns/locale';

interface TodayAgendaWidgetProps {
  bookings?: Booking[];
  isLoading: boolean;
  className?: string;
}

export default function TodayAgendaWidget({
  bookings,
  isLoading,
  className,
}: TodayAgendaWidgetProps) {
  const todayBookings = bookings?.filter((booking) => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    );
  }) || [];

  return (
    <BentoCard
      className={className}
      header={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/10 text-accent flex-shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-lg font-outfit font-semibold">Appuntamenti Oggi</h3>
              <p className="text-xs text-text-secondary">
                {format(new Date(), 'EEEE dd MMMM', { locale: it })}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold">
            {todayBookings.length}
          </div>
        </div>
      }
      contentClassName="overflow-y-auto space-y-3 custom-scrollbar min-h-[400px]"
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton variant="rect" className="w-full h-16" />
          <Skeleton variant="rect" className="w-full h-16" />
          <Skeleton variant="rect" className="w-full h-16" />
        </div>
      ) : todayBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-3">
            <Calendar size={24} className="text-accent" />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">Nessun appuntamento oggi</h4>
          <p className="text-xs text-text-secondary">Goditi la giornata libera!</p>
        </div>
      ) : (
        todayBookings.map((booking) => {
          const color = booking.artist?.color || '#00BFFF';
          return (
            <div
              key={booking.id}
              className="p-4 rounded-xl border border-surface-border bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-1 h-12 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={14} className="text-accent shrink-0" />
                    <span className="text-sm font-bold text-white">
                      {format(new Date(booking.date), 'HH:mm')}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white truncate">
                    {booking.customer?.firstName} {booking.customer?.lastName}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {booking.type} · {booking.artist?.name}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </BentoCard>
  );
}
