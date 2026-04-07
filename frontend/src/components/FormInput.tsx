"use client";

import type { LucideIcon } from 'lucide-react';

interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  min?: string | number;
  max?: string | number;
  step?: string;
  disabled?: boolean;
}

export default function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  icon: Icon,
  min,
  max,
  step,
  disabled,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-sm flex items-center gap-2 px-1">
        {Icon && <Icon size={14} />}
        {label}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full bg-white/5 border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:border-accent transition-all disabled:opacity-50"
      />
    </div>
  );
}
