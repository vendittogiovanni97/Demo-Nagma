"use client";

import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import TimeSelect from '@/components/forms/TimeSelect';
import { DURATA_OPTIONS } from '@/config/booking-config';
import { Box, useTheme } from '@mui/material';
import { CalendarDays } from 'lucide-react';

interface Props {
  date: string;
  time: string;
  duration: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onDurationChange: (value: string) => void;
}

export default function BookingDateTimeSection({ date, time, duration, onDateChange, onTimeChange, onDurationChange }: Props) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalendarDays size={14} style={{ color: theme.palette.primary.main }} />
        <Box
          component="span"
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}
        >
          Quando
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <FormInput label="Data *" type="date" required value={date} onChange={onDateChange} />
        <TimeSelect label="Ora *" value={time} onChange={onTimeChange} required minuteStep={15} />
      </Box>
      <FormSelect
        label="Durata sessione"
        value={duration}
        onChange={onDurationChange}
        options={DURATA_OPTIONS}
      />
    </Box>
  );
}
