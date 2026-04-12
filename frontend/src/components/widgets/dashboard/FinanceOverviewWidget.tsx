"use client";

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

import { Skeleton } from '@/components/feedback/Skeleton';
import BentoCard from '@/components/data-display/BentoCard';

interface FinanceOverviewWidgetProps {
  totalIncome: number;
  totalExpense: number;
  isLoading: boolean;
  className?: string;
  monthLabel?: string;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
}

export default function FinanceOverviewWidget({
  totalIncome,
  totalExpense,
  isLoading,
  className,
  monthLabel,
  onPreviousMonth,
  onNextMonth,
}: FinanceOverviewWidgetProps) {
  const financeData = [
    { name: 'Entrate', value: totalIncome || 0.01, color: '#00BFFF' },
    { name: 'Uscite', value: totalExpense || 0.01, color: '#ff5252' },
  ];

  const hasMonthControls = Boolean(monthLabel && onPreviousMonth && onNextMonth);

  return (
    <BentoCard
      className={className}
      header={
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-outfit">Panoramica Finanziaria</h3>
          {hasMonthControls && (
            <div className="flex items-center gap-0.5 bg-white/5 rounded-full px-0.5 py-0.5 border border-surface-border h-7">
              <button
                onClick={onPreviousMonth}
                className="p-1 hover:bg-white/5 rounded-full text-text-secondary hover:text-accent transition-colors"
                aria-label="Mese precedente"
              >
                <ArrowLeft size={12} />
              </button>
              <span className="text-[10px] font-bold text-accent uppercase px-1.5 min-w-[52px] text-center leading-none">
                {monthLabel}
              </span>
              <button
                onClick={onNextMonth}
                className="p-1 hover:bg-white/5 rounded-full text-text-secondary hover:text-accent transition-colors"
                aria-label="Mese successivo"
              >
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      }
    >
      {isLoading ? (
        <Skeleton className="h-48" />
      ) : (
        <div className="flex h-48 flex-1 items-center gap-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={financeData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                stroke="transparent"
              >
                {financeData.map((entry, index) => (
                  <Cell key={`finance-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(0,191,255,0.2)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-1/2 flex flex-col gap-4">
            <div>
              <div className="text-[10px] text-text-secondary uppercase tracking-widest">Entrate</div>
              <div className="text-xl text-white font-bold font-outfit">EUR {totalIncome.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-secondary uppercase tracking-widest">Uscite</div>
              <div className="text-xl text-danger font-bold font-outfit">EUR {totalExpense.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </BentoCard>
  );
}
