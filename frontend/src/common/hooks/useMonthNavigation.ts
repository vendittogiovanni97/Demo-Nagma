"use client";

import { useCallback, useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export function useMonthNavigation(initialDate: Date = new Date()) {
  const [currentMonth, setCurrentMonth] = useState(initialDate);

  const monthStr = format(currentMonth, 'yyyy-MM');
  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: it });

  const prevMonth = useCallback(() => {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  const setMonth = useCallback((date: Date) => {
    setCurrentMonth(date);
  }, []);

  return {
    currentMonth,
    setCurrentMonth: setMonth,
    monthStr,
    monthLabel,
    prevMonth,
    nextMonth,
  };
}
