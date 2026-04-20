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
 *
 * NOTE: Input già supporta label opzionale, ma SearchInput usa
 * posizionamento assoluto dell'icona e aria-label senza label visibile —
 * struttura incompatibile con l'API icon di Input.
 * TODO: unify with Input
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
