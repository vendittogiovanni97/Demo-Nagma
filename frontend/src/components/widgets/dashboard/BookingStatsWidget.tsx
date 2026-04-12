"use client";

import { ArrowLeft, ArrowRight } from 'lucide-react';

import BentoCard from '@/components/data-display/BentoCard';
import { Skeleton } from '@/components/feedback/Skeleton';

interface BookingStatsWidgetProps {
  monthLabel: string;
  total: number;
  cancelled: number;
  completed: number;
  isLoading: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  className?: string;
}

export default function BookingStatsWidget({
  monthLabel,
  total,
  cancelled,
  completed,
  isLoading,
  onPreviousMonth,
  onNextMonth,
  className,
}: BookingStatsWidgetProps) {
  return (
    <BentoCard
      className={className}
      header={
        <div className="flex justify-between items-center">
          <button onClick={onPreviousMonth} className="p-2 hover:bg-white/5 rounded-lg">
            <ArrowLeft size={14} />
          </button>
          <span className="text-[10px] font-bold text-accent uppercase">{monthLabel}</span>
          <button onClick={onNextMonth} className="p-2 hover:bg-white/5 rounded-lg">
            <ArrowRight size={14} />
          </button>
        </div>
      }
      contentClassName="flex flex-col justify-between"
    >
      {isLoading ? (
        <Skeleton className="h-20" />
      ) : (
        <div>
          <div className="text-4xl font-outfit font-bold text-white">{total}</div>
          <div className="text-xs text-text-secondary uppercase mt-1">Prenotazioni Totali</div>
          <div className="flex justify-between mt-4 pt-4 border-t border-white/5">
            <span className="text-danger text-xs font-bold">{cancelled} Canc.</span>
            <span className="text-success text-xs font-bold">{completed} Fatti</span>
          </div>
        </div>
      )}
    </BentoCard>
  );
}
