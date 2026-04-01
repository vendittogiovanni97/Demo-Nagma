"use client";

import useSWR from 'swr';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar 
} from 'recharts';
import { ArrowLeft, ArrowRight, Users, Package, BarChart3, Activity } from 'lucide-react';
import { useState } from 'react';
import { format, subMonths, addMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/Skeleton';
import { bookingService } from '@/services/booking.service';
import { transactionService } from '@/services/transaction.service';
import { ENDPOINTS } from '@/api/endpoints';
import { FinanceSummary, BookingStats, Booking } from '@/types/dashboard';

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStr = format(currentDate, 'yyyy-MM');
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data: financeSummary, isLoading: isFinanceLoading } = useSWR<FinanceSummary>(
    [ENDPOINTS.TRANSACTIONS.SUMMARY, monthStr], 
    () => transactionService.getSummary(monthStr)
  );
  
  const { data: bookingStats, isLoading: isStatsLoading } = useSWR<BookingStats>(
    [ENDPOINTS.BOOKINGS.STATS, monthStr], 
    () => bookingService.getStats(monthStr)
  );
  
  const { data: dailyBookings, isLoading: isDailyLoading } = useSWR<Booking[]>(
    [ENDPOINTS.BOOKINGS.BASE, monthStr], 
    () => bookingService.getAll(monthStr)
  ); 

  const { data: trends } = useSWR(
    ENDPOINTS.TRANSACTIONS.TRENDS, 
    () => transactionService.getTrends()
  );

  const { data: performance } = useSWR(
    ENDPOINTS.TRANSACTIONS.PERFORMANCE, 
    () => transactionService.getArtistPerformance()
  );

  const totalIncome = financeSummary?.totalIncome || 0;
  const totalExpense = financeSummary?.totalExpense || 0;
  const balance = totalIncome - totalExpense;

  const financeData = [
    { name: 'Entrate', value: totalIncome || 0.01, color: '#00BFFF' }, 
    { name: 'Uscite', value: totalExpense || 0.01, color: '#ff5252' },
  ];

  if (isAuthLoading) return <div className="p-10"><Skeleton className="h-20 w-full" /></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl tracking-tight text-white font-outfit font-semibold">Nagma Dashboard</h1>
        <div className="text-text-secondary text-sm font-medium bg-surface px-4 py-2 rounded-full border border-surface-border uppercase tracking-widest">
          {format(new Date(), 'dd MMMM yyyy', { locale: it })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-auto">
        
        {/* Bento: Finanze */}
        <div className="glass-panel lg:col-span-2 p-6 flex flex-col group">
          <h3 className="text-xl font-outfit mb-4">Panoramica Finanziaria</h3>
          {isFinanceLoading ? <Skeleton className="h-48" /> : (
            <div className="flex-1 flex items-center h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={financeData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="transparent">
                    {financeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(0,191,255,0.2)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-4 w-1/2">
                <div>
                  <div className="text-[10px] text-text-secondary uppercase tracking-widest">Entrate</div>
                  <div className="text-xl text-white font-bold font-outfit">€ {totalIncome.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-secondary uppercase tracking-widest">Uscite</div>
                  <div className="text-xl text-danger font-bold font-outfit">€ {totalExpense.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bento: Trend Ricavi */}
        <div className="glass-panel lg:col-span-2 p-6 flex flex-col h-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-accent" size={18} />
            <h3 className="text-lg font-outfit">Trend Mensile</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00BFFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00BFFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#444" fontSize={10} />
                <YAxis stroke="#444" fontSize={10} />
                <RechartsTooltip contentStyle={{ background: '#0a0a0a', border: 'none', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="income" stroke="#00BFFF" fill="url(#colorInc)" />
                <Area type="monotone" dataKey="expense" stroke="#ff5252" fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bento: Prenotazioni */}
        <div className="glass-panel lg:col-span-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-lg"><ArrowLeft size={14}/></button>
            <span className="text-[10px] font-bold text-accent uppercase">{format(currentDate, 'MMM yyyy', { locale: it })}</span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-lg"><ArrowRight size={14}/></button>
          </div>
          {isStatsLoading ? <Skeleton className="h-20" /> : (
            <div>
              <div className="text-4xl font-outfit font-bold text-white">{bookingStats?.total || 0}</div>
              <div className="text-xs text-text-secondary uppercase mt-1">Prenotazioni Totali</div>
              <div className="flex justify-between mt-4 pt-4 border-t border-white/5">
                <span className="text-danger text-xs font-bold">{bookingStats?.cancelled || 0} Canc.</span>
                <span className="text-success text-xs font-bold">{bookingStats?.completed || 0} Fatti</span>
              </div>
            </div>
          )}
        </div>

        {/* Bento: Artist Performance */}
        <div className="glass-panel lg:col-span-1 p-6 flex flex-col h-[200px]">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-accent" size={18} />
            <h3 className="text-lg font-outfit">Top Artisti</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance}>
                <XAxis dataKey="artistId" hide />
                <Bar dataKey="_sum.price" fill="#00BFFF" radius={[5, 5, 0, 0]} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ background: '#0a0a0a', border: 'none' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bento: Agenda Oggi */}
        <div className="glass-panel lg:col-span-1 lg:row-span-2 p-6 flex flex-col">
          <h3 className="text-xl font-outfit mb-4">Oggi</h3>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {isDailyLoading ? <Skeleton className="h-full" /> : dailyBookings?.map((b: Booking) => (
              <div key={b.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex gap-3 items-center">
                <div className="text-accent font-bold text-xs">{format(new Date(b.date), 'HH:mm')}</div>
                <div className="flex flex-col whitespace-nowrap overflow-hidden">
                  <span className="font-bold text-white text-sm truncate">{b.customer?.firstName}</span>
                  <span className="text-[10px] text-text-secondary uppercase">{b.artist?.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bento: Quick Actions */}
        <div className="glass-panel lg:col-span-1 p-6 flex flex-col justify-center gap-3">
          <button className="glass-btn flex items-center justify-center gap-3 py-4">
            <Users size={16} /> <span>Clienti</span>
          </button>
          <button className="btn-primary flex items-center justify-center gap-3 py-4">
            <Package size={16} /> <span>Creme</span>
          </button>
        </div>

      </div>
    </div>
  );
}
