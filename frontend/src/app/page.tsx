"use client";

import { ENDPOINTS } from '@/api/endpoints';
import { Skeleton } from '@/components/feedback/Skeleton';
import BookingStatsWidget from '@/components/widgets/dashboard/BookingStatsWidget';
import FinanceOverviewWidget from '@/components/widgets/dashboard/FinanceOverviewWidget';
import TodayAgendaWidget from '@/components/widgets/dashboard/TodayAgendaWidget';
import { useAuth } from '@/context/AuthContext';
import { useBookings, useBookingStats } from '@/hooks/domain';
import { transactionService } from '@/services/transaction.service';
import type { FinanceSummary } from '@/types/transaction';
import { addMonths, format, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
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
      <div className="flex-1 flex flex-col gap-6 overflow-hidden pt-5">
        <Skeleton className="h-20 w-full" />
      </div>
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
      <div className="flex-1 flex flex-col gap-6 overflow-hidden pt-5">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const financeMonthStr = format(financeDate, 'yyyy-MM');
  const totalIncome = financeSummary?.totalIncome ?? 0;
  const totalExpense = financeSummary?.totalExpense ?? 0;
  const netBalance = totalIncome - totalExpense;
  const financeMonthLabel = format(financeDate, 'MMM yyyy', { locale: it });
  const bookingMonthLabel = format(bookingDate, 'MMM yyyy', { locale: it });

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden pt-5">
      {/* Main Dashboard Grid - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Finance */}
        <div className="flex flex-col gap-6">
          <FinanceOverviewWidget
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            isLoading={isFinanceLoading}
            monthLabel={financeMonthLabel}
            onPreviousMonth={() => setFinanceDate(subMonths(financeDate, 1))}
            onNextMonth={() => setFinanceDate(addMonths(financeDate, 1))}
          />
        </div>

        {/* Right Column - Bookings */}
        <div className="flex flex-col gap-6">
          <BookingStatsWidget
            monthLabel={bookingMonthLabel}
            total={bookingStats?.total ?? 0}
            cancelled={bookingStats?.cancelled ?? 0}
            completed={bookingStats?.completed ?? 0}
            isLoading={isStatsLoading}
            onPreviousMonth={() => setBookingDate(subMonths(bookingDate, 1))}
            onNextMonth={() => setBookingDate(addMonths(bookingDate, 1))}
          />
        </div>
      </div>

      {/* Today Agenda - Full Width */}
      <div className="flex-1 min-h-0">
        <TodayAgendaWidget
          bookings={dailyBookings}
          isLoading={isDailyLoading}
        />
      </div>
    </div>
  );
}
