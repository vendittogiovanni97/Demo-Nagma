"use client";

import useSWR from 'swr';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, subMonths, addMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/feedback/Skeleton';
import ArtistPerformanceWidget from '@/components/widgets/dashboard/ArtistPerformanceWidget';
import BookingStatsWidget from '@/components/widgets/dashboard/BookingStatsWidget';
import FinanceOverviewWidget from '@/components/widgets/dashboard/FinanceOverviewWidget';
import MonthlyTrendWidget from '@/components/widgets/dashboard/MonthlyTrendWidget';
import QuickActionsWidget from '@/components/widgets/dashboard/QuickActionsWidget';
import TodayAgendaWidget from '@/components/widgets/dashboard/TodayAgendaWidget';
import { transactionService } from '@/services/transaction.service';
import { ENDPOINTS } from '@/api/endpoints';
import { useBookings, useBookingStats } from '@/hooks/domain';
import type { FinanceSummary, MonthlyTrend, ArtistPerformance } from '@/types/transaction';

export default function DashboardPage() {
  const router = useRouter();
  const [financeDate, setFinanceDate] = useState(new Date());
  const [bookingDate, setBookingDate] = useState(new Date());
  const financeMonthStr = format(financeDate, 'yyyy-MM');
  const bookingMonthStr = format(bookingDate, 'yyyy-MM');
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data: financeSummary, isLoading: isFinanceLoading } = useSWR<FinanceSummary>(
    [ENDPOINTS.TRANSACTIONS.SUMMARY, financeMonthStr],
    () => transactionService.getSummary(financeMonthStr)
  );

  const { data: bookingStats, isLoading: isStatsLoading } = useBookingStats(bookingMonthStr);
  const { data: dailyBookings, isLoading: isDailyLoading } = useBookings(bookingMonthStr);

  const { data: trends } = useSWR<MonthlyTrend[]>(
    ENDPOINTS.TRANSACTIONS.TRENDS,
    () => transactionService.getTrends()
  );

  const { data: performance } = useSWR<ArtistPerformance[]>(
    ENDPOINTS.TRANSACTIONS.PERFORMANCE,
    () => transactionService.getArtistPerformance()
  );
  const totalIncome = financeSummary?.totalIncome || 0;
  const totalExpense = financeSummary?.totalExpense || 0;
  const financeMonthLabel = format(financeDate, 'MMM yyyy', { locale: it });
  const bookingMonthLabel = format(bookingDate, 'MMM yyyy', { locale: it });

  if (isAuthLoading) return <div className="p-10"><Skeleton className="h-20 w-full" /></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-auto">
        <FinanceOverviewWidget
          className="lg:col-span-2"
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          isLoading={isFinanceLoading}
          monthLabel={financeMonthLabel}
          onPreviousMonth={() => setFinanceDate(subMonths(financeDate, 1))}
          onNextMonth={() => setFinanceDate(addMonths(financeDate, 1))}
        />

        <MonthlyTrendWidget className="lg:col-span-2 h-75" trends={trends} />

        <BookingStatsWidget
          className="lg:col-span-1"
          monthLabel={bookingMonthLabel}
          total={bookingStats?.total || 0}
          cancelled={bookingStats?.cancelled || 0}
          completed={bookingStats?.completed || 0}
          isLoading={isStatsLoading}
          onPreviousMonth={() => setBookingDate(subMonths(bookingDate, 1))}
          onNextMonth={() => setBookingDate(addMonths(bookingDate, 1))}
        />

        <ArtistPerformanceWidget className="lg:col-span-1 h-50" performance={performance} />

        <TodayAgendaWidget
          className="lg:col-span-1 lg:row-span-2"
          bookings={dailyBookings}
          isLoading={isDailyLoading}
        />

        <QuickActionsWidget
          className="lg:col-span-1"
          onCustomersClick={() => router.push('/clienti')}
          onCreamsClick={() => router.push('/creams')}
        />

      </div>
    </div>
  );
}
