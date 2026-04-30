"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Stack, Typography, SxProps, Theme } from '@mui/material';
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
    <Stack direction="row" sx={styles.container}>
      <Typography variant="body2" sx={styles.text}>
        Pagina {page} di {totalPages} ({total} {label})
      </Typography>
      <Stack direction="row" sx={styles.actions}>
        <Button
          variant="ghost" size="sm"
          onClick={onPrev}
          disabled={page <= 1}
          icon={<ChevronLeft size={18} />}
          sx={styles.navButton}
        />
        <Button
          variant="ghost" size="sm"
          onClick={onNext}
          disabled={page >= totalPages}
          icon={<ChevronRight size={18} />}
          sx={styles.navButton}
        />
      </Stack>
    </Stack>
  );
}

const styles = {
  container: {
    alignItems: 'center', justifyContent: 'space-between',
    p: 2, borderTop: 1, borderColor: 'divider'
  } as SxProps<Theme>,
  text: {
    color: 'text.secondary'
  } as SxProps<Theme>,
  actions: {
    gap: 1
  } as SxProps<Theme>,
  navButton: {
    p: 0, minWidth: 'auto'
  } as SxProps<Theme>,
};
