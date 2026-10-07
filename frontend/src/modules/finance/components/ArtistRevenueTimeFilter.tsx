'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Icon from '@/common/components/ui/Icon';
import Button from '@/common/components/ui/Button';
import DatePicker from '@/common/components/forms/DatePicker';

interface ArtistRevenueTimeFilterProps {
  mode: 'day' | 'month' | 'year';
  onModeChange: (mode: 'day' | 'month' | 'year') => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function ArtistRevenueTimeFilter({
  mode,
  onModeChange,
  currentDate,
  onDateChange,
  onPrev,
  onNext,
  onToday,
}: ArtistRevenueTimeFilterProps) {
  const theme = useTheme();

  const getLabel = () => {
    if (mode === 'day') {
      return format(currentDate, "EEEE d MMMM yyyy", { locale: it });
    }
    if (mode === 'year') {
      return format(currentDate, "'Anno' yyyy", { locale: it });
    }
    return format(currentDate, "MMMM yyyy", { locale: it });
  };

  const formattedDayValue = format(currentDate, 'yyyy-MM-dd');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        p: 2,
        borderRadius: 3,
        backgroundColor: alpha(theme.palette.common.white, 0.03),
        border: 1,
        borderColor: alpha(theme.palette.common.white, 0.08),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          p: 0.5,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.common.white, 0.04),
          border: 1,
          borderColor: alpha(theme.palette.common.white, 0.08),
          gap: 0.5,
        }}
      >
        <Button
          variant={mode === 'day' ? 'primary' : 'ghost'}
          onClick={() => onModeChange('day')}
          sx={{ minHeight: 34, px: 2, fontSize: '0.8125rem', fontWeight: 600 }}
        >
          Giorno
        </Button>
        <Button
          variant={mode === 'month' ? 'primary' : 'ghost'}
          onClick={() => onModeChange('month')}
          sx={{ minHeight: 34, px: 2, fontSize: '0.8125rem', fontWeight: 600 }}
        >
          Mese
        </Button>
        <Button
          variant={mode === 'year' ? 'primary' : 'ghost'}
          onClick={() => onModeChange('year')}
          sx={{ minHeight: 34, px: 2, fontSize: '0.8125rem', fontWeight: 600 }}
        >
          Anno
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Button
          variant="secondary"
          onClick={onPrev}
          aria-label="Periodo precedente"
          sx={{
            minWidth: 38,
            width: 38,
            height: 38,
            p: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& .MuiButton-startIcon': { m: 0 },
          }}
        >
          <Icon name="chevronLeft" size={18} />
        </Button>

        {mode === 'day' ? (
          <Box sx={{ minWidth: 170 }}>
            <DatePicker
              value={formattedDayValue}
              onChange={(val) => {
                if (val) {
                  const [y, m, d] = val.split('-').map(Number);
                  onDateChange(new Date(y, m - 1, d));
                }
              }}
              size="sm"
              hideLabel
            />
          </Box>
        ) : (
          <Typography
            sx={{
              minWidth: { xs: 150, sm: 200 },
              textAlign: 'center',
              fontSize: { xs: '0.9375rem', sm: '1.125rem' },
              fontWeight: 700,
              color: 'text.primary',
              textTransform: 'capitalize',
              userSelect: 'none',
            }}
          >
            {getLabel()}
          </Typography>
        )}

        <Button
          variant="secondary"
          onClick={onNext}
          aria-label="Periodo successivo"
          sx={{
            minWidth: 38,
            width: 38,
            height: 38,
            p: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& .MuiButton-startIcon': { m: 0 },
          }}
        >
          <Icon name="chevronRight" size={18} />
        </Button>

        <Button
          variant="ghost"
          onClick={onToday}
          sx={{ minHeight: 36, px: 1.5, fontSize: '0.8125rem', color: 'primary.main', fontWeight: 600 }}
        >
          {mode === 'day' ? 'Oggi' : 'Corrente'}
        </Button>
      </Box>
    </Box>
  );
}
