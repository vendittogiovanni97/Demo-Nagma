"use client";

import StatePanel from '@/common/components/feedback/StatePanel';
import { EXPORT_FETCH_LIMIT } from '@/common/config/env';
import { useAuth } from '@/common/context/AuthContext';
import { useStaffMembers } from '@/modules/staff/hooks/useStaff';
import { staffApi } from '@/modules/staff/api/staff.api';
import { useEntityForm } from '@/common/hooks/useEntityForm';
import type { CreateShiftData } from '@/modules/staff/model/staff.types';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SmartModal from '@/common/components/common/SmartModal';
import FormSelect from '@/common/components/forms/FormSelect';

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

interface ShiftFormData {
  staffId: string;
  dayOfWeek: string;
  label: string;
}

export default function ShiftModal({ isOpen, onClose, onSuccess, weekStart, initialStaffId, initialDayOfWeek }: Props) {
  const { isAdmin } = useAuth();
  const theme = useTheme();

  const form = useEntityForm<null, ShiftFormData, CreateShiftData>({
    entity: null,
    open: isOpen,
    initial: () => ({
      staffId: initialStaffId !== undefined ? initialStaffId.toString() : '',
      dayOfWeek: initialDayOfWeek !== undefined ? initialDayOfWeek.toString() : '0',
      label: 'Mattina',
    }),
    validate: (data) => (!data.staffId ? 'Seleziona un collaboratore' : null),
    buildPayload: (data) => ({
      staffId: Number(data.staffId),
      weekStart,
      dayOfWeek: Number(data.dayOfWeek),
      label: data.label,
      isOff: data.label === 'Riposo',
    }),
    persist: async (payload) => {
      await staffApi.createShift(payload);
    },
    successMessage: 'Turno pianificato',
    errorMessage: 'Errore nella creazione turno',
    onClose,
    onSuccess,
  });

  const { formData, setField, isLoading } = form;
  const { data: membersResult } = useStaffMembers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen });
  const members = membersResult?.data;
  const staffOptions = (members || []).map(m => ({ value: m.id.toString(), label: m.name }));

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title="Pianifica Turno"
      onSave={form.handleSubmit}
      isSaving={isLoading}
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
              backgroundColor: alpha(theme.palette.common.white, 0.03),
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
            value={formData.staffId}
            onChange={(v) => setField('staffId', v)}
            options={staffOptions}
            required
            placeholder="Seleziona..."
          />

          <FormSelect
            label="Giorno"
            value={formData.dayOfWeek}
            onChange={(v) => setField('dayOfWeek', v)}
            options={DAYS}
            required
          />

          <FormSelect
            label="Tipo di Turno"
            value={formData.label}
            onChange={(v) => setField('label', v)}
            options={SHIFT_OPTIONS}
            required
          />
        </Box>
      )}
    </SmartModal>
  );
}
