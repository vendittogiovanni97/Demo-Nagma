"use client";

import PageHeader from '@/components/common/PageHeader';
import StatePanel from '@/components/feedback/StatePanel';
import WeekNavigator from '@/components/layout/WeekNavigator';
import ExportModal from '@/components/modals/ExportModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useTeamMembers, useTeamShifts } from '../hooks/useTeam';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { teamApi } from '../api/team.api';
import type { Shift, Staff } from '../model/team.types';
import { Box, Paper, useTheme } from '@mui/material';
import { addWeeks, format, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import ShiftModal from '../components/modals/ShiftModal';
import StaffModal from '../components/modals/StaffModal';
import TeamShiftsGrid from '../components/TeamShiftsGrid';
import { useShiftActions } from '../hooks/useShiftActions';

export default function TeamPage() {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const [week, setWeek] = useState(() =>
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftModalData, setShiftModalData] = useState<{ staffId?: number; dayOfWeek?: number }>({});

  const canManageShiftData = isAdmin;

  const {
    data: membersResult,
    isLoading: loadingMembers,
    mutate: mutateMembers,
    error: membersError,
  } = useTeamMembers({ page: 1, limit: 100 });

  const {
    data: shifts,
    isLoading: loadingShifts,
    mutate: mutateShifts,
    error: shiftsError,
  } = useTeamShifts(week);

  const membersList = (membersResult?.data || []).sort((a, b) => {
    if (a.type === 'COLLABORATORE' && b.type !== 'COLLABORATORE') return -1;
    if (a.type !== 'COLLABORATORE' && b.type === 'COLLABORATORE') return 1;
    return 0;
  });

  const { updatingShiftId, isAddingShift, handleCycleShift, handleQuickAddShift, handleDeleteShift } =
    useShiftActions({
      week,
      canManageShiftData,
      mutateShifts,
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
      action: () => teamApi.deleteMember(id),
      successMessage: `${name} rimosso dal team`,
      errorMessage: 'Errore durante l\'eliminazione',
      onSuccess: mutateMembers,
    });
  };

  const openAddShift = (staffId?: number, dayOfWeek?: number) => {
    setShiftModalData({ staffId, dayOfWeek });
    setIsShiftModalOpen(true);
  };

  const handleEditMember = (_member: Staff) => {
    setIsStaffModalOpen(true);
  };

  const handleDeleteShiftById = async (id: string) => {
    await handleDeleteShift(id, deleteItem);
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

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <PageHeader
        title="Team & Turni"
        filters={
          <WeekNavigator
            weekStart={week}
            onPrev={handlePrevWeek}
            onNext={handleNextWeek}
            format="short"
            variant="header"
          />
        }
        actions={
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
                value: (shift: Shift) =>
                  shift.isOff ? 'Giorno libero' : `${shift.startTime} - ${shift.endTime}`,
              },
            ]}
          />
        }
        showSecondaryButton
        secondaryButtonLabel="Turno"
        secondaryButtonIcon={<Plus size={14} />}
        secondaryButtonRequiresAdmin
        onSecondaryButtonClick={() => openAddShift()}
        showButton
        buttonLabel="Staff"
        buttonIcon={<Plus size={14} />}
        buttonRequiresAdmin
        onButtonClick={() => setIsStaffModalOpen(true)}
      />

      <Paper
        sx={{
          flex: 1,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: '100%',
          position: 'relative',
          bgcolor: 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <TeamShiftsGrid
          members={membersList}
          shifts={shifts || []}
          weekStart={week}
          isLoading={loadingMembers || loadingShifts}
          updatingShiftId={updatingShiftId}
          isAddingShift={isAddingShift}
          canManageShiftData={canManageShiftData}
          onEditMember={handleEditMember}
          onDeleteMember={handleDeleteMember}
          onCycleShift={handleCycleShift}
          onQuickAddShift={handleQuickAddShift}
          onOpenAddShift={(staffId, dayOfWeek) => openAddShift(staffId, dayOfWeek)}
        />
      </Paper>

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          mutateMembers();
        }}
      />
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
