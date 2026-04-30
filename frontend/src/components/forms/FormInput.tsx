'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import Input from '@/components/ui/Input';

interface FormInputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'search' | 'tel' | 'url' | 'month';
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  endAdornment?: ReactNode;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'danger' | 'success';
  className?: string;
  pattern?: string;
  autoComplete?: string;
  hideLabel?: boolean;
  sx?: any;
}

/**
 * FormInput - Wrapper compatibile del nuovo Input component da @/components/ui/Input
 */
export default function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  icon,
  endAdornment,
  min,
  max,
  step,
  disabled,
  error,
  size = 'md',
  variant = 'default',
  className,
  pattern,
  autoComplete,
  hideLabel = false,
  sx,
}: FormInputProps) {
  return (
    <Input
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      required={required}
      icon={icon}
      endAdornment={endAdornment}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      error={error}
      size={size}
      variant={variant}
      className={className}
      pattern={pattern}
      autoComplete={autoComplete}
      hideLabel={hideLabel}
      sx={sx}
    />
  );
}
