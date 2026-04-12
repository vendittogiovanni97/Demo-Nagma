"use client";

import { BarChart3 } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from 'recharts';

import BentoCard from '@/components/data-display/BentoCard';
import type { ArtistPerformance } from '@/types/transaction';

interface ArtistPerformanceWidgetProps {
  performance?: ArtistPerformance[];
  className?: string;
}

export default function ArtistPerformanceWidget({
  performance,
  className,
}: ArtistPerformanceWidgetProps) {
  return (
    <BentoCard
      className={className}
      header={
        <div className="flex items-center gap-2">
          <BarChart3 className="text-accent" size={18} />
          <h3 className="text-lg font-outfit">Top Artisti</h3>
        </div>
      }
      contentClassName="min-h-0"
    >
      {!performance?.length ? (
        <div className="flex items-center justify-center h-full text-text-secondary text-sm italic">
          Nessun dato disponibile
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={performance}>
            <XAxis dataKey="artistName" tick={{ fill: '#888', fontSize: 10 }} />
            <Bar dataKey="revenue" fill="#00BFFF" radius={[5, 5, 0, 0]} />
            <RechartsTooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ background: '#0a0a0a', border: 'none', borderRadius: 12 }}
              formatter={(value: number | string | readonly (number | string)[] | undefined) => {
                const rawValue = Array.isArray(value) ? value[0] : value;
                const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0);
                return [`EUR ${numericValue.toFixed(2)}`, 'Ricavo'];
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </BentoCard>
  );
}
