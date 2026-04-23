"use client";

import { DollarSign, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import BentoCard from '@/components/data-display/BentoCard';
import Button from '@/components/ui/Button';
import MonthPicker from '@/components/ui/MonthPicker';
import { Skeleton } from '@/components/feedback/Skeleton';
import { formatPrice } from '@/utils/format';

interface FinanceOverviewWidgetProps {
  totalIncome: number;
  totalExpense: number;
  isLoading: boolean;
  className?: string;
  monthDate?: Date;
  onMonthChange?: (date: Date) => void;
}

export default function FinanceOverviewWidget({
  totalIncome,
  totalExpense,
  isLoading,
  className,
  monthDate,
  onMonthChange,
}: FinanceOverviewWidgetProps) {
  const [showData, setShowData] = useState(true);

  const financeData = [
    { name: 'Entrate', value: showData ? (totalIncome || 0.01) : 0.01, color: '#00BFFF' },
    { name: 'Uscite', value: showData ? (totalExpense || 0.01) : 0.01, color: '#ff5252' },
  ];

  const hasMonthControls = Boolean(monthDate && onMonthChange);

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
              <MonthPicker value={monthDate!} onChange={onMonthChange!} />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowData(!showData)}
              icon={showData ? <Eye size={16} /> : <EyeOff size={16} />}
              className="p-2 border border-surface-border"
              title={showData ? 'Nascondi dati' : 'Mostra dati'}
            />
          </div>
        </div>
      }
    >
      {isLoading ? (
        <Skeleton className="h-52" />
      ) : (
        <div className="flex h-52 items-stretch gap-6">
          <div className="flex-1 min-w-50">
            <ResponsiveContainer width="100%" height={208} initialDimension={{ width: 1, height: 1 }}>
              <PieChart>
                <Pie
                  data={financeData}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={totalIncome > 0 && totalExpense > 0 ? 4 : 0}
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
                {showData ? formatPrice(totalIncome) : '€ ••••••'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-surface-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-danger" />
                <span className="text-xs text-text-secondary uppercase tracking-wider">Uscite</span>
              </div>
              <div className="text-xl font-bold text-danger font-outfit">
                {showData ? formatPrice(totalExpense) : '€ ••••••'}
              </div>
            </div>
          </div>
        </div>
      )}
    </BentoCard>
  );
}
