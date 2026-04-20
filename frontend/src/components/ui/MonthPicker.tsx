"use client";

import { addMonths, format, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

interface MonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export default function MonthPicker({ value, onChange, className }: MonthPickerProps) {
  const monthLabel = format(value, 'MMMM yyyy', { locale: it });

  return (
    <div className={`flex items-center gap-0.5 bg-white/5 rounded-lg px-2 py-1 border border-surface-border${className ? ` ${className}` : ''}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(subMonths(value, 1))}
        icon={<ArrowLeft size={14} />}
        className="p-1"
        aria-label="Mese precedente"
      />
      <span className="text-xs font-semibold text-accent px-3 min-w-28 text-center capitalize">
        {monthLabel}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(addMonths(value, 1))}
        icon={<ArrowRight size={14} />}
        className="p-1"
        aria-label="Mese successivo"
      />
    </div>
  );
}
