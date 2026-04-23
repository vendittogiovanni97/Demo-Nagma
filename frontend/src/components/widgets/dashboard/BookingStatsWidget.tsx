"use client";

import { Calendar, RefreshCw, XCircle } from 'lucide-react';

import BentoCard from '@/components/data-display/BentoCard';
import MonthPicker from '@/components/ui/MonthPicker';
import { Skeleton } from '@/components/feedback/Skeleton';

interface BookingStatsWidgetProps {
  monthDate: Date;
  onMonthChange: (date: Date) => void;
  total: number;
  cancelled: number;
  completed: number;
  isLoading: boolean;
  className?: string;
}

export default function BookingStatsWidget({
  monthDate,
  onMonthChange,
  total,
  cancelled,
  completed,
  isLoading,
  className,
}: BookingStatsWidgetProps) {
  return (
    <BentoCard
      className={className}
      header={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <Calendar size={18} />
            </div>
            <h3 className="text-lg font-outfit font-semibold">Prenotazioni</h3>
          </div>
          <MonthPicker value={monthDate} onChange={onMonthChange} />
        </div>
      }
    >
      {isLoading ? (
        <Skeleton className="h-52" />
      ) : (
        <div className="flex h-52 flex-col justify-center p-4">
          {/* Total */}
          <div className="text-center p-4 rounded-xl bg-white/5 border border-surface-border mb-3">
            <div className="text-4xl font-bold text-white font-outfit mb-1">{total}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">Totale Prenotazioni</div>
          </div>

          {/* Updated & Cancelled */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw size={16} className="text-accent" />
                <span className="text-xs text-text-secondary uppercase tracking-wider">Modificate</span>
              </div>
              <div className="text-2xl font-bold text-accent font-outfit">{completed}</div>
            </div>
            <div className="p-3 rounded-xl bg-danger/5 border border-danger/20">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={16} className="text-danger" />
                <span className="text-xs text-text-secondary uppercase tracking-wider">Annullate</span>
              </div>
              <div className="text-2xl font-bold text-danger font-outfit">{cancelled}</div>
            </div>
          </div>
        </div>
      )}
    </BentoCard>
  );
}
