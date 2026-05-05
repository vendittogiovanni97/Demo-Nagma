"use client";

import StatePanel from '@/components/feedback/StatePanel';
import { DAYS_OF_WEEK } from '@/config/staff-config';
import type { Shift, Staff } from '../model/staff.types';
import { Box, Typography, useTheme } from '@mui/material';
import { addDays, format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import StaffMemberRow from './StaffMemberRow';

interface StaffShiftsGridProps {
  members: Staff[];
  shifts: Shift[];
  weekStart: string;
  isLoading: boolean;
  updatingShiftId: string | null;
  isAddingShift: string | null;
  canManageShiftData: boolean;
  onEditMember: (member: Staff) => void;
  onDeleteMember: (id: number, name: string) => void;
  onCycleShift: (shift: Shift) => void;
  onQuickAddShift: (staffId: number, dayOfWeek: number) => void;
  onOpenAddShift: (staffId: number, dayOfWeek: number) => void;
}

export default function StaffShiftsGrid({
  members,
  shifts,
  weekStart,
  isLoading,
  updatingShiftId,
  isAddingShift,
  canManageShiftData,
  onEditMember,
  onDeleteMember,
  onCycleShift,
  onQuickAddShift,
  onOpenAddShift,
}: StaffShiftsGridProps) {
  const theme = useTheme();
  const weekDates = DAYS_OF_WEEK.map((_, i) => addDays(parseISO(weekStart), i));

  return (
    <Box sx={{ overflowX: 'auto', flex: 1, width: '100%', minHeight: '500px' }}>
      <Box sx={{ minWidth: '800px', height: '100%', display: 'flex', flexDirection: 'column', pb: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '220px repeat(7, 1fr)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: 'rgba(0,0,0,0.2)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backdropFilter: 'blur(12px)',
          }}
        >
          <Box
            sx={{
              py: 2,
              px: 2,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: theme.palette.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Collaboratore
          </Box>
          {weekDates.map((date, i) => (
            <Box
              key={i}
              sx={{
                py: 2,
                px: 1.5,
                textAlign: 'center',
                borderLeft: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: theme.palette.text.primary, fontWeight: 700, fontSize: '0.75rem' }}>
                {DAYS_OF_WEEK[i]}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.625rem',
                  color: theme.palette.text.secondary,
                  mt: 0.25,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {format(date, 'd MMM', { locale: it })}
              </Typography>
            </Box>
          ))}
        </Box>

        {isLoading && (
          <StatePanel variant="loading" fullPage title="Caricamento griglia in corso..." />
        )}

        {!isLoading && members.length === 0 && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.text.secondary,
              p: 4,
            }}
          >
            Nessun membro del team trovato. Aggiungi il primo componente.
          </Box>
        )}

        {!isLoading &&
          members.map(member => (
            <StaffMemberRow
              key={member.id}
              member={member}
              shifts={shifts}
              weekStart={weekStart}
              updatingShiftId={updatingShiftId}
              isAddingShift={isAddingShift}
              canManageShiftData={canManageShiftData}
              onEditMember={onEditMember}
              onDeleteMember={onDeleteMember}
              onCycleShift={onCycleShift}
              onQuickAddShift={onQuickAddShift}
              onOpenAddShift={onOpenAddShift}
            />
          ))}
      </Box>
    </Box>
  );
}
