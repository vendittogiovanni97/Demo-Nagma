"use client";

import type { LucideIcon } from 'lucide-react';

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  rows?: number;
  disabled?: boolean;
}

export default function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  required,
  icon: Icon,
  rows = 3,
  disabled,
}: FormTextareaProps) {
  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-sm flex items-center gap-2 px-1">
        {Icon && <Icon size={14} />}
        {label}
      </label>
      <textarea
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        disabled={disabled}
        className="w-full bg-white/5 border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:border-accent transition-all resize-none disabled:opacity-50"
      />
    </div>
  );
}
