"use client";

import PermissionGate from '@/components/auth/PermissionGate';
import Avatar from '@/components/data-display/Avatar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { DAYS_OF_WEEK } from '@/config/team-config';
import type { Shift, Staff } from '@/types/team';
import { Box, Typography, useTheme } from '@mui/material';
import { Edit, Trash2 } from 'lucide-react';
import ShiftCell from './ShiftCell';

interface TeamMemberRowProps {
  member: Staff;
  shifts: Shift[];
  weekStart: string;
  updatingShiftId: string | null;
  isAddingShift: string | null;
  canManageShiftData: boolean;
  onEditMember: (member: Staff) => void;
  onDeleteMember: (id: number, name: string) => void;
  onCycleShift: (shift: Shift) => void;
  onQuickAddShift: (staffId: number, dayOfWeek: number) => void;
  onOpenAddShift: (staffId: number, dayOfWeek: number) => void;
}

export default function TeamMemberRow({
  member,
  shifts,
  weekStart,
  updatingShiftId,
  isAddingShift,
  canManageShiftData,
  onEditMember,
  onDeleteMember,
  onCycleShift,
  onQuickAddShift,
  onOpenAddShift,
}: TeamMemberRowProps) {
  const theme = useTheme();
  const memberColor = member.color || '#3b82f6';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '220px repeat(7, 1fr)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
        transition: 'colors 0.2s',
        position: 'relative',
        minHeight: '80px',
        py: 1,
        '&:hover .hover-actions': { opacity: 1 },
      }}
    >
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
            opacity: 0.7,
          }}
        />
        <Avatar name={member.name} color={memberColor} size="sm" />
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Typography
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 700,
              fontSize: '0.8125rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {member.name}
          </Typography>
          <Badge
            variant={member.type === 'COLLABORATORE' ? 'primary' : 'secondary'}
            size="xs"
            sx={{ width: 'fit-content', mt: 0.25 }}
          >
            {member.type}
          </Badge>
        </Box>
        <PermissionGate requireAdmin>
          <Box
            className="hover-actions"
            sx={{ position: 'absolute', right: 1, top: 1, display: 'flex', gap: 0.5, opacity: 0, transition: 'opacity 0.15s' }}
          >
            <Button
              variant="icon"
              icon={<Edit size={14} />}
              title="Modifica"
              onClick={() => onEditMember(member)}
            />
            <Button
              variant="icon"
              icon={<Trash2 size={14} />}
              sx={{ color: theme.palette.error.light }}
              title="Elimina"
              onClick={() => onDeleteMember(member.id, member.name)}
            />
          </Box>
        </PermissionGate>
      </Box>

      {DAYS_OF_WEEK.map((_, dayIndex) => {
        const shift = shifts.find(
          s => s.staffId === member.id && s.dayOfWeek === dayIndex && s.weekStart === weekStart
        );

        return (
          <ShiftCell
            key={dayIndex}
            shift={shift}
            memberColor={memberColor}
            updatingShiftId={updatingShiftId}
            isAddingShiftKey={isAddingShift}
            addingKey={`${member.id}-${dayIndex}`}
            canManageShiftData={canManageShiftData}
            onCycleShift={onCycleShift}
            onQuickAdd={() => onQuickAddShift(member.id, dayIndex)}
            onDoubleClickAdd={() => onOpenAddShift(member.id, dayIndex)}
          />
        );
      })}
    </Box>
  );
}
