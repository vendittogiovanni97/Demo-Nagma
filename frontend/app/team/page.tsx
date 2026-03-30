"use client";

import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { useState } from 'react';
import DataTable from '@/components/DataTable';
import StaffModal from '@/components/StaffModal';

export default function TeamPage() {
  const [week, setWeek] = useState(new Date().toISOString().split('T')[0]); // Semplice fallback
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: users, isLoading: loadingUsers, mutate: mutateUsers } = useSWR('/api/team/users', fetcher);
  const { data: shifts, isLoading: loadingShifts } = useSWR(`/api/team/shifts?weekStart=${week}`, fetcher);

  const columns = [
    { key: 'name', header: 'Nome Artista/Staff', render: (val: any) => <span className="font-bold">{val}</span> },
    { key: 'role', header: 'Ruolo', render: (val: any) => <span className="text-accent uppercase text-xs tracking-wider">{val}</span> },
    { key: 'phone', header: 'Telefono' },
    { key: 'commissionPattern', header: 'Perc. Commissione' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      <h1 className="text-3xl tracking-tight text-white font-outfit font-semibold">Team & Turni</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-outfit">Collaboratori</h2>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary text-sm py-2">Aggiungi Staff</button>
          </div>
          <DataTable data={users} columns={columns} isLoading={loadingUsers} emptyMessage="Nessun collaboratore." />
        </div>

        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-outfit">Matrice Turni Settimanali</h2>
             <input type="date" value={week} onChange={(e) => setWeek(e.target.value)} className="p-2 rounded-[10px] bg-white/5 border border-surface-border text-white outline-none" />
          </div>
          
          <div className="flex-1 border border-surface-border rounded-xl p-4 overflow-y-auto bg-white/5">
            {loadingShifts ? (
               <div className="text-text-secondary text-center mt-10">Caricamento turni...</div>
            ) : (!shifts || shifts.length === 0) ? (
               <div className="text-text-secondary text-center mt-10">Nessun turno inserito nella settimana selezionata.</div>
            ) : (
               <div className="flex flex-col gap-3">
                 {shifts.map((s: any) => (
                   <div key={s.id} className="p-3 bg-surface border border-surface-border rounded-xl flex justify-between items-center">
                     <span className="font-bold text-accent">{s.user?.name}</span>
                     <span className="text-sm text-white">Giorno {s.dayOfWeek} (Settimana)</span>
                     <span className="text-xs text-text-secondary w-20 text-center">{s.isOff ? 'OFF' : `${s.startTime} - ${s.endTime}`}</span>
                     <button className="text-[10px] text-danger border border-danger/30 px-2 py-1 rounded hover:bg-danger/10 transition">Rimuovi</button>
                   </div>
                 ))}
               </div>
            )}
          </div>
          
          <button className="glass-btn mt-2">Pianifica Turno in questa Settimana</button>
        </div>
      </div>

      <StaffModal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        mutateUsers();
      }} />
    </div>
  );
}
