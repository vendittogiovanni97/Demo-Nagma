"use client";


import PermissionGate from '@/components/auth/PermissionGate';
import Avatar from '@/components/data-display/Avatar';
import StatePanel from '@/components/feedback/StatePanel';
import PageHeader from '@/components/layout/PageHeader';
import WeekNavigator from '@/components/layout/WeekNavigator';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { DAYS_OF_WEEK, SHIFT_LABELS } from '@/config/team-config';
import { useAuth } from '@/context/AuthContext';
import { useTeamMembers, useTeamShifts } from '@/hooks/domain/useTeam';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { useToast } from '@/hooks/useToast';
import { teamService } from '@/services/team.service';
import type { Shift } from '@/types/team';

import ExportModal from '@/components/modals/ExportModal';
import ShiftModal from '@/components/modals/ShiftModal';
import StaffModal from '@/components/modals/StaffModal';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { addDays, addWeeks, format, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { it } from 'date-fns/locale';
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function TeamPage() {
  const toast = useToast();
  const theme = useTheme();
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
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
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
               <Button variant="secondary" icon={<Plus size={14} />} onClick={() => openAddShift()} size="sm">
                 Turno
               </Button>
            </PermissionGate>
            <PermissionGate requireAdmin>
              <Button variant="primary" icon={<Plus size={14} />} onClick={() => setIsStaffModalOpen(true)} size="sm">
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

      <Paper sx={{ flex: 1, borderRadius: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%', position: 'relative', bgcolor: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ overflowX: 'auto', flex: 1, width: '100%', minHeight: '500px' }}>
          <Box sx={{ minWidth: '800px', height: '100%', display: 'flex', flexDirection: 'column', pb: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '220px repeat(7, 1fr)', borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'rgba(0,0,0,0.2)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(12px)' }}>
              <Box sx={{ py: 2, px: 2, fontSize: '0.75rem', fontWeight: 700, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Collaboratore</Box>
              {weekDates.map((date, i) => (
                <Box key={i} sx={{ py: 2, px: 1.5, textAlign: 'center', borderLeft: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography sx={{ color: theme.palette.text.primary, fontWeight: 700, fontSize: '0.75rem' }}>{DAYS_OF_WEEK[i]}</Typography>
                  <Typography sx={{ fontSize: '0.625rem', color: theme.palette.text.secondary, mt: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{format(date, 'd MMM', { locale: it })}</Typography>
                </Box>
              ))}
            </Box>

            {(loadingMembers || loadingShifts) && (
              <StatePanel
                variant="loading"
                fullPage
                title="Caricamento griglia in corso..."
              />
            )}

            {!loadingMembers && !loadingShifts && membersList.length === 0 && (
               <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.palette.text.secondary, p: 4 }}>
                 Nessun membro del team trovato. Aggiungi il primo componente.
               </Box>
            )}

            {!loadingMembers && !loadingShifts && membersList.map(m => {
              const memberColor = m.color || '#3b82f6';

              return (
                <Box key={m.id} sx={{ display: 'grid', gridTemplateColumns: '220px repeat(7, 1fr)', borderBottom: `1px solid ${theme.palette.divider}`, '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }, transition: 'colors 0.2s', position: 'relative', minHeight: '80px', py: 1, '&:hover .hover-actions': { opacity: 1 } }}>
                  <Box sx={{ py: 1.5, px: 2, display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative' }}>
                    <Box
                      sx={{
                        width: '3px',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        backgroundColor: memberColor,
                        boxShadow: `0 0 8px ${memberColor}`,
                        opacity: 0.7
                      }}
                    />
                    <Avatar name={m.name} color={memberColor} size="sm" />
                    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                       <Typography sx={{ color: theme.palette.text.primary, fontWeight: 700, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</Typography>
                       <Badge
                         variant={m.type === 'COLLABORATORE' ? 'primary' : 'secondary'}
                         size="xs"
                         sx={{ width: 'fit-content', mt: 0.25 }}
                       >
                         {m.type}
                       </Badge>
                    </Box>
                    <PermissionGate requireAdmin>
                      <Box className="hover-actions" sx={{ position: 'absolute', right: 1, top: 1, display: 'flex', gap: 0.5, opacity: 0, transition: 'opacity 0.15s' }}>
                        <Button
                          variant="icon"
                          icon={<Edit size={14} />}
                          title="Modifica"
                          onClick={() => setIsStaffModalOpen(true)}
                        />
                        <Button
                          variant="icon"
                          icon={<Trash2 size={14} />}
                          sx={{ color: theme.palette.error.light }}
                          title="Elimina"
                          onClick={() => handleDeleteMember(m.id, m.name)}
                        />
                      </Box>
                    </PermissionGate>
                  </Box>

                  {DAYS_OF_WEEK.map((_, dayIndex) => {
                    const shift = shifts?.find(s => s.staffId === m.id && s.dayOfWeek === dayIndex && s.weekStart === week);

                    return (
                      <Box
                        key={dayIndex}
                        sx={{
                          p: 1,
                          borderLeft: `1px solid ${theme.palette.divider}`,
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          minHeight: '72px',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' }
                        }}
                      >
                        {shift ? (
                          <Box
                            onClick={() => handleCycleShift(shift)}
                            sx={{
                              position: 'relative',
                              borderRadius: '8px',
                              p: 1,
                              textAlign: 'center',
                              border: '1px solid',
                              borderColor: shift.isOff ? 'rgba(239, 68, 68, 0.3)' : `${memberColor}40`,
                              backgroundColor: shift.isOff ? 'rgba(239, 68, 68, 0.1)' : `${memberColor}15`,
                              boxShadow: updatingShiftId === shift.id ? 'none' : `0 4px 12px ${memberColor}10`,
                              transition: 'all 0.3s',
                              opacity: updatingShiftId === shift.id ? 0.5 : 1,
                              cursor: updatingShiftId === shift.id ? 'wait' : 'pointer',
                              '&:hover': updatingShiftId !== shift.id ? { transform: 'scale(1.02)', boxShadow: `0 4px 12px ${memberColor}20` } : {}
                            }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '28px' }}>
                              {updatingShiftId === shift.id ? (
                                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: 'rgba(255,255,255,0.5)' }} />
                              ) : (
                                <Typography
                                  sx={{
                                    fontSize: '0.6875rem',
                                    fontWeight: 700,
                                    display: 'block',
                                    color: shift.isOff ? theme.palette.error.main : memberColor
                                  }}
                                >
                                  {shift.label || (shift.isOff ? 'Riposo' : `${shift.startTime} - ${shift.endTime}`)}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ position: 'absolute', inset: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isAddingShift === `${m.id}-${dayIndex}` ? (
                              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'rgba(255,255,255,0.2)' }} />
                            ) : canManageShiftData ? (
                              <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, opacity: 0, transition: 'opacity 0.15s', pointerEvents: 'none', userSelect: 'none', '&:hover + button': { opacity: 1 } }}>
                                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Riposo</Typography>
                                </Box>
                                <Button
                                  variant="ghost"
                                  onClick={() => handleQuickAddShift(m.id, dayIndex)}
                                  sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    zIndex: 10,
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '8px',
                                    border: '2px dashed rgba(255,255,255,0.1)',
                                    opacity: 0,
                                    transition: 'opacity 0.15s'
                                  }}
                                  title="Aggiungi Mattina (Doppio click per opzioni)"
                                  onDoubleClick={() => openAddShift(m.id, dayIndex)}
                                  icon={<Plus size={16} />}
                                >
                                  <span style={{ fontSize: '0.5rem', fontWeight: 700 }}>MATTINA</span>
                                </Button>
                              </>
                            ) : (
                              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', userSelect: 'none' }}>Riposo</Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
</Box>
              );
            })}
          </Box>
        </Box>
      </Paper>

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
    </Box>
  );
}
