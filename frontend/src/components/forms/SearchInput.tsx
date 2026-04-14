"use client";

import { Search } from 'lucide-react';

import { cn } from '@/utils/cn';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ value, onChange, placeholder = 'Cerca...', className }: SearchInputProps) {
  return (
    <div className={cn('relative flex-1', className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-surface-border bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-accent"
      />
    </div>
  );
}
