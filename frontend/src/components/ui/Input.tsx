"use client";

import type { InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'search' | 'tel' | 'url';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange' | 'type'> {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: InputType;
  icon?: LucideIcon;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'danger' | 'success';
}

const sizeClasses = {
  sm: 'h-10 px-3 text-sm',
  md: 'h-12 px-4 text-sm',
  lg: 'h-14 px-4 text-base',
} as const;

const variantClasses = {
  default: 'border-surface-border focus:border-accent',
  danger: 'border-red-500/50 focus:border-red-400',
  success: 'border-emerald-500/50 focus:border-emerald-400',
} as const;

export default function Input({
  label,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  error,
  size = 'md',
  variant = 'default',
  className,
  required,
  disabled,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label ? (
        <label className="text-sm text-text-secondary flex items-center justify-start gap-2 px-1">
          {Icon ? <Icon size={14} className="shrink-0" /> : null}
          {label}
          {required ? <span className="text-red-400">*</span> : null}
        </label>
      ) : null}

      <input
        {...props}
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'w-full rounded-xl bg-white/5 text-white outline-none transition-all',
          'border focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[error ? 'danger' : variant],
          className,
        )}
      />

      {error ? <p className="text-sm text-red-400 px-1">{error}</p> : null}
    </div>
  );
}
