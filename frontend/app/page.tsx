"use client";

import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { format, subMonths, addMonths } from 'date-fns';
import { it } from 'date-fns/locale';

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStr = format(currentDate, 'yyyy-MM');

  const { data: financeSummary } = useSWR(`/api/transactions/summary?month=${monthStr}`, fetcher);
  const { data: bookingStats } = useSWR(`/api/bookings/stats?month=${monthStr}`, fetcher);
  const { data: dailyBookings } = useSWR(`/api/bookings?month=${monthStr}`, fetcher); // O api specidifica per logica odierna

  const totalIncome = financeSummary?.totalIncome || 0;
  const totalExpense = financeSummary?.totalExpense || 0;
  const balance = totalIncome - totalExpense;

  const financeData = [
    { name: 'Entrate', value: totalIncome || 1, color: '#00BFFF' }, 
    { name: 'Uscite', value: totalExpense || 1, color: '#ff5252' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl tracking-tight text-white font-outfit font-semibold">Dashboard Apericena</h1>
        <div className="text-text-secondary text-sm">{format(new Date(), 'dd MMMM yyyy', { locale: it })}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[0.7fr_1.3fr] gap-5 flex-1 min-h-0">
        
        {/* Bento 1: Finanze - Torta */}
        <div className="glass-panel lg:col-span-2 lg:row-span-1 p-6 flex flex-col">
          <h3 className="text-xl font-outfit mb-4">Panoramica Finanziaria</h3>
          <div className="flex-1 flex items-center h-48">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={financeData}
                   innerRadius={50}
                   outerRadius={70}
                   paddingAngle={5}
                   dataKey="value"
                   stroke="transparent"
                 >
                   {financeData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <RechartsTooltip 
                   contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(0, 191, 255, 0.25)', borderRadius: '15px' }}
                   itemStyle={{ color: '#fff' }}
                 />
               </PieChart>
             </ResponsiveContainer>
             <div className="flex flex-col gap-3 justify-center w-[50%]">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-accent"></div>
                 <span className="text-white font-bold">€ {totalIncome.toFixed(2)}</span>
                 <span className="text-xs text-text-secondary">Entrate</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-danger"></div>
                 <span className="text-white font-bold">€ {totalExpense.toFixed(2)}</span>
                 <span className="text-xs text-text-secondary">Uscite</span>
               </div>
             </div>
          </div>
        </div>

        {/* Bento 2: Prenotazioni Mensili */}
        <div className="glass-panel lg:col-span-1 lg:row-span-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-text-secondary hover:text-accent transition"><ArrowLeft size={18}/></button>
            <span className="text-sm font-bold tracking-widest text-accent uppercase">{format(currentDate, 'MMMM yyyy', { locale: it })}</span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-text-secondary hover:text-accent transition"><ArrowRight size={18}/></button>
          </div>
          <div>
            <div className="text-4xl font-outfit font-bold text-white mb-2">{bookingStats?.total || 0}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider mb-4">Totale Prenotazioni</div>
            <div className="flex justify-between text-sm">
              <span className="text-danger flex items-center gap-1">{bookingStats?.cancelled || 0} Cancellate</span>
              <span className="text-[#87ceeb] flex items-center gap-1">{bookingStats?.rescheduled || 0} Spostate</span>
            </div>
          </div>
        </div>

        {/* Bento 3: Agenda Odierna (Verticale) */}
        <div className="glass-panel lg:col-span-1 lg:row-span-2 p-6 overflow-hidden flex flex-col">
          <h3 className="text-xl font-outfit mb-4">Oggi in Studio</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
             {(!dailyBookings || dailyBookings.length === 0) && <div className="text-text-secondary text-sm">Nessun appuntamento</div>}
             {dailyBookings?.slice(0, 5).map((b: any) => (
               <div key={b.id} className="p-3 bg-[rgba(255,255,255,0.03)] border border-surface-border rounded-xl flex gap-3 items-center hover:bg-white/5 transition">
                 <div className="text-accent font-bold text-sm border-r border-surface-border pr-2 w-14 text-center">
                   {format(new Date(b.date), 'HH:mm')}
                 </div>
                 <div className="flex flex-col overflow-hidden">
                   <span className="font-bold text-white text-sm truncate">{b.customer?.firstName} {b.customer?.lastName}</span>
                   <span className="text-xs text-text-secondary truncate">{b.type} • {b.artist?.name}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Bento 4: KPI Veloci */}
        <div className="glass-panel lg:col-span-2 lg:row-span-1 p-6 flex flex-wrap items-center justify-around gap-4">
          <div className="text-center">
             <div className="text-3xl font-bold text-white font-outfit">€ {balance.toFixed(2)}</div>
             <div className="text-xs text-text-secondary uppercase tracking-widest mt-1">Utile Mese</div>
          </div>
          <div className="hidden md:block w-[1px] h-12 bg-surface-border"></div>
          <div className="text-center">
             <div className="text-3xl font-bold text-white font-outfit">{bookingStats?.completed || 0}</div>
             <div className="text-xs text-text-secondary uppercase tracking-widest mt-1">Tattoo Eseguiti</div>
          </div>
        </div>

        {/* Bento 5: Quick Actions */}
        <div className="glass-panel lg:col-span-1 lg:row-span-1 p-6 flex flex-col justify-center gap-3">
          <button className="glass-btn flex items-center justify-center gap-2">
            Nuovo Cliente
          </button>
          <button className="btn-primary flex items-center justify-center gap-2">
            Registra Entrata
          </button>
        </div>

      </div>
    </div>
  );
}
