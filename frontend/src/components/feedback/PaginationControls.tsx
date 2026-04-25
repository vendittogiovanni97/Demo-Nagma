"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Stack, Typography } from '@mui/material';
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
    <Stack
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2, borderTop: 1, borderColor: 'divider' }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Pagina {page} di {totalPages} ({total} {label})
      </Typography>
      <Stack direction="row" sx={{ gap: 1 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1}
          icon={<ChevronLeft size={18} />}
          sx={{ p: 0, minWidth: 'auto' }}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages}
          icon={<ChevronRight size={18} />}
          sx={{ p: 0, minWidth: 'auto' }}
        />
      </Stack>
    </Stack>
  );
}
