"use client";

import { addDays, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';

type FormatStyle = 'short' | 'full';
type Variant = 'header' | 'minimal';

interface WeekNavigatorProps {
  weekStart: string | Date;
  onPrev: () => void;
  onNext: () => void;
  format?: FormatStyle;
  variant?: Variant;
  className?: string;
}

const variantStyles = {
  minimal: 'flex items-center bg-white/5 rounded-lg p-0.5 border border-surface-border',
  header: 'flex items-center gap-4 bg-surface/50 border border-surface-border rounded-xl px-2 py-1 shadow-lg backdrop-blur-md',
};

const textStyles = {
  minimal: 'px-3 font-bold text-xs min-w-32 text-center uppercase tracking-widest text-accent',
  header: 'text-white font-bold min-w-50 text-center tracking-wide',
};

const buttonSizeMap = {
  minimal: 16,
  header: 20,
};

export default function WeekNavigator({
  weekStart,
  onPrev,
  onNext,
  format: formatStyle = 'full',
  variant = 'minimal',
  className,
}: WeekNavigatorProps) {
  const date = typeof weekStart === 'string' ? new Date(weekStart) : weekStart;
  const endDate = addDays(date, 6);

  const displayText = formatStyle === 'short'
    ? `${format(date, 'dd MMM', { locale: it })} — ${format(endDate, 'dd MMM', { locale: it })}`
    : `${format(date, 'dd MMM', { locale: it })} — ${format(endDate, 'dd MMM yyyy', { locale: it })}`;

  const iconSize = buttonSizeMap[variant];

  return (
    <div className={cn(variantStyles[variant], className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrev}
        title="Settimana precedente"
        icon={<ChevronLeft size={iconSize} />}
        className="p-2"
      />
      <span className={textStyles[variant]}>{displayText}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        title="Settimana successiva"
        icon={<ChevronRight size={iconSize} />}
        className="p-2"
      />
    </div>
  );
}
