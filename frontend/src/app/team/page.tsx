"use client";

import StatePanel from '@/components/feedback/StatePanel';
import PageHeader from '@/components/layout/PageHeader';
import ExportModal from '@/components/modals/ExportModal';
import ShiftModal from '@/components/modals/ShiftModal';
import StaffModal from '@/components/modals/StaffModal';
import { useAuth } from '@/context/AuthContext';
import { useTeamShifts, useTeamUsers } from '@/hooks/domain';
import { teamService } from '@/services/team.service';
import type { Shift } from '@/types/team';
import { canManageShifts, canManageStaff } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';
import { addDays, addWeeks, format, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const SHIFT_LABELS = ['Mattina', 'Pomeriggio', 'Tutta la giornata', 'Riposo'];

export default function TeamPage() {
  const { user } = useAuth();
  // Using Monday as start of week
  const [week, setWeek] = useState(() => format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Shift modal state
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftModalData, setShiftModalData] = useState<{ userId?: string, dayOfWeek?: number }>({});
  const [updatingShiftId, setUpdatingShiftId] = useState<string | null>(null);
  const [isAddingShift, setIsAddingShift] = useState<string | null>(null); // userId-dayIndex

  const canManageUsers = canManageStaff(user?.role);
  const canManageShiftData = canManageShifts(user?.role);

  // Fetch all users for the grid (assuming a max of 100 for now to avoid pagination in grid view)
  const { data: usersResult, isLoading: loadingUsers, mutate: mutateUsers, error: usersError } = useTeamUsers({
    page: 1, limit: 100,
  });
  const { data: shifts, isLoading: loadingShifts, mutate: mutateShifts, error: shiftsError } = useTeamShifts(week);

  const usersList = usersResult?.data || [];

  const handlePrevWeek = () => {
    setWeek(prev => format(subWeeks(parseISO(prev), 1), 'yyyy-MM-dd'));
  };

  const handleNextWeek = () => {
    setWeek(prev => format(addWeeks(parseISO(prev), 1), 'yyyy-MM-dd'));
  };

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

  const openAddShift = (userId?: string, dayOfWeek?: number) => {
    setShiftModalData({ userId, dayOfWeek });
    setIsShiftModalOpen(true);
  };

  const handleCycleShift = async (shift: Shift) => {
    if (!canManageShiftData || updatingShiftId) return;

    const currentLabel = shift.label || 'Mattina';
    const currentIndex = SHIFT_LABELS.indexOf(currentLabel);
    const nextIndex = (currentIndex + 1) % SHIFT_LABELS.length;
    const nextLabel = SHIFT_LABELS[nextIndex];

    setUpdatingShiftId(shift.id);
    try {
      await teamService.updateShift(shift.id, {
        label: nextLabel,
        isOff: nextLabel === 'Riposo',
      });
      await mutateShifts();
    } catch (err: unknown) {
      notifyError(err, 'Errore nell\'aggiornamento del turno');
    } finally {
      setUpdatingShiftId(null);
    }
  };

  const handleQuickAddShift = async (userId: string, dayOfWeek: number) => {
    if (!canManageShiftData || isAddingShift) return;

    const key = `${userId}-${dayOfWeek}`;
    setIsAddingShift(key);
    try {
      await teamService.createShift({
        userId,
        weekStart: week,
        dayOfWeek,
        label: 'Mattina',
        isOff: false,
      });
      await mutateShifts();
    } catch (err: unknown) {
      notifyError(err, 'Errore nella creazione del turno');
    } finally {
      setIsAddingShift(null);
    }
  };

  if (usersError || shiftsError) {
    return (
      <StatePanel
        variant="error"
        fullPage
        title="Impossibile caricare i dati"
        description="Riprova tra qualche secondo."
      />
    );
  }

  // Calculate dates for the current week header
  const weekDates = DAYS.map((_, i) => addDays(parseISO(week), i));

  return (
    <div className="flex-1 flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <PageHeader
        title="Team & Turni"
        actions={
          <>
            <ExportModal
              filenameBase="turni"
              title="Turni Settimanali"
              rows={shifts || []}
              columns={[
                { label: 'Collaboratore', value: (shift: Shift) => shift.user?.name || '' },
                { label: 'Settimana', value: (shift: Shift) => shift.weekStart },
                { label: 'Giorno', value: (shift: Shift) => shift.dayOfWeek.toString() },
                {
                  label: 'Orario',
                  value: (shift: Shift) => (shift.isOff ? 'Giorno libero' : `${shift.startTime} - ${shift.endTime}`),
                },
              ]}
            />
            {canManageShiftData && (
               <button onClick={() => openAddShift()} className="btn-secondary flex items-center gap-2 px-4">
                 <Plus size={20} />
                 <span>Turno</span>
               </button>
            )}
            {canManageUsers && (
              <button onClick={() => setIsStaffModalOpen(true)} className="btn-primary flex items-center gap-2 px-4">
                <Plus size={20} />
                <span>Staff</span>
              </button>
            )}
          </>
        }
      >
        {/* Date Navigation */}
        <div className="flex items-center gap-4 bg-surface/50 border border-surface-border rounded-xl px-2 py-1 shadow-lg backdrop-blur-md">
          <button onClick={handlePrevWeek} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
            <ChevronLeft size={20} />
          </button>
          <span className="text-white font-bold min-w-50 text-center tracking-wide">
            {format(parseISO(week), 'd MMM', { locale: it })} - {format(addDays(parseISO(week), 6), 'd MMM yyyy', { locale: it })}
          </span>
          <button onClick={handleNextWeek} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
            <ChevronRight size={20} />
          </button>
        </div>
      </PageHeader>

      {/* Grid Container */}
      <div className="glass-panel flex-1 rounded-2xl flex flex-col overflow-hidden w-full relative">
        <div className="overflow-x-auto flex-1 w-full min-h-125">
          <div className="min-w-250 h-full flex flex-col pb-4">
            {/* Header Row */}
            <div className="grid grid-cols-[250px_repeat(7,1fr)] border-b border-surface-border/50 bg-black/20 sticky top-0 z-10 backdrop-blur-md">
              <div className="py-5 px-6 text-sm font-bold text-text-secondary uppercase tracking-widest">Collaboratore</div>
              {weekDates.map((date, i) => (
                <div key={i} className="py-4 px-4 text-center border-l border-surface-border/20 flex flex-col justify-center">
                  <div className="text-white font-bold">{DAYS[i]}</div>
                  <div className="text-xs text-text-secondary mt-1 tracking-wider uppercase">{format(date, 'd MMM', { locale: it })}</div>
                </div>
              ))}
            </div>

            {/* loading state */}
            {(loadingUsers || loadingShifts) && (
               <div className="flex-1 min-h-75 flex items-center justify-center text-text-secondary font-bold">
                 <div className="animate-pulse">Caricamento griglia in corso...</div>
               </div>
            )}

            {/* User Rows */}
            {!loadingUsers && !loadingShifts && usersList.length === 0 && (
               <div className="flex-1 flex items-center justify-center text-text-secondary p-8">
                 Nessun membro del team trovato. Aggiungi il primo componente.
               </div>
            )}

            {!loadingUsers && !loadingShifts && usersList.map(u => {
              const userColor = u.color || '#3b82f6'; // fallback to a blue if no color

              return (
                <div key={u.id} className="grid grid-cols-[250px_repeat(7,1fr)] border-b border-surface-border/20 group/row hover:bg-white-[0.02] transition-colors relative min-h-25">
                  {/* User Cell - Sticky inside row maybe? Nah let's just make it visually clean */}
                  <div className="py-4 px-6 flex items-center gap-4 relative z-0">
                    <div
                      className="w-1 absolute left-0 top-0 bottom-0 shadow-[0_0_10px_currentColor] opacity-70"
                      style={{ backgroundColor: userColor, color: userColor }}
                    />
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-xl" style={{ backgroundColor: userColor }}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                      <span className="text-white font-bold text-base truncate">{u.name}</span>
                      <span className="text-xs text-text-secondary uppercase tracking-widest mt-0.5">{u.role}</span>
                    </div>
                    {canManageUsers && (
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-2 bg-danger/10 text-text-secondary hover:text-white hover:bg-danger absolute right-4 opacity-0 group-hover/row:opacity-100 transition-all rounded-lg"
                        title="Rimuovi dal team"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Days Cells */}
                  {DAYS.map((_, dayIndex) => {
                    const shift = shifts?.find(s => s.userId === u.id && s.dayOfWeek === dayIndex);

                    return (
                      <div
                        key={dayIndex}
                        className="p-3 border-l border-surface-border/20 relative group/cell flex flex-col justify-center min-h-25 hover:bg-white-[0.01]"
                      >
                        {shift ? (
                          <div
                            onClick={() => handleCycleShift(shift)}
                            className={`relative rounded-xl p-3 text-center border transition-all duration-300 hover:scale-[1.02] ${updatingShiftId === shift.id ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:shadow-lg'}`}
                            style={{
                              backgroundColor: shift.isOff ? 'rgba(239, 68, 68, 0.1)' : `${userColor}15`,
                              borderColor: shift.isOff ? 'rgba(239, 68, 68, 0.3)' : `${userColor}40`,
                              boxShadow: updatingShiftId === shift.id ? 'none' : `0 8px 24px ${userColor}10`
                            }}
                          >
                            <div className="flex flex-col items-center justify-center min-h-10">
                              {updatingShiftId === shift.id ? (
                                <Loader2 size={18} className="animate-spin text-white/50" />
                              ) : (
                                <span
                                  className="text-sm font-bold block"
                                  style={{ color: shift.isOff ? '#ef4444' : userColor }}
                                >
                                  {shift.label || (shift.isOff ? 'Riposo' : `${shift.startTime} - ${shift.endTime}`)}
                                </span>
                              )}
                            </div>

                            {canManageShiftData && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteShift(shift.id);
                                }}
                                className="absolute -top-2 -right-2 p-1.5 bg-surface rounded-full text-text-secondary hover:text-white hover:bg-danger opacity-0 group-hover/cell:opacity-100 transition-all shadow-md border border-surface-border z-10"
                                title="Elimina turno"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ) : (
                          // Empty Cell Quick Add / Modal
                          canManageShiftData ? (
                            <div className="absolute inset-2 md:inset-3 flex items-center justify-center">
                              {isAddingShift === `${u.id}-${dayIndex}` ? (
                                <Loader2 size={24} className="animate-spin text-white/20" />
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleQuickAddShift(u.id, dayIndex)}
                                    className="w-full h-full rounded-xl border-2 border-dashed border-white/5 text-white/0 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all flex flex-col items-center justify-center opacity-0 group-hover/cell:opacity-100"
                                    title="Aggiungi Mattina (Doppio click per opzioni)"
                                    onDoubleClick={() => openAddShift(u.id, dayIndex)}
                                  >
                                    <Plus size={20} />
                                    <span className="text-[10px] mt-1 font-bold">MATTINA</span>
                                  </button>
                                  {/* Small hint button for modal if needed, but let's keep it clean with dblclick */}
                                </>
                              )}
                            </div>
                          ) : null
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <StaffModal isOpen={isStaffModalOpen} onClose={() => { setIsStaffModalOpen(false); mutateUsers(); }} />
      {/* We pass the initial data to ShiftModal so it can pre-select user and day */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSuccess={() => mutateShifts()}
        weekStart={week}
        initialUserId={shiftModalData.userId}
        initialDayOfWeek={shiftModalData.dayOfWeek}
      />
    </div>
  );
}
