"use client";

import SmartFilters from '@/components/common/SmartFilters';
import type { BookingStatus } from '@/modules/booking/model/booking.types';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import FormSelect from '@/components/forms/FormSelect';
import { X } from 'lucide-react';

interface BookingFiltersProps {
  monthLabel: string;
  search: string;
  startDate: string;
  endDate: string;
  statusFilter: BookingStatus | 'ALL';
  sortOrder: 'asc' | 'desc';
  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onStatusFilterChange: (value: BookingStatus | 'ALL') => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onResetDateRange: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function BookingFilters({
  monthLabel,
  search,
  startDate,
  endDate,
  statusFilter,
  sortOrder,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onStatusFilterChange,
  onSortOrderChange,
  onResetDateRange,
  onPrevMonth,
  onNextMonth,
}: BookingFiltersProps) {
  const theme = useMuiTheme();
  const { isXLarge } = useTheme();

  return (
    <SmartFilters
      monthPicker={{
        label: monthLabel,
        onPrev: onPrevMonth,
        onNext: onNextMonth,
      }}
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: "Cerca cliente, artista...",
      }}
      dateRange={{
        start: { value: startDate, onChange: onStartDateChange },
        end: { value: endDate, onChange: onEndDateChange },
      }}
    >
      {/* Status */}
      <FormSelect
        label="Stato"
        value={statusFilter}
        onChange={(val) => onStatusFilterChange(val as BookingStatus | 'ALL')}
        options={[
          { value: 'ALL', label: 'Tutti' },
          { value: 'CREATO', label: 'Creato' },
          { value: 'CONFERMATO', label: 'Confermato' },
          { value: 'MODIFICATO', label: 'Modificato' },
          { value: 'SPOSTATO', label: 'Spostato' },
          { value: 'COMPLETATO', label: 'Completato' },
          { value: 'ANNULLATO', label: 'Annullato' },
          { value: 'CANCELLATO', label: 'Cancellato' },
        ]}
        hideLabel
        sx={{ flex: isXLarge ? '0 1 180px' : '0 1 150px', minWidth: 100 }}
      />

      {/* Sort */}
      <FormSelect
        label="Ordinamento"
        value={sortOrder}
        onChange={(val) => onSortOrderChange(val as 'asc' | 'desc')}
        options={[
          { value: 'desc', label: 'Più recente' },
          { value: 'asc', label: 'Meno recente' },
        ]}
        hideLabel
        sx={{ flex: isXLarge ? '0 1 180px' : '0 1 150px', minWidth: 100 }}
      />

      {/* Reset button if dates are filtered */}
      {(startDate || endDate) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetDateRange}
          icon={<X size={14} />}
          sx={{ fontSize: '0.75rem', px: 1 }}
        >
          Reset
        </Button>
      )}
    </SmartFilters>
  );
}
