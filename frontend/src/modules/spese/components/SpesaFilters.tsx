"use client";

import MonthPicker from '@/components/ui/MonthPicker';
import Box from '@mui/material/Box';

interface SpesaFiltersProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export default function SpesaFilters({ currentDate, onDateChange }: SpesaFiltersProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <MonthPicker value={currentDate} onChange={onDateChange} />
    </Box>
  );
}
