'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Icon from '@/common/components/ui/Icon';

interface ReportsSummaryCardsProps {
  summary?: {
    period: { startDate: string; endDate: string };
    financial: {
      totalRevenue: number;
      totalExpenses: number;
      netProfit: number;
      transactionCount: number;
    };
    bookings: {
      totalBookings: number;
      completedBookings: number;
      cancelledBookings: number;
      completionRate: number;
    };
    customers: {
      totalActiveCustomers: number;
      newCustomersInPeriod: number;
    };
  };
  isLoading: boolean;
}

export function ReportsSummaryCards({ summary, isLoading }: ReportsSummaryCardsProps) {
  const theme = useTheme();

  if (isLoading || !summary) {
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="80%" height={40} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const { financial, bookings, customers } = summary;

  const cards = [
    {
      title: 'Ricavi Totali',
      value: `€ ${financial.totalRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      icon: <Icon name="trendingUp" size={32} color={theme.palette.success.main} />,
      subtitle: `${financial.transactionCount} transazioni`,
      borderColor: theme.palette.success.main,
    },
    {
      title: 'Spese Totali',
      value: `€ ${financial.totalExpenses.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      icon: <Icon name="trendingDown" size={32} color={theme.palette.error.main} />,
      subtitle: `Utile Netto: € ${financial.netProfit.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      borderColor: theme.palette.error.main,
    },
    {
      title: 'Appuntamenti',
      value: `${bookings.completedBookings} / ${bookings.totalBookings}`,
      icon: <Icon name="calendar" size={32} color={theme.palette.primary.main} />,
      subtitle: `Tasso completamento: ${bookings.completionRate}%`,
      borderColor: theme.palette.primary.main,
    },
    {
      title: 'Nuovi Clienti',
      value: `+${customers.newCustomersInPeriod}`,
      icon: <Icon name="user" size={32} color={theme.palette.info.main} />,
      subtitle: `Totale attivi: ${customers.totalActiveCustomers}`,
      borderColor: theme.palette.info.main,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {cards.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card
            sx={{
              borderLeft: `4px solid ${card.borderColor}`,
              boxShadow: 2,
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  {card.title}
                </Typography>
                {card.icon}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {card.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {card.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
