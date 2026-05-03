"use client";

import MonthPicker from '@/components/ui/MonthPicker';
import { Receipt } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

interface SpesaFiltersProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export default function SpesaFilters({ currentDate, onDateChange }: SpesaFiltersProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            height: 40,
            width: 40,
            borderRadius: 2,
            backgroundColor: 'rgba(0, 191, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Receipt size={22} style={{ color: theme.palette.primary.main }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
            Spese Libere
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Annotazioni rapide di spese
          </Typography>
        </Box>
      </Box>
      <MonthPicker value={currentDate} onChange={onDateChange} />
    </Box>
  );
}
