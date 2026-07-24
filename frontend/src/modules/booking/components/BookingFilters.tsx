"use client";

import SmartFilters from '@/common/components/common/SmartFilters';
import type { BookingStatus } from '@/modules/booking/model/booking.types';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import { useBreakpointContext } from '@/common/context/BreakpointContext';
import { CancelButton } from '@/common/components/ui/Button';
import FormSelect from '@/common/components/forms/FormSelect';
import Icon from '@/common/components/ui/Icon';

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
  onTodayClick: () => void;
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
  onTodayClick,
  onPrevMonth,
  onNextMonth,
}: BookingFiltersProps) {
  const theme = useMuiTheme();
  const { isXLarge } = useBreakpointContext();

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
        onChange={(val) => {
          if (val === 'oggi') {
            onTodayClick();
            return;
          }
          onSortOrderChange(val as 'asc' | 'desc');
        }}
        options={[
          { value: 'desc', label: 'Più recente' },
          { value: 'asc', label: 'Meno recente' },
          { value: 'oggi', label: 'Oggi' },
        ]}
        hideLabel
        sx={{ flex: isXLarge ? '0 1 180px' : '0 1 150px', minWidth: 100 }}
      />

      {/* Reset button if dates are filtered */}
      {(startDate || endDate) && (
        <CancelButton
          variant="secondary"
          size="sm"
          onClick={onResetDateRange}
          icon={<Icon name="x" size={16} />}
          sx={{
            flexShrink: 0,
            fontWeight: 700,
            color: 'warning.main',
            borderColor: 'warning.main',
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
            '&:hover': {
              borderColor: 'warning.main',
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.22),
            },
          }}
        >
          Azzera date
        </CancelButton>
      )}
    </SmartFilters>
  );
}
