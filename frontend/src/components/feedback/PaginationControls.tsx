"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  label?: string;
}

export default function PaginationControls({
  page,
  totalPages,
  total,
  onPrev,
  onNext,
  label = 'risultati',
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between p-4 border-t border-surface-border">
      <span className="text-sm text-text-secondary">
        Pagina {page} di {totalPages} ({total} {label})
      </span>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
