'use client';

import type { LucideIcon } from 'lucide-react';
import Input from '@/components/ui/Input';

interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'search' | 'tel' | 'url';
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'danger' | 'success';
  className?: string;
  pattern?: string;
}

/**
 * FormInput - Wrapper compatibile del nuovo Input component da @/components/ui/Input
 * Mantiene la backward compatibility con i componenti legacy che usano FormInput
 */
export default function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  icon,
  min,
  max,
  step,
  disabled,
  error,
  size = 'md',
  variant = 'default',
  className,
  pattern,
}: FormInputProps) {
  return (
    <Input
      label={label}
      value={value}
      onChange={onChange}
      type={type as 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'search' | 'tel' | 'url'}
      placeholder={placeholder}
      required={required}
      icon={icon}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      error={error}
      size={size}
      variant={variant}
      className={className}
      pattern={pattern}
    />
  );
}
