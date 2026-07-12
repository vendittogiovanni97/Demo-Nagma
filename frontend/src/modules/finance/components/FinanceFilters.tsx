"use client";

import FormInput from '@/common/components/forms/FormInput';
import MonthPicker from '@/common/components/ui/MonthPicker';
import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme
} from '@mui/material';
import Icon, { Search } from '@/common/components/ui/Icon';

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

        <FormInput
          placeholder="Cerca per descrizione o categoria..."
          value={search}
          onChange={onSearchChange}
          size="sm"
          icon={Search}
          sx={{ maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
