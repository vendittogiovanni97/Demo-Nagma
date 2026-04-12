"use client";

import { Activity } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import BentoCard from '@/components/data-display/BentoCard';
import type { MonthlyTrend } from '@/types/transaction';

interface MonthlyTrendWidgetProps {
  trends?: MonthlyTrend[];
  className?: string;
}

export default function MonthlyTrendWidget({ trends, className }: MonthlyTrendWidgetProps) {
  return (
    <BentoCard
      className={className}
      header={
        <div className="flex items-center gap-2">
          <Activity className="text-accent" size={18} />
          <h3 className="text-lg font-outfit">Trend Mensile</h3>
        </div>
      }
      contentClassName="min-h-0"
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200} initialDimension={{ width: 1, height: 1 }}>
        <AreaChart data={trends}>
          <defs>
            <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00BFFF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00BFFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" stroke="#444" fontSize={10} />
          <YAxis stroke="#444" fontSize={10} />
          <RechartsTooltip
            contentStyle={{ background: '#0a0a0a', border: 'none', borderRadius: '12px' }}
          />
          <Area type="monotone" dataKey="income" stroke="#00BFFF" fill="url(#colorInc)" />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#ff5252"
            fill="transparent"
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </BentoCard>
  );
}
