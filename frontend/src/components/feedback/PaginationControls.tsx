"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

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
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1}
          icon={<ChevronLeft size={18} />}
          className="p-0 w-auto"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages}
          icon={<ChevronRight size={18} />}
          className="p-0 w-auto"
        />
      </div>
    </div>
  );
}
