"use client";

import BookingStatsWidget from '@/modules/dashboard/components/BookingStatsWidget';
import FinanceOverviewWidget from '@/modules/dashboard/components/FinanceOverviewWidget';
import TodayAgendaWidget from '@/modules/dashboard/components/TodayAgendaWidget';
import { useBookings, useBookingStats } from '@/modules/booking/hooks/useBooking';
import { useTransactionSummary } from '@/modules/spese/hooks/useTransactions';
import { Box, Container, Grid } from '@mui/material';
import { format } from 'date-fns';
import { useState } from 'react';

export default function DashboardPage() {
  return <DashboardContent />;
}

function DashboardContent() {
  const [financeDate, setFinanceDate] = useState(() => new Date());
  const [bookingDate, setBookingDate] = useState(() => new Date());

  const { data: financeSummary, isLoading: isFinanceLoading } = useTransactionSummary(
    format(financeDate, 'yyyy-MM')
  );

  const bookingMonthStr = format(bookingDate, 'yyyy-MM');
  const { data: bookingStats, isLoading: isStatsLoading } = useBookingStats(bookingMonthStr);
  
  // Today's bookings for TodayAgendaWidget: fixed to current month
  const currentMonthStr = format(new Date(), 'yyyy-MM');
  const { data: dailyResult, isLoading: isDailyLoading } = useBookings({ month: currentMonthStr });
  const dailyBookings = dailyResult?.data;

  const totalIncome = financeSummary?.totalIncome ?? 0;
  const totalExpense = financeSummary?.totalExpense ?? 0;

  return (
    <Container maxWidth={false} disableGutters sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
      <Grid container spacing={2} sx={{ flex: 'auto', overflow: 'hidden' }}>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FinanceOverviewWidget
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            isLoading={isFinanceLoading}
            monthDate={financeDate}
            onMonthChange={setFinanceDate}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <BookingStatsWidget
            monthDate={bookingDate}
            onMonthChange={setBookingDate}
            total={bookingStats?.total ?? 0}
            cancelled={bookingStats?.cancelled ?? 0}
            completed={bookingStats?.completed ?? 0}
            isLoading={isStatsLoading}
          />
        </Grid>
      </Grid>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <TodayAgendaWidget
          bookings={dailyBookings}
          isLoading={isDailyLoading}
        />
      </Box>
    </Container>
  );
}
