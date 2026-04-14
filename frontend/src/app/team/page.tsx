"use client";

import DataTable, { Column } from '@/components/data-display/DataTable';
import type { ExportFilter } from '@/components/modals/ExportModal';
import ExportModal from '@/components/modals/ExportModal';
import ShiftModal from '@/components/modals/ShiftModal';
import StaffModal from '@/components/modals/StaffModal';
import { DEBOUNCE_SEARCH_DELAY, EXPORT_FETCH_LIMIT } from '@/config/defaults';
import { useAuth } from '@/context/AuthContext';
import { useTeamShifts, useTeamUsers } from '@/hooks/domain';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { teamService } from '@/services/team.service';
import type { Shift, User } from '@/types/team';
import { canManageShifts, canManageStaff } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';
import { format, startOfWeek } from 'date-fns';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function TeamPage() {
  const { user } = useAuth();
  const [week, setWeek] = useState(() => format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER' | 'ARTIST'>('ALL');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_DELAY);
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
      {/* Header: Title left, Search + Filter center, Actions right */}
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-outfit font-bold text-white">Team & Turni</h1>
        </div>

        {/* Search + Filter - Center */}
        <div className="flex-1 max-w-2xl mx-auto flex gap-3">
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
            className="rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent whitespace-nowrap"
          >
            <option value="ALL">Tutti i ruoli</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">Segreteria</option>
            <option value="ARTIST">Artist</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ExportModal
            filenameBase="team"
            title="Team"
            rows={filteredUsers}
            columns={[
              { label: 'Nome', value: (entry: User) => entry.name },
              { label: 'Email', value: (entry: User) => entry.email },
              { label: 'Ruolo', value: (entry: User) => entry.role },
              { label: 'Telefono', value: (entry: User) => entry.phone || '' },
            ]}
            filters={[
              {
                key: 'role',
                label: 'Ruolo',
                type: 'select',
                value: roleFilter,
                options: [
                  { label: 'Tutti i ruoli', value: 'ALL' },
                  { label: 'Admin', value: 'ADMIN' },
                  { label: 'Segreteria', value: 'USER' },
                  { label: 'Artist', value: 'ARTIST' },
                ],
                onChange: (v) => { setRoleFilter(v as 'ALL' | 'ADMIN' | 'USER' | 'ARTIST'); setPage(1); },
              },
            ] satisfies ExportFilter[]}
            filtersLabel={`Ruolo: ${roleFilter}`}
            resolveRows={async () => {
              const response = await teamService.getUsers({
                search: debouncedSearch,
                role: roleFilter === 'ALL' ? undefined : roleFilter,
                page: 1,
                limit: EXPORT_FETCH_LIMIT,
              });
              return response.data;
            }}
          />
          <ExportModal
            filenameBase="turni"
            title="Turni Settimanali"
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
            filters={[
              {
                key: 'week',
                label: 'Settimana',
                type: 'week',
                value: week,
                onChange: (v) => setWeek(v),
              },
            ] satisfies ExportFilter[]}
            filtersLabel={`Settimana: ${week}`}
          />
          {canManageUsers ? (
            <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-6">
              <Plus size={20} />
              <span>Aggiungi Staff</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel flex-1 p-6 rounded-2xl">
        {usersError ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Impossibile caricare il team</h3>
              <p className="text-sm text-text-secondary">Riprova tra qualche secondo.</p>
            </div>
          </div>
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

      <StaffModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); mutateUsers(); }} />
      <ShiftModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} onSuccess={() => mutateShifts()} weekStart={week} />
    </div>
  );
}
