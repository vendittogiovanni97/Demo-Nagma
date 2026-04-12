"use client";

import { useState } from 'react';
import { teamService } from '@/services/team.service';
import DataTable, { Column } from '@/components/data-display/DataTable';
import StaffModal from '@/components/modals/StaffModal';
import ShiftModal from '@/components/modals/ShiftModal';
import PageHeader from '@/components/layout/PageHeader';
import ExportButtons from '@/components/feedback/ExportButtons';
import StatePanel from '@/components/feedback/StatePanel';
import { useAuth } from '@/context/AuthContext';
import { UsersRound, CalendarDays, Plus, Trash2, Search } from 'lucide-react';
import { startOfWeek, format } from 'date-fns';
import { useTeamShifts, useTeamUsers } from '@/hooks/domain';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { User, Shift } from '@/types/team';
import { canManageShifts, canManageStaff } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';

export default function TeamPage() {
  const { user } = useAuth();
  const [week, setWeek] = useState(() => format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER' | 'ARTIST'>('ALL');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 250);
  const canManageUsers = canManageStaff(user?.role);
  const canManageShiftData = canManageShifts(user?.role);

  const { data: usersResult, isLoading: loadingUsers, mutate: mutateUsers, error: usersError } = useTeamUsers({
    search: debouncedSearch,
    role: roleFilter === 'ALL' ? undefined : roleFilter,
    page,
  });
  const { data: shifts, isLoading: loadingShifts, mutate: mutateShifts, error: shiftsError } = useTeamShifts(week);
  const filteredUsers = usersResult?.data || [];

  const columns: Column<User>[] = [
    { key: 'name', header: 'Nome', render: (val) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
          {String(val ?? '?')[0]}
        </div>
        <span className="font-bold text-white">{String(val ?? '')}</span>
      </div>
    )},
    { key: 'role', header: 'Ruolo', render: (val) => (
      <span className="text-accent uppercase text-[10px] tracking-widest font-bold bg-accent/5 px-2 py-1 rounded-full border border-accent/20">
        {String(val ?? '')}
      </span>
    )},
    { key: 'phone', header: 'Telefono', render: (val) => <span className="text-text-secondary text-sm">{String(val || '—')}</span> },
    { key: 'id', header: '', render: (_val, user: User) => (
      canManageUsers ? (
        <button
          onClick={() => handleDeleteUser(user.id, user.name)}
          className="p-2 text-danger opacity-0 group-hover:opacity-100 hover:bg-danger/10 rounded-lg transition-all"
          title="Rimuovi dal team"
        >
          <Trash2 size={16} />
        </button>
      ) : null
    )},
  ];

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Rimuovere "${name}" dal team?`)) return;
    try {
      await teamService.deleteUser(id);
      notifySuccess(`${name} rimosso dal team`);
      mutateUsers();
    } catch (err: unknown) {
      notifyError(err, 'Errore durante l\'eliminazione');
    }
  };

  const handleDeleteShift = async (id: string) => {
    if (!confirm('Eliminare questo turno?')) return;
    try {
      await teamService.deleteShift(id);
      notifySuccess('Turno eliminato');
      mutateShifts();
    } catch (err: unknown) {
      notifyError(err, 'Errore durante l\'eliminazione');
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      <PageHeader
        title="Team & Turni"
        subtitle="Organizza i collaboratori e le disponibilità dello studio"
        actions={
          <>
            <ExportButtons
              filenameBase="team"
              title="Team"
              rows={filteredUsers}
              columns={[
                { label: 'Nome', value: (entry: User) => entry.name },
                { label: 'Email', value: (entry: User) => entry.email },
                { label: 'Ruolo', value: (entry: User) => entry.role },
                { label: 'Telefono', value: (entry: User) => entry.phone || '' },
              ]}
              filtersLabel={`Ricerca: ${search || 'nessuna'} - Ruolo: ${roleFilter}`}
              resolveRows={async () => {
                const response = await teamService.getUsers({
                  search: debouncedSearch,
                  role: roleFilter === 'ALL' ? undefined : roleFilter,
                  page: 1,
                  limit: 1000,
                });
                return response.data;
              }}
            />
            <ExportButtons
              filenameBase="turni"
              title="Turni"
              rows={shifts || []}
              columns={[
                { label: 'Collaboratore', value: (shift: Shift) => shift.user?.name || '' },
                { label: 'Settimana', value: (shift: Shift) => shift.weekStart },
                { label: 'Giorno', value: (shift: Shift) => shift.dayOfWeek },
                {
                  label: 'Orario',
                  value: (shift: Shift) => (shift.isOff ? 'Giorno libero' : `${shift.startTime} - ${shift.endTime}`),
                },
              ]}
              filtersLabel={`Settimana: ${week}`}
            />
            {canManageUsers ? (
              <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-6">
                <Plus size={20} />
                <span>Aggiungi Staff</span>
              </button>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="glass-panel p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <UsersRound className="text-accent" size={20} />
            <h2 className="text-xl font-outfit">Collaboratori</h2>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cerca per nome, email o telefono..."
                className="w-full rounded-xl border border-surface-border bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-accent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as 'ALL' | 'ADMIN' | 'USER' | 'ARTIST');
                setPage(1);
              }}
              className="rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent"
            >
              <option value="ALL">Tutti i ruoli</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">Segreteria</option>
              <option value="ARTIST">Artist</option>
            </select>
          </div>
          <div className="flex-1 overflow-hidden">
            {usersError ? (
              <StatePanel
                variant="error"
                title="Impossibile caricare il team"
                description="Riprova tra qualche secondo."
              />
            ) : (
              <DataTable
                data={filteredUsers}
                columns={columns}
                isLoading={loadingUsers}
                emptyMessage="Nessun collaboratore trovato."
                pagination={{
                  page: usersResult?.page ?? 1,
                  totalPages: usersResult?.totalPages ?? 1,
                  total: usersResult?.total ?? 0,
                  onPrev: () => setPage((prev) => Math.max(1, prev - 1)),
                  onNext: () => setPage((prev) => Math.min(usersResult?.totalPages ?? 1, prev + 1)),
                }}
              />
            )}
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
              <StatePanel
                variant="loading"
                title="Carico i turni"
                description="Sto recuperando la matrice della settimana."
              />
            ) : shiftsError ? (
              <StatePanel
                variant="error"
                title="Impossibile caricare i turni"
                description="Riprova tra poco."
              />
            ) : !shifts?.length ? (
              <StatePanel
                variant="empty"
                title="Nessun turno per questa settimana"
                description="Pianifica il primo turno per iniziare."
              />
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
                   {canManageShiftData ? (
                     <button onClick={() => handleDeleteShift(s.id)} className="p-2 text-danger opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/10 rounded-lg">
                        <Trash2 size={16} />
                     </button>
                   ) : null}
                 </div>
               ))
            )}
          </div>

          {canManageShiftData ? (
            <button onClick={() => setIsShiftModalOpen(true)} className="glass-btn w-full mt-2 py-4 flex items-center justify-center gap-2">
              <Plus size={18} />
              <span>Pianifica Turno</span>
            </button>
          ) : null}
        </div>
      </div>

      <StaffModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); mutateUsers(); }} />
      <ShiftModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} onSuccess={() => mutateShifts()} weekStart={week} />
    </div>
  );
}
