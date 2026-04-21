"use client";

import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import TimeSelect from '@/components/forms/TimeSelect';
import { DURATA_OPTIONS } from '@/config/booking-config';
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
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays size={14} className="text-accent" />
        <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Quando</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormInput label="Data *" type="date" required value={date} onChange={onDateChange} />
        <TimeSelect label="Ora *" value={time} onChange={onTimeChange} required minuteStep={15} />
      </div>
      <FormSelect
        label="Durata sessione"
        value={duration}
        onChange={onDurationChange}
        options={DURATA_OPTIONS}
      />
    </div>
  );
}
