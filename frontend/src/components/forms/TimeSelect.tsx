"use client";

import FormInput from '@/components/forms/FormInput';

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minuteStep?: number;
}

export default function TimeSelect({ label, value, onChange, required, minuteStep = 15 }: Props) {
  return (
    <FormInput
      label={label}
      type="time"
      value={value}
      onChange={onChange}
      required={required}
      step={minuteStep * 60}
    />
  );
}
