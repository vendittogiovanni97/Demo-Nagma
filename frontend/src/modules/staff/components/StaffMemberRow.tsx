"use client";

import PermissionGate from '@/common/components/auth/PermissionGate';
import Avatar from '@/common/components/ui/Avatar';
import Badge from '@/common/components/ui/Badge';
import { DAYS_OF_WEEK } from '@/common/config/staff-config';
import type { Shift, Staff } from '../model/staff.types';
import { alpha } from '@mui/material/styles';
import { Box, Typography, useTheme, IconButton, Menu, MenuItem } from '@mui/material';
import Icon from '@/common/components/ui/Icon';
import { useState } from 'react';
import ShiftCell from './ShiftCell';

interface StaffMemberRowProps {
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

export default function StaffMemberRow({
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
}: StaffMemberRowProps) {
  const theme = useTheme();
  const memberColor = member.color || theme.palette.info.main;
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
        '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.03) },
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
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <Icon name="moreVertical" size={18} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleEdit} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Icon name="edit" size={16} />
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
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <Icon name="trash2" size={16} />
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
