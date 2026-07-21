"use client";

import Icon from '@/common/components/ui/Icon';

import MonthPicker from '@/common/components/ui/MonthPicker';
import { alpha } from '@mui/material/styles';
import {
    Box,
    Grid,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { Skeleton } from '@/common/components/feedback/Skeleton';
import Card from '@/common/components/ui/Card';

interface BookingStatsWidgetProps {
  monthDate: Date;
  onMonthChange: (date: Date) => void;
  total: number;
  cancelled: number;
  completed: number;
  isLoading: boolean;
  className?: string;
}

export default function BookingStatsWidget({
  monthDate,
  onMonthChange,
  total,
  cancelled,
  completed,
  isLoading,
  className,
}: BookingStatsWidgetProps) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  return (
    <Card
      className={className}
      variant="glass"
      size="md"
      sx={{
        bgcolor: isLight ? 'background.paper' : alpha(theme.palette.background.default, 0.5),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        boxShadow: isLight
          ? `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`
          : `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
        transition: theme.transitions.create(['all'], { duration: 300 }),
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.3),
          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: { xs: 1, md: 1.5 }, borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center' }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: 1.25,
              bgcolor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="calendar" size={18} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Prenotazioni
          </Typography>
        </Stack>
        <MonthPicker value={monthDate} onChange={onMonthChange} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', opacity: isLoading ? 0.65 : 1, transition: 'opacity 0.2s ease-in-out' }}>
        <Stack useFlexGap sx={{ gap: { xs: 1.5, md: 2 }, justifyContent: 'center', flex: 1 }}>
            <Box
              sx={{
                textAlign: 'center',
                p: { xs: 2, md: 3 },
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isLight ? alpha(theme.palette.primary.main, 0.04) : `${theme.palette.primary.main}08`,
                border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.15 : 0.2)}`,
                borderRadius: 2,
                transition: theme.transitions.create(['all'], { duration: 300 }),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: isLight ? alpha(theme.palette.primary.main, 0.08) : `${theme.palette.primary.main}12`,
                },
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.25, color: 'text.primary', fontFamily: 'Outfit, sans-serif' }}>
                {total}
              </Typography>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em' }}>
                Totale Prenotazioni
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 1, md: 1.5 }}>
              <Grid size={{ xs: 6, sm: 12, md: 6 }}>
                <Box
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    bgcolor: isLight ? alpha(theme.palette.primary.main, 0.04) : `${theme.palette.primary.main}08`,
                    border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.15 : 0.2)}`,
                    borderRadius: 2,
                    transition: theme.transitions.create(['all'], { duration: 300 }),
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: isLight ? alpha(theme.palette.primary.main, 0.08) : `${theme.palette.primary.main}12`,
                    },
                    height: '100%',
                  }}
                >
                  <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
                    <Icon name="refreshCw" size={16} color={theme.palette.primary.main} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em' }}>
                      Modificate
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                    {completed}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 12, md: 6 }}>
                <Box
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    bgcolor: isLight ? alpha(theme.palette.error.main, 0.04) : `${theme.palette.error.main}08`,
                    border: `1px solid ${alpha(theme.palette.error.main, isLight ? 0.15 : 0.2)}`,
                    borderRadius: 2,
                    transition: theme.transitions.create(['all'], { duration: 300 }),
                    '&:hover': {
                      borderColor: theme.palette.error.main,
                      bgcolor: isLight ? alpha(theme.palette.error.main, 0.08) : `${theme.palette.error.main}12`,
                    },
                    height: '100%',
                  }}
                >
                  <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
                    <Icon name="xCircle" size={16} color={theme.palette.error.main} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em' }}>
                      Annullate
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.error.main }}>
                    {cancelled}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Stack>
      </Box>
    </Card>
  );
}
