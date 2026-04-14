"use client";

import { ArrowLeft, ArrowRight, DollarSign, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import BentoCard from '@/components/data-display/BentoCard';
import { Skeleton } from '@/components/feedback/Skeleton';

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
  const [showData, setShowData] = useState(true);

  const financeData = [
    { name: 'Entrate', value: showData ? (totalIncome || 0.01) : 0.01, color: '#00BFFF' },
    { name: 'Uscite', value: showData ? (totalExpense || 0.01) : 0.01, color: '#ff5252' },
  ];

  const hasMonthControls = Boolean(monthLabel && onPreviousMonth && onNextMonth);

  return (
    <BentoCard
      className={className}
      header={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <DollarSign size={18} />
            </div>
            <h3 className="text-lg font-outfit font-semibold">Panoramica Finanziaria</h3>
          </div>
          <div className="flex items-center gap-3">
            {hasMonthControls && (
              <div className="flex items-center gap-0.5 bg-white/5 rounded-lg px-2 py-1 border border-surface-border">
                <button
                  onClick={onPreviousMonth}
                  className="p-1 hover:bg-white/5 rounded transition-colors text-text-secondary hover:text-accent"
                  aria-label="Mese precedente"
                >
                  <ArrowLeft size={14} />
                </button>
                <span className="text-xs font-semibold text-accent px-2 min-w-20 text-center">
                  {monthLabel}
                </span>
                <button
                  onClick={onNextMonth}
                  className="p-1 hover:bg-white/5 rounded transition-colors text-text-secondary hover:text-accent"
                  aria-label="Mese successivo"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
            <button
              onClick={() => setShowData(!showData)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-accent border border-surface-border"
              title={showData ? 'Nascondi dati' : 'Mostra dati'}
            >
              {showData ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <Skeleton className="h-52" />
      ) : (
        <div className="flex h-52 items-center gap-6">
          <div className="flex-1 min-w-50">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}>
              <PieChart>
                <Pie
                  data={financeData}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="transparent"
                >
                  {financeData.map((entry, index) => (
                    <Cell key={`finance-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    background: 'rgba(10, 10, 10, 0.95)',
                    border: '1px solid rgba(0,191,255,0.2)',
                    borderRadius: '12px',
                    padding: '8px 12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-surface-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs text-text-secondary uppercase tracking-wider">Entrate</span>
              </div>
              <div className="text-xl font-bold text-white font-outfit">
                {showData ? `€ ${totalIncome.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '€ ••••••'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-surface-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-danger" />
                <span className="text-xs text-text-secondary uppercase tracking-wider">Uscite</span>
              </div>
              <div className="text-xl font-bold text-danger font-outfit">
                {showData ? `€ ${totalExpense.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '€ ••••••'}
              </div>
            </div>
          </div>
        </div>
      )}
    </BentoCard>
  );
}
