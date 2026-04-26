"use client";

import StatePanel from '@/components/feedback/StatePanel';
import { EXPORT_FETCH_LIMIT } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useTeamMembers } from '@/hooks/domain/useTeam';
import { useToast } from '@/hooks/useToast';
import { teamService } from '@/services/team.service';
import type { CreateShiftData } from '@/types/team';
import { extractErrorMessage } from '@/utils/extract-error';
import { useState } from 'react';
import { Box, MenuItem, TextField, Typography, useTheme } from '@mui/material';
import SubmitButton from '@/components/forms/SubmitButton';
import Modal from '@/components/modals/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  weekStart: string;
  initialStaffId?: number;
  initialDayOfWeek?: number;
}

const DAYS = [
  { value: '0', label: 'Lunedì' },
  { value: '1', label: 'Martedì' },
  { value: '2', label: 'Mercoledì' },
  { value: '3', label: 'Giovedì' },
  { value: '4', label: 'Venerdì' },
  { value: '5', label: 'Sabato' },
  { value: '6', label: 'Domenica' },
];

const SHIFT_OPTIONS = [
  { value: 'Mattina', label: 'Mattina (09:00 - 13:00)' },
  { value: 'Pomeriggio', label: 'Pomeriggio (14:00 - 19:00)' },
  { value: 'Tutta la giornata', label: 'Tutta la giornata (09:00 - 19:00)' },
  { value: 'Riposo', label: 'Riposo' },
];

export default function ShiftModal({ isOpen, onClose, onSuccess, weekStart, initialStaffId, initialDayOfWeek }: Props) {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const theme = useTheme();
  const [staffId, setStaffId] = useState(initialStaffId !== undefined ? initialStaffId.toString() : '');
  const [dayOfWeek, setDayOfWeek] = useState(initialDayOfWeek !== undefined ? initialDayOfWeek.toString() : '0');
  const [label, setLabel] = useState('Mattina');
  const [loading, setLoading] = useState(false);

  const { data: membersResult } = useTeamMembers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen });
  const members = membersResult?.data;

  if (isOpen && initialStaffId !== undefined && staffId !== initialStaffId.toString() && !loading) {
    setStaffId(initialStaffId.toString());
  }
  if (isOpen && initialDayOfWeek !== undefined && dayOfWeek !== initialDayOfWeek.toString() && !loading) {
    setDayOfWeek(initialDayOfWeek.toString());
  }

  const fieldLabelSx = {
    px: 0.5,
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.primary.main,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  } as const;

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 1.5,
      fontSize: '0.9375rem',
    },
  } as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) { toast.error('Seleziona un collaboratore'); return; }
    setLoading(true);
    try {
      const data: CreateShiftData = {
        staffId: Number(staffId),
        weekStart,
        dayOfWeek: Number(dayOfWeek),
        label,
        isOff: label === 'Riposo',
      };
      await teamService.createShift(data);
      toast.success('Turno pianificato');
      setStaffId('');
      setDayOfWeek('0');
      setLabel('Mattina');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Errore nella creazione turno'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pianifica Turno" maxWidth="sm">
      {!isAdmin ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin e segreteria possono gestire i turni."
        />
      ) : (
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} onSubmit={handleSubmit}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
              Settimana di riferimento
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: theme.palette.text.primary }}>
              {weekStart}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={fieldLabelSx}>Collaboratore</Typography>
            <TextField
              select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              size="small"
              fullWidth
              sx={inputSx}
            >
              {(members || []).map((member) => (
                <MenuItem key={member.id} value={member.id.toString()}>
                  {member.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={fieldLabelSx}>Giorno</Typography>
            <TextField
              select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              size="small"
              fullWidth
              sx={inputSx}
            >
              {DAYS.map((day) => (
                <MenuItem key={day.value} value={day.value}>
                  {day.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={fieldLabelSx}>Tipo di Turno</Typography>
            <TextField
              select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              size="small"
              fullWidth
              sx={inputSx}
            >
              {SHIFT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <SubmitButton loading={loading} label="Salva Turno" />
        </Box>
      )}
    </Modal>
  );
}
