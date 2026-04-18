"use client";

import type { LucideIcon } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  required?: boolean;
  icon?: LucideIcon;
  placeholder?: string;
  disabled?: boolean;
}

export default function FormSelect({
  label,
  value,
  onChange,
  options,
  required,
  icon: Icon,
  placeholder,
  disabled,
}: FormSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-sm flex items-center gap-2 px-1">
        {Icon && <Icon size={14} />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-white/5 border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:border-accent transition-all appearance-none disabled:opacity-50"
      >
        {placeholder && <option value="" className="bg-[#0a0a0a]">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
