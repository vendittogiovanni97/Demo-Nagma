'use client';

import FormInput from '@/components/forms/FormInput';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  sx?: object;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Cerca...',
  className,
  disabled,
  sx,
}: SearchInputProps) {
  return (
    <FormInput
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      size="sm"
      icon={Search}
      className={className}
      hideLabel
      sx={sx}
    />
  );
}
