"use client";

import { format } from 'date-fns';

import BentoCard from '@/components/data-display/BentoCard';
import { Skeleton } from '@/components/feedback/Skeleton';
import type { Booking } from '@/types/booking';

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
  return (
    <BentoCard title="Oggi" className={className} contentClassName="overflow-y-auto space-y-3 custom-scrollbar">
      {isLoading ? (
        <Skeleton className="h-full" />
      ) : (
        bookings?.map((booking) => (
          <div
            key={booking.id}
            className="p-3 bg-white/5 border border-white/5 rounded-xl flex gap-3 items-center"
          >
            <div className="text-accent font-bold text-xs">
              {format(new Date(booking.date), 'HH:mm')}
            </div>
            <div className="flex flex-col whitespace-nowrap overflow-hidden">
              <span className="font-bold text-white text-sm truncate">
                {booking.customer?.firstName}
              </span>
              <span className="text-[10px] text-text-secondary uppercase">{booking.artist?.name}</span>
            </div>
          </div>
        ))
      )}
    </BentoCard>
  );
}
