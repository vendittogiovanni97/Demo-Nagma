"use client";

import { ENDPOINTS } from '@/api/endpoints';
import BookingStatsWidget from '@/components/widgets/dashboard/BookingStatsWidget';
import FinanceOverviewWidget from '@/components/widgets/dashboard/FinanceOverviewWidget';
import TodayAgendaWidget from '@/components/widgets/dashboard/TodayAgendaWidget';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/hooks/domain/useBookings';
import { useBookingStats } from '@/hooks/domain/useBookings';
import { transactionService } from '@/services/transaction.service';
import type { FinanceSummary } from '@/types/transaction';
import { Box, Container, Grid, Skeleton } from '@mui/material';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading) {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" height={80} width="100%" />
      </Box>
    );
  }

  if (!isAuthenticated) return null;

  return <DashboardContent />;
}

function DashboardContent() {
  const [financeDate, setFinanceDate] = useState<Date | null>(null);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);

  useEffect(() => {
    setFinanceDate(new Date());
    setBookingDate(new Date());
  }, []);

  const { data: financeSummary, isLoading: isFinanceLoading } = useSWR<FinanceSummary>(
    financeDate ? [ENDPOINTS.TRANSACTIONS.SUMMARY, format(financeDate, 'yyyy-MM')] : null,
    ([, monthStr]) => transactionService.getSummary(monthStr as string)
  );

  const bookingMonthStr = bookingDate ? format(bookingDate, 'yyyy-MM') : null;
  const { data: bookingStats, isLoading: isStatsLoading } = useBookingStats(bookingMonthStr ?? '');
  const { data: dailyBookings, isLoading: isDailyLoading } = useBookings(bookingMonthStr ?? '');

  if (!financeDate || !bookingDate) {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" height={192} width="100%" />
        <Skeleton variant="rectangular" height={192} width="100%" />
      </Box>
    );
  }
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
