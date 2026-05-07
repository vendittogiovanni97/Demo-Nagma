"use client";

import { Box } from '@mui/material';
import SmartFilters from '@/components/common/SmartFilters';
import FormSelect from '@/components/forms/FormSelect';
import type { BookingAction } from '@/modules/booking-history/api/booking-history.api';

interface BookingHistoryFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string;
  onEndDateChange: (v: string) => void;
  action: BookingAction | '';
  onActionChange: (v: BookingAction | '') => void;
  artistId: string;
  onArtistIdChange: (v: string) => void;
  artistOptions: Array<{ label: string, value: string }>;
}

export default function BookingHistoryFilters({
  search,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  action,
  onActionChange,
  artistId,
  onArtistIdChange,
  artistOptions,
}: BookingHistoryFiltersProps) {
  return (
    <SmartFilters
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: "Cerca cliente o telefono..."
      }}
      dateRange={{
        start: { value: startDate, onChange: onStartDateChange },
        end: { value: endDate, onChange: onEndDateChange },
      }}
      select={{
        label: "Azione",
        value: action,
        onChange: (val) => onActionChange(val as BookingAction | ''),
        placeholder: "Tutte le azioni",
        options: [
          { label: 'Creato', value: 'CREATO' },
          { label: 'Confermato', value: 'CONFERMATO' },
          { label: 'Modificato', value: 'MODIFICATO' },
          { label: 'Spostato', value: 'SPOSTATO' },
          { label: 'Completato', value: 'COMPLETATO' },
          { label: 'Annullato', value: 'ANNULLATO' },
          { label: 'Cancellato', value: 'CANCELLATO' },
        ],
      }}
    >
      <Box sx={{ width: { xs: '100%', sm: 160 } }}>
        <FormSelect
          value={artistId}
          onChange={onArtistIdChange}
          options={artistOptions}
          placeholder="Tutti gli artisti"
          hideLabel
          sx={{ '& .MuiInputBase-root': { height: 36 } }}
        />
      </Box>
    </SmartFilters>
  );
}
