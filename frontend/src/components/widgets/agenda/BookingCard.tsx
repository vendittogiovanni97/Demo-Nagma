"use client";

import Button from '@/components/ui/Button';
import type { Booking } from '@/types/booking';
import { format } from 'date-fns';
import { Clock, MessageCircle, Pencil, Trash2 } from 'lucide-react';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

interface BookingCardProps {
  booking: Booking;
  top: number;
  height: number;
  canSendWhatsApp: boolean;
  onWhatsApp: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
}

export default function BookingCard({
  booking,
  top,
  height,
  canSendWhatsApp,
  onWhatsApp,
  onEdit,
  onDelete,
}: BookingCardProps) {
  const color = booking.artist?.color ?? 'var(--color-accent)';

  return (
    <div
      key={booking.id}
      className="absolute left-1 right-1 rounded-xl p-3 text-xs border-l-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md cursor-default group/card transition-all duration-300 hover:z-20 border"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: `${color}28`,
        borderColor: `${color}40`,
        borderLeftColor: color,
      }}
    >
      {/* Actions column */}
      <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
        {canSendWhatsApp && booking.customer?.id && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onWhatsApp(booking);
            }}
            icon={<MessageCircle size={14} />}
            className="w-6 h-6 p-0 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg shadow-sm hover:scale-110 active:scale-95"
            title="WhatsApp"
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(booking);
          }}
          icon={<Pencil size={14} />}
          className="w-6 h-6 p-0 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg shadow-sm hover:scale-110 active:scale-95"
          title="Modifica"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(booking.id);
          }}
          icon={<Trash2 size={14} />}
          className="w-6 h-6 p-0 bg-danger/20 text-danger hover:bg-danger hover:text-white rounded-lg shadow-sm hover:scale-110 active:scale-95"
          title="Elimina"
        />
      </div>

      <div className="flex flex-col h-full justify-between pr-8">
        <div>
          <div className="font-bold text-white text-sm truncate leading-tight mb-0.5">
            {booking.customer?.firstName} {booking.customer?.lastName}
          </div>
          <div
            className="font-semibold uppercase tracking-[0.5px] truncate leading-tight text-xs"
            style={{ color }}
          >
            <span>●</span> {booking.artist?.name}
          </div>
        </div>
        <div className="flex flex-col gap-1 text-[10px] font-bold text-text-secondary/60">
          <div className="flex items-center gap-1.5">
            <Clock size={10} />
            <span>{format(new Date(booking.date), 'HH:mm')}</span>
          </div>
          <div>{formatDuration(booking.duration)}</div>
        </div>
      </div>
    </div>
  );
}
