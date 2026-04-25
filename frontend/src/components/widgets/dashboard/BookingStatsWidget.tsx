"use client";

import { Calendar, RefreshCw, XCircle } from 'lucide-react';

import MonthPicker from '@/components/ui/MonthPicker';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

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
      sx={{
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.primary.main}20`,
        borderRadius: 2,
        transition: theme.transitions.create(['all'], { duration: 300 }),
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[3],
        },
        height: '100%',
      }}
    >
      <CardHeader
        title={
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
              <Calendar size={18} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Prenotazioni
            </Typography>
          </Stack>
        }
        action={<MonthPicker value={monthDate} onChange={onMonthChange} />}
        sx={{ pb: 1.5, borderBottom: `1px solid ${theme.palette.primary.main}12` }}
      />
      <CardContent>
        {isLoading ? (
          <Stack useFlexGap sx={{ gap: 2 }}>
            <Skeleton variant="rectangular" height={200} />
          </Stack>
        ) : (
          <Stack useFlexGap sx={{ gap: 2, justifyContent: 'center', minHeight: 180 }}>
            <Card
              variant="outlined"
              sx={{
                textAlign: 'center',
                p: 1.5,
                bgcolor: `${theme.palette.primary.main}08`,
                border: `1px solid ${theme.palette.primary.main}20`,
                transition: theme.transitions.create(['all'], { duration: 300 }),
                '&:hover': {
                  boxShadow: theme.shadows[1],
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
            </Card>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, sm: 12, md: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: `${theme.palette.primary.main}08`,
                    border: `1px solid ${theme.palette.primary.main}20`,
                    transition: theme.transitions.create(['all'], { duration: 300 }),
                    '&:hover': {
                      boxShadow: theme.shadows[1],
                      borderColor: theme.palette.primary.main,
                    },
                    height: '100%',
                  }}
                >
                  <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
                    <RefreshCw size={16} color={theme.palette.primary.main} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: theme.palette.text.secondary }}>
                      Modificate
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {completed}
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 12, md: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: `${theme.palette.error.main}08`,
                    border: `1px solid ${theme.palette.error.main}20`,
                    transition: theme.transitions.create(['all'], { duration: 300 }),
                    '&:hover': {
                      boxShadow: theme.shadows[1],
                      borderColor: theme.palette.error.main,
                    },
                    height: '100%',
                  }}
                >
                  <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
                    <XCircle size={16} color={theme.palette.error.main} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: theme.palette.text.secondary }}>
                      Annullate
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                    {cancelled}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
