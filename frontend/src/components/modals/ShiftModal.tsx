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
import { Box, Typography, useTheme } from '@mui/material';
import SmartModal from '@/components/common/SmartModal';
import FormSelect from '@/components/forms/FormSelect';

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

  // React to prop changes
  if (isOpen && initialStaffId !== undefined && staffId !== initialStaffId.toString() && !loading) {
    setStaffId(initialStaffId.toString());
  }
  if (isOpen && initialDayOfWeek !== undefined && dayOfWeek !== initialDayOfWeek.toString() && !loading) {
    setDayOfWeek(initialDayOfWeek.toString());
  }

  const handleSave = async () => {
    if (!staffId) {
      toast.error('Seleziona un collaboratore');
      return;
    }

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

  const staffOptions = (members || []).map(m => ({ value: m.id.toString(), label: m.name }));

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title="Pianifica Turno"
      onSave={handleSave}
      isSaving={loading}
      saveLabel="Salva Turno"
      maxWidth="sm"
    >
      {!isAdmin ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin e segreteria possono gestire i turni."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mb: 0.5 }}>
              Settimana di riferimento
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: theme.palette.text.primary }}>
              {weekStart}
            </Typography>
          </Box>

          <FormSelect
            label="Collaboratore"
            value={staffId}
            onChange={setStaffId}
            options={staffOptions}
            required
            placeholder="Seleziona..."
          />

          <FormSelect
            label="Giorno"
            value={dayOfWeek}
            onChange={setDayOfWeek}
            options={DAYS}
            required
          />

          <FormSelect
            label="Tipo di Turno"
            value={label}
            onChange={setLabel}
            options={SHIFT_OPTIONS}
            required
          />
        </Box>
      )}
    </SmartModal>
  );
}
