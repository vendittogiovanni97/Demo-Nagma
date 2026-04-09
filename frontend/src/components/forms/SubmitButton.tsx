"use client";

import { Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SubmitButtonProps {
  loading: boolean;
  label: string;
  loadingLabel?: string;
  icon?: LucideIcon;
}

export default function SubmitButton({ loading, label, loadingLabel, icon: Icon }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-4 text-lg disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={24} />
          <span>{loadingLabel || 'Salvataggio...'}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={24} />}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
