'use client';

import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * SearchInput - Input specializzato per ricerche
 *
 * Wrapper minimalista per search input con icona Search.
 * Non usa il componente Input generico perché:
 * - Non richiede label (Input attualmente lo rende sempre)
 * - Ha stili specializzati (senza label, padding/layout specifico)
 * - Mantiene backward compatibility totale con l'implementazione legacy
 *
 * NOTA: Se in futuro Input supporterà label opzionale, questo
 * potrebbe essere convertito a un wrapper di Input con type="search"
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Cerca...',
  className,
  disabled,
}: SearchInputProps) {
  return (
    <div className={`relative flex-1 ${className || ''}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-surface-border bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Search"
      />
    </div>
  );
}
