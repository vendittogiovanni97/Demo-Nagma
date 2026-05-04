"use client";

import MonthPicker from '@/components/ui/MonthPicker';
import {
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  useTheme
} from '@mui/material';
import { Search } from 'lucide-react';

interface FinanceFiltersProps {
  month: Date;
  onMonthChange: (date: Date) => void;
  search: string;
  onSearchChange: (val: string) => void;
  type: 'ALL' | 'INCOME' | 'EXPENSE';
  onTypeChange: (val: 'ALL' | 'INCOME' | 'EXPENSE') => void;
}

export default function FinanceFilters({
  month,
  onMonthChange,
  search,
  onSearchChange,
  type,
  onTypeChange
}: FinanceFiltersProps) {
  const theme = useTheme();

  return (
    <Stack
      sx={{
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        p: 2.5,
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`
      }}
      component="div"
    >

      <Stack sx={{ flexDirection: 'row', gap: 2, flex: 1 }} component="div">

        <TextField
          placeholder="Cerca per descrizione o categoria..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: 400 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }
          }}

        />

        <MonthPicker value={month} onChange={onMonthChange} />
      </Stack>

      <ToggleButtonGroup
        value={type}
        exclusive
        onChange={(_, val) => val && onTypeChange(val)}
        size="small"
        sx={{
          borderRadius: 2,
          '& .MuiToggleButton-root': {
            px: 2,
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }
          }
        }}
      >
        <ToggleButton value="ALL">Tutti</ToggleButton>
        <ToggleButton value="INCOME">Entrate</ToggleButton>
        <ToggleButton value="EXPENSE">Uscite</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
