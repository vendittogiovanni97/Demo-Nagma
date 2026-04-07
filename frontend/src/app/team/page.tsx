"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { teamService, Shift } from '@/services/team.service';
import { ENDPOINTS } from '@/api/endpoints';
import DataTable, { Column } from '@/components/DataTable';
import StaffModal from '@/components/StaffModal';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { UsersRound, CalendarDays, Plus, Clock, Trash2 } from 'lucide-react';
import { startOfWeek, format } from 'date-fns';
import type { User, Shift } from '@/types';

export default function TeamPage() {
  const { isAuthenticated } = useAuth();
  const [week, setWeek] = useState(() => format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: users, isLoading: loadingUsers, mutate: mutateUsers } = useSWR<User[]>(
    ENDPOINTS.TEAM.USERS,
    () => teamService.getUsers()
  );

  const { data: shifts, isLoading: loadingShifts } = useSWR<Shift[]>(
    [ENDPOINTS.TEAM.SHIFTS, week],
    () => teamService.getShifts(week)
  );

  const columns = [
    { key: 'name', header: 'Nome Artista/Staff', render: (val: string) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
          {val[0]}
        </div>
        <span className="font-bold text-white">{val}</span>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Ruolo',
    render: (val: string) => (
      <span className="text-accent uppercase text-[10px] tracking-widest font-bold bg-accent/5 px-2 py-1 rounded-full border border-accent/20">
        {val}
      </span>
    ),
  },
  {
    key: 'phone',
    header: 'Telefono',
    render: (val: string) => <span className="text-text-secondary text-sm">{val || '—'}</span>,
  },
];

export default function TeamPage() {
  const [week, setWeek] = useState(() => format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: users, isLoading: loadingUsers, mutate: mutateUsers } = useSWR<User[]>(
    ENDPOINTS.TEAM.USERS,
    () => teamService.getUsers()
  );

  const { data: shifts, isLoading: loadingShifts } = useSWR<Shift[]>(
    [ENDPOINTS.TEAM.SHIFTS, week],
    () => teamService.getShifts(week)
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <PageHeader
        title="Team & Turni"
        subtitle="Organizza i collaboratori e le disponibilità dello studio"
        actions={
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-6">
            <Plus size={20} />
            <span>Aggiungi Staff</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="glass-panel p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <UsersRound className="text-accent" size={20} />
            <h2 className="text-xl font-outfit">Collaboratori</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <DataTable
              data={users || []}
              columns={columns}
              isLoading={loadingUsers}
              emptyMessage="Nessun collaboratore trovato."
            />
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <CalendarDays className="text-accent" size={20} />
               <h2 className="text-xl font-outfit">Matrice Turni</h2>
             </div>
             <input
                type="date"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="p-2 px-4 rounded-xl bg-white/5 border border-surface-border text-white outline-none focus:border-accent transition"
              />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {loadingShifts ? (
              <div className="text-text-secondary text-center mt-10 italic">Caricamento turni...</div>
            ) : !shifts?.length ? (
              <div className="flex flex-col items-center justify-center h-40 text-text-secondary gap-3 bg-white/2 rounded-3xl border border-dashed border-surface-border">
                <Clock size={32} className="opacity-20" />
                <span className="text-sm">Nessun turno per questa settimana.</span>
              </div>
            ) : (
               shifts.map((s) => (
                 <div key={s.id} className="p-4 bg-white/5 border border-surface-border rounded-2xl flex justify-between items-center hover:border-accent/40 transition group">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center font-bold text-accent">
                        {['L', 'M', 'M', 'G', 'V', 'S', 'D'][s.dayOfWeek] || '?'}
                     </div>
                     <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{s.user?.name}</span>
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest">{s.isOff ? 'Giorno Libero' : `${s.startTime} - ${s.endTime}`}</span>
                     </div>
                   </div>
                   <button className="p-2 text-danger opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/10 rounded-lg">
                      <Trash2 size={16} />
                   </button>
                 </div>
               ))
            )}
          </div>

          <button className="glass-btn w-full mt-2 py-4 flex items-center justify-center gap-2">
            <Plus size={18} />
            <span>Pianifica Turno</span>
          </button>
        </div>
      </div>

      <StaffModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); mutateUsers(); }} />
    </div>
  );
}
