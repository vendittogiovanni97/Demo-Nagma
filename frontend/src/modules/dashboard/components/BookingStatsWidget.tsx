"use client";

import Icon from '@/common/components/ui/Icon';

import MonthPicker from '@/common/components/ui/MonthPicker';
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

  return (
    <Card
      className={className}
      variant="minimal"
      size="md"
      sx={{
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.primary.main}20`,
        transition: theme.transitions.create(['all'], { duration: 300 }),
        '&:hover': {
          borderColor: theme.palette.primary.main,
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: { xs: 1, md: 1.5 }, borderBottom: `1px solid ${theme.palette.primary.main}12` }}>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <Stack useFlexGap sx={{ gap: 2 }}>
            <Skeleton variant="rect" height={200} />
          </Stack>
        ) : (
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
                bgcolor: `${theme.palette.primary.main}08`,
                border: `1px solid ${theme.palette.primary.main}20`,
                borderRadius: 2,
                transition: theme.transitions.create(['all'], { duration: 300 }),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.25 }}>
                {total}
              </Typography>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', color: theme.palette.text.secondary }}>
                Totale Prenotazioni
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 1, md: 1.5 }}>
              <Grid size={{ xs: 6, sm: 12, md: 6 }}>
                <Box
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    bgcolor: `${theme.palette.primary.main}08`,
                    border: `1px solid ${theme.palette.primary.main}20`,
                    borderRadius: 2,
                    transition: theme.transitions.create(['all'], { duration: 300 }),
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                    },
                    height: '100%',
                  }}
                >
                  <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
                    <Icon name="refreshCw" size={16} color={theme.palette.primary.main} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: theme.palette.text.secondary }}>
                      Modificate
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {completed}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 12, md: 6 }}>
                <Box
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    bgcolor: `${theme.palette.error.main}08`,
                    border: `1px solid ${theme.palette.error.main}20`,
                    borderRadius: 2,
                    transition: theme.transitions.create(['all'], { duration: 300 }),
                    '&:hover': {
                      borderColor: theme.palette.error.main,
                    },
                    height: '100%',
                  }}
                >
                  <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
                    <Icon name="xCircle" size={16} color={theme.palette.error.main} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: theme.palette.text.secondary }}>
                      Annullate
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                    {cancelled}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        )}
      </Box>
    </Card>
  );
}
