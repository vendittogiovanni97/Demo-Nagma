"use client";

import dynamic from 'next/dynamic';

import StatePanel from '@/components/feedback/StatePanel';
import PageHeader from '@/components/layout/PageHeader';
import WeekNavigator from '@/components/layout/WeekNavigator';
import Avatar from '@/components/data-display/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PermissionGate from '@/components/auth/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { useTeamShifts, useTeamMembers } from '@/hooks/domain';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { useToast } from '@/hooks/useToast';
import { teamService } from '@/services/team.service';
import type { Shift } from '@/types/team';
import { DAYS_OF_WEEK, SHIFT_LABELS } from '@/config/team-config';

import ExportModal from '@/components/modals/ExportModal';
import ShiftModal from '@/components/modals/ShiftModal';
import StaffModal from '@/components/modals/StaffModal';
import { addDays, addWeeks, format, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { it } from 'date-fns/locale';
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function TeamPage() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();
  const [week, setWeek] = useState(() => format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftModalData, setShiftModalData] = useState<{ staffId?: number, dayOfWeek?: number }>({});
  const [updatingShiftId, setUpdatingShiftId] = useState<string | null>(null);
  const [isAddingShift, setIsAddingShift] = useState<string | null>(null);

  const canManageMembers = isAdmin;
  const canManageShiftData = isAdmin;

  const { data: membersResult, isLoading: loadingMembers, mutate: mutateMembers, error: membersError } = useTeamMembers({
    page: 1, limit: 100,
  });
  const { data: shifts, isLoading: loadingShifts, mutate: mutateShifts, error: shiftsError } = useTeamShifts(week);

  const membersList = (membersResult?.data || []).sort((a, b) => {
    if (a.type === 'COLLABORATORE' && b.type !== 'COLLABORATORE') return -1;
    if (a.type !== 'COLLABORATORE' && b.type === 'COLLABORATORE') return 1;
    return 0;
  });

  const handlePrevWeek = () => {
    setWeek(prev => format(subWeeks(parseISO(prev), 1), 'yyyy-MM-dd'));
  };

  const handleNextWeek = () => {
    setWeek(prev => format(addWeeks(parseISO(prev), 1), 'yyyy-MM-dd'));
  };

  const handleDeleteMember = async (id: number, name: string) => {
    await deleteItem({
      confirmMessage: `Rimuovere "${name}" dal team?`,
      action: () => teamService.deleteMember(id),
      successMessage: `${name} rimosso dal team`,
      errorMessage: 'Errore durante l\'eliminazione',
      onSuccess: mutateMembers,
    });
  };

  const handleDeleteShift = async (id: string) => {
    await deleteItem({
      confirmMessage: 'Eliminare questo turno?',
      action: () => teamService.deleteShift(id),
      successMessage: 'Turno eliminato',
      errorMessage: 'Errore durante l\'eliminazione',
      onSuccess: mutateShifts,
    });
  };

  const openAddShift = (staffId?: number, dayOfWeek?: number) => {
    setShiftModalData({ staffId, dayOfWeek });
    setIsShiftModalOpen(true);
  };

  const handleCycleShift = async (shift: Shift) => {
    if (!canManageShiftData || updatingShiftId) return;

    const currentLabel = (shift.label || 'Mattina') as typeof SHIFT_LABELS[number];
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
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'aggiornamento del turno';
      toast.error(errorMessage);
    } finally {
      setUpdatingShiftId(null);
    }
  };

  const handleQuickAddShift = async (staffId: number, dayOfWeek: number) => {
    if (!canManageShiftData || isAddingShift) return;

    const key = `${staffId}-${dayOfWeek}`;
    setIsAddingShift(key);
    try {
      await teamService.createShift({
        staffId,
        weekStart: week,
        dayOfWeek,
        label: 'Mattina',
        isOff: false,
      });
      await mutateShifts();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nella creazione del turno';
      toast.error(errorMessage);
    } finally {
      setIsAddingShift(null);
    }
  };

  if (membersError || shiftsError) {
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
  const weekDates = DAYS_OF_WEEK.map((_, i) => addDays(parseISO(week), i));

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
                { label: 'Collaboratore', value: (shift: Shift) => shift.staff?.name || '' },
                { label: 'Settimana', value: (shift: Shift) => shift.weekStart },
                { label: 'Giorno', value: (shift: Shift) => shift.dayOfWeek.toString() },
                {
                  label: 'Orario',
                  value: (shift: Shift) => (shift.isOff ? 'Giorno libero' : `${shift.startTime} - ${shift.endTime}`),
                },
              ]}
            />
            <PermissionGate requireAdmin>
               <Button variant="secondary" icon={Plus} onClick={() => openAddShift()} size="md">
                 Turno
               </Button>
            </PermissionGate>
            <PermissionGate requireAdmin>
              <Button variant="primary" icon={Plus} onClick={() => setIsStaffModalOpen(true)} size="md">
                Staff
              </Button>
            </PermissionGate>
          </>
        }
      >
        <WeekNavigator
          weekStart={week}
          onPrev={handlePrevWeek}
          onNext={handleNextWeek}
          format="short"
          variant="header"
        />
      </PageHeader>

      <div className="glass-panel flex-1 rounded-2xl flex flex-col overflow-hidden w-full relative">
        <div className="overflow-x-auto flex-1 w-full min-h-125">
          <div className="min-w-250 h-full flex flex-col pb-4">
            <div className="grid grid-cols-[250px_repeat(7,1fr)] border-b border-surface-border/50 bg-black/20 sticky top-0 z-10 backdrop-blur-md">
              <div className="py-5 px-6 text-sm font-bold text-text-secondary uppercase tracking-widest">Collaboratore</div>
              {weekDates.map((date, i) => (
                <div key={i} className="py-4 px-4 text-center border-l border-surface-border/20 flex flex-col justify-center">
                  <div className="text-white font-bold">{DAYS_OF_WEEK[i]}</div>
                  <div className="text-xs text-text-secondary mt-1 tracking-wider uppercase">{format(date, 'd MMM', { locale: it })}</div>
                </div>
              ))}
            </div>

            {(loadingMembers || loadingShifts) && (
              <StatePanel
                variant="loading"
                fullPage
                title="Caricamento griglia in corso..."
              />
            )}

            {!loadingMembers && !loadingShifts && membersList.length === 0 && (
               <div className="flex-1 flex items-center justify-center text-text-secondary p-8">
                 Nessun membro del team trovato. Aggiungi il primo componente.
               </div>
            )}

            {!loadingMembers && !loadingShifts && membersList.map(m => {
              const memberColor = m.color || '#3b82f6';

              return (
                <div key={m.id} className="grid grid-cols-[250px_repeat(7,1fr)] border-b border-surface-border/30 group/row hover:bg-white-[0.03] transition-colors relative min-h-44 py-2">
                  <div className="py-5 px-6 flex items-center gap-4 relative group/member">
                    <div
                      className="w-1 absolute left-0 top-0 bottom-0 shadow-[0_0_10px_currentColor] opacity-70"
                      style={{ backgroundColor: memberColor, color: memberColor }}
                    />
                    <Avatar name={m.name} color={memberColor} size="lg" />
                    <div className="flex flex-col min-w-0">
                       <span className="text-white font-bold text-base truncate">{m.name}</span>
                       <Badge
                         variant={m.type === 'COLLABORATORE' ? 'primary' : 'secondary'}
                         size="xs"
                         className="w-fit mt-1"
                       >
                         {m.type}
                       </Badge>
                    </div>
                    <PermissionGate requireAdmin>
                      <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 group-hover/member:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setIsStaffModalOpen(true)}
                          icon={<Edit size={16} />}
                          title="Modifica staff"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteMember(m.id, m.name)}
                          icon={<Trash2 size={16} />}
                          title="Rimuovi dal team"
                        />
                      </div>
                    </PermissionGate>
                  </div>

                  {DAYS_OF_WEEK.map((_, dayIndex) => {
                    const shift = shifts?.find(s => s.staffId === m.id && s.dayOfWeek === dayIndex && s.weekStart === week);

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
                              backgroundColor: shift.isOff ? 'rgba(239, 68, 68, 0.1)' : `${memberColor}15`,
                              borderColor: shift.isOff ? 'rgba(239, 68, 68, 0.3)' : `${memberColor}40`,
                              boxShadow: updatingShiftId === shift.id ? 'none' : `0 8px 24px ${memberColor}10`
                            }}
                          >
                            <div className="flex flex-col items-center justify-center min-h-10">
                              {updatingShiftId === shift.id ? (
                                <Loader2 size={18} className="animate-spin text-white/50" />
                              ) : (
                                <span
                                  className="text-sm font-bold block"
                                  style={{ color: shift.isOff ? '#ef4444' : memberColor }}
                                >
                                  {shift.label || (shift.isOff ? 'Riposo' : `${shift.startTime} - ${shift.endTime}`)}
                                </span>
                              )}
                            </div>

                          </div>
                        ) : (
                          <div className="absolute inset-2 md:inset-3 flex items-center justify-center">
                            {isAddingShift === `${m.id}-${dayIndex}` ? (
                              <Loader2 size={24} className="animate-spin text-white/20" />
                            ) : canManageShiftData ? (
                              <>
                                <div className="flex flex-col items-center gap-1 group-hover/cell:opacity-0 transition-opacity duration-150 pointer-events-none select-none">
                                  <span className="text-[11px] font-semibold text-white/20 uppercase tracking-widest">Riposo</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  onClick={() => handleQuickAddShift(m.id, dayIndex)}
                                  className="absolute inset-0 z-10 w-full h-full rounded-xl border-2 border-dashed border-white/10 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-150"
                                  title="Aggiungi Mattina (Doppio click per opzioni)"
                                  onDoubleClick={() => openAddShift(m.id, dayIndex)}
                                  icon={<Plus size={20} />}
                                >
                                  <span className="text-[10px] font-bold">MATTINA</span>
                                </Button>
                              </>
                            ) : (
                              <span className="text-[11px] font-semibold text-white/20 uppercase tracking-widest select-none">Riposo</span>
                            )}
                          </div>
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

      <StaffModal isOpen={isStaffModalOpen} onClose={() => { setIsStaffModalOpen(false); mutateMembers(); }} />
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSuccess={() => mutateShifts()}
        weekStart={week}
        initialStaffId={shiftModalData.staffId}
        initialDayOfWeek={shiftModalData.dayOfWeek}
      />
      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
