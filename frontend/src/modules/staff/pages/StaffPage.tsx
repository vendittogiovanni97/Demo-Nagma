"use client";

import PageHeader from '@/common/components/common/PageHeader';
import StatePanel from '@/common/components/feedback/StatePanel';
import WeekNavigator from '@/common/components/layout/WeekNavigator';
import ExportModal from '@/common/components/modals/ExportModal';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import { useAuth } from '@/common/context/AuthContext';
import { useStaffMembers, useStaffShifts } from '../hooks/useStaff';
import { useDeleteConfirm } from '@/common/hooks/useDeleteConfirm';
import { staffApi } from '../api/staff.api';
import type { Shift, Staff } from '../model/staff.types';
import { Box, useTheme } from '@mui/material';
import Paper from '@/common/components/ui/Paper';
import { addWeeks, format, parseISO, startOfWeek, subWeeks } from 'date-fns';
import Icon from '@/common/components/ui/Icon';
import { useState } from 'react';
import ShiftModal from '../components/modals/ShiftModal';
import StaffModal from '../components/modals/StaffModal';
import StaffShiftsGrid from '../components/StaffShiftsGrid';
import { useShiftActions } from '../hooks/useShiftActions';

export default function StaffPage() {
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
  } = useStaffMembers({ page: 1, limit: 100 });

  const {
    data: shifts,
    isLoading: loadingShifts,
    mutate: mutateShifts,
    error: shiftsError,
  } = useStaffShifts(week);

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
      action: () => staffApi.delete(id),
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
              {
                label: 'Giorno',
                value: (shift: Shift) => {
                  const DAYS = [
                    'Lunedì',
                    'Martedì',
                    'Mercoledì',
                    'Giovedì',
                    'Venerdì',
                    'Sabato',
                    'Domenica',
                  ];
                  return DAYS[shift.dayOfWeek] || '';
                },
              },
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
        secondaryButtonIcon={<Icon name="plus" size={14} />}
        secondaryButtonRequiresAdmin
        onSecondaryButtonClick={() => openAddShift()}
        showButton
        buttonLabel="Staff"
        buttonIcon={<Icon name="plus" size={14} />}
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
        <StaffShiftsGrid
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
