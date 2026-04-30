"use client";

import SmartFilters from '@/components/common/SmartFilters';
import Button from '@/components/ui/Button';
import { X } from 'lucide-react';

interface Props {
  search: string;
  startDate: string;
  endDate: string;
  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onResetDates: () => void;
}

export default function CustomerFilters({
  search,
  startDate,
  endDate,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onResetDates,
}: Props) {
  return (
    <SmartFilters
      alignWithMonthPicker
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: "Cerca cliente...",
      }}
      dateRange={{
        start: { value: startDate, onChange: onStartDateChange },
        end: { value: endDate, onChange: onEndDateChange },
      }}
    >
      {(startDate || endDate) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetDates}
          icon={<X size={14} />}
          sx={{ fontSize: '0.75rem', px: 1 }}
        >
          Reset
        </Button>
      )}
    </SmartFilters>
  );
}
