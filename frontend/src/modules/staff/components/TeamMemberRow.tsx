"use client";

import PermissionGate from '@/components/auth/PermissionGate';
import Avatar from '@/components/data-display/Avatar';
import Badge from '@/components/ui/Badge';
import { DAYS_OF_WEEK } from '@/config/staff-config';
import type { Shift, Staff } from '../model/staff.types';
import { Box, Typography, useTheme, IconButton, Menu, MenuItem } from '@mui/material';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEditMember(member);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDeleteMember(member.id, member.name);
    handleMenuClose();
  };

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
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              position: 'absolute',
              right: 1,
              top: 1,
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: 'rgba(0, 191, 255, 0.1)',
              },
            }}
          >
            <MoreVertical size={18} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleEdit} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Edit size={16} />
              <Typography variant="body2">Modifica</Typography>
            </MenuItem>
            <MenuItem
              onClick={handleDelete}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                color: theme.palette.error.main,
                '&:hover': {
                  bgcolor: 'rgba(244, 67, 54, 0.1)',
                },
              }}
            >
              <Trash2 size={16} />
              <Typography variant="body2">Elimina</Typography>
            </MenuItem>
          </Menu>
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
