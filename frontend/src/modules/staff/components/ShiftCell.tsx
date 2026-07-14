"use client";

import Button from '@/common/components/ui/Button';
import type { Shift } from '../model/staff.types';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import Icon from '@/common/components/ui/Icon';

interface ShiftCellProps {
  shift: Shift | undefined;
  memberColor: string;
  updatingShiftId: string | null;
  isAddingShiftKey: string | null;
  addingKey: string;
  canManageShiftData: boolean;
  onCycleShift: (shift: Shift) => void;
  onQuickAdd: () => void;
  onDoubleClickAdd: () => void;
}

export default function ShiftCell({
  shift,
  memberColor,
  updatingShiftId,
  isAddingShiftKey,
  addingKey,
  canManageShiftData,
  onCycleShift,
  onQuickAdd,
  onDoubleClickAdd,
}: ShiftCellProps) {
  const theme = useTheme();
  const isUpdating = shift ? updatingShiftId === shift.id : false;
  const isAdding = isAddingShiftKey === addingKey;

  return (
    <Box
      sx={{
        p: 1,
        borderLeft: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '72px',
        '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.01) },
      }}
    >
      {shift ? (
        <Box
          onClick={() => onCycleShift(shift)}
          sx={{
            position: 'relative',
            borderRadius: '8px',
            p: 1,
            textAlign: 'center',
            border: '1px solid',
            borderColor: shift.isOff ? alpha(theme.palette.error.main, 0.3) : alpha(memberColor, 0.25),
            backgroundColor: shift.isOff ? alpha(theme.palette.error.main, 0.1) : alpha(memberColor, 0.08),
            boxShadow: isUpdating ? 'none' : `0 4px 12px ${alpha(memberColor, 0.06)}`,
            transition: 'all 0.3s',
            opacity: isUpdating ? 0.5 : 1,
            cursor: isUpdating ? 'wait' : 'pointer',
            '&:hover': !isUpdating ? { transform: 'scale(1.02)', boxShadow: `0 4px 12px ${alpha(memberColor, 0.12)}` } : {},
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '28px' }}>
            {isUpdating ? (
              <Box component="span" sx={{ animation: 'spin 1s linear infinite', display: 'inline-flex', color: alpha(theme.palette.text.secondary, 0.5) }}>
                <Icon name="loader2" size={14} />
              </Box>
            ) : (
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  display: 'block',
                  color: shift.isOff ? theme.palette.error.main : memberColor,
                }}
              >
                {shift.label || (shift.isOff ? 'Riposo' : `${shift.startTime} - ${shift.endTime}`)}
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ position: 'absolute', inset: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isAdding ? (
            <Box component="span" sx={{ animation: 'spin 1s linear infinite', display: 'inline-flex', color: alpha(theme.palette.text.secondary, 0.2) }}>
              <Icon name="loader2" size={16} />
            </Box>
          ) : canManageShiftData ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  opacity: 0,
                  transition: 'opacity 0.15s',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  '&:hover + button': { opacity: 1 },
                }}
              >
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: alpha(theme.palette.text.secondary, 0.2), textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Riposo
                </Typography>
              </Box>
              <Button
                variant="ghost"
                onClick={onQuickAdd}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 10,
                  width: '100%',
                  height: '100%',
                  borderRadius: '8px',
                  border: `2px dashed ${alpha(theme.palette.common.white, 0.1)}`,
                  opacity: 0,
                  transition: 'opacity 0.15s',
                }}
                title="Aggiungi Mattina (Doppio click per opzioni)"
                onDoubleClick={onDoubleClickAdd}
                icon={<Icon name="plus" size={16} />}
              >
                <span style={{ fontSize: '0.5rem', fontWeight: 700 }}>MATTINA</span>
              </Button>
            </>
          ) : (
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: alpha(theme.palette.text.secondary, 0.2), textTransform: 'uppercase', letterSpacing: '0.1em', userSelect: 'none' }}>
              Riposo
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}