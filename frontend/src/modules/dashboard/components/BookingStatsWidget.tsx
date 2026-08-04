"use client";

import DashboardWidgetCard from './DashboardWidgetCard';
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
import Card from '@/common/components/ui/Card';

interface BookingStatsWidgetProps {
  monthDate: Date;
  onMonthChange: (date: Date) => void;
  total: number;
  modified: number;
  rescheduled: number;
  annullated: number;
  cancelled: number;
  completed?: number;
  isLoading: boolean;
  className?: string;
}

export default function BookingStatsWidget({
  monthDate,
  onMonthChange,
  total,
  modified,
  rescheduled,
  annullated,
  cancelled,
  completed,
  isLoading = false,
  className,
}: BookingStatsWidgetProps) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const amberColor = theme.palette.warning.main;
  const purpleColor = theme.palette.custom.purple;
  const annullatedColor = theme.palette.error.main;
  const cancelledColor = theme.palette.text.secondary;

  return (
    <DashboardWidgetCard
      title="Prenotazioni"
      icon="calendar"
      headerActions={<MonthPicker value={monthDate} onChange={onMonthChange} />}
      isLoading={isLoading}
      className={className}
    >
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
                bgcolor: alpha(theme.palette.primary.main, isLight ? 0.04 : 0.03),
                border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.15 : 0.2)}`,
                borderRadius: 2,
                transition: theme.transitions.create(['all'], { duration: 300 }),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, isLight ? 0.08 : 0.07),
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
              {/* MODIFICATE (AMBER) */}
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    bgcolor: alpha(amberColor, isLight ? 0.06 : 0.1),
                    border: `1px solid ${alpha(amberColor, isLight ? 0.2 : 0.3)}`,
                    borderRadius: 2,
                    transition: theme.transitions.create(['all'], { duration: 300 }),
                    '&:hover': {
                      borderColor: amberColor,
                      bgcolor: alpha(amberColor, isLight ? 0.1 : 0.16),
                    },
                    height: '100%',
                  }}
                >
                  <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center', mb: 0.75 }}>
                    <Icon name="refreshCw" size={15} color={amberColor} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.03em' }}>
                      Modificate
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: amberColor }}>
                    {modified}
                  </Typography>
                </Box>
              </Grid>

              {/* SPOSTATE (PURPLE) */}
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    bgcolor: alpha(purpleColor, isLight ? 0.06 : 0.1),
                    border: `1px solid ${alpha(purpleColor, isLight ? 0.2 : 0.3)}`,
                    borderRadius: 2,
                    transition: theme.transitions.create(['all'], { duration: 300 }),
                    '&:hover': {
                      borderColor: purpleColor,
                      bgcolor: alpha(purpleColor, isLight ? 0.1 : 0.16),
                    },
                    height: '100%',
                  }}
                >
                  <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center', mb: 0.75 }}>
                    <Icon name="calendar" size={15} color={purpleColor} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.03em' }}>
                      Spostate
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: purpleColor }}>
                    {rescheduled}
                  </Typography>
                </Box>
              </Grid>

              {/* ANNULLATE (RED) */}
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    bgcolor: isLight ? alpha(annullatedColor, 0.06) : alpha(annullatedColor, 0.1),
                    border: `1px solid ${alpha(annullatedColor, isLight ? 0.2 : 0.3)}`,
                    borderRadius: 2,
                    transition: theme.transitions.create(['all'], { duration: 300 }),
                    '&:hover': {
                      borderColor: annullatedColor,
                      bgcolor: isLight ? alpha(annullatedColor, 0.1) : alpha(annullatedColor, 0.16),
                    },
                    height: '100%',
                  }}
                >
                  <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center', mb: 0.75 }}>
                    <Icon name="xCircle" size={15} color={annullatedColor} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.03em' }}>
                      Annullate
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: annullatedColor }}>
                    {annullated}
                  </Typography>
                </Box>
              </Grid>

              {/* CANCELLATE (ROSE/DARK RED) */}
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    bgcolor: isLight ? alpha(cancelledColor, 0.06) : alpha(cancelledColor, 0.1),
                    border: `1px solid ${alpha(cancelledColor, isLight ? 0.2 : 0.3)}`,
                    borderRadius: 2,
                    transition: theme.transitions.create(['all'], { duration: 300 }),
                    '&:hover': {
                      borderColor: cancelledColor,
                      bgcolor: isLight ? alpha(cancelledColor, 0.1) : alpha(cancelledColor, 0.16),
                    },
                    height: '100%',
                  }}
                >
                  <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center', mb: 0.75 }}>
                    <Icon name="trash2" size={15} color={cancelledColor} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.03em' }}>
                      Cancellate
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: cancelledColor }}>
                    {cancelled}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Stack>
    </DashboardWidgetCard>
  );
}
