'use client';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import { Search } from 'lucide-react';

import Input from '@/common/components/ui/Input';

interface DataTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function DataTableToolbar({ search, onSearchChange }: DataTableToolbarProps) {
  const { t } = useTranslation();

  return (
    <Box className="table-toolbar" sx={{ display: 'flex', mb: 2 }}>
      <Input
        type="search"
        placeholder={t('Cerca...')}
        value={search}
        onChange={onSearchChange}
        icon={Search}
        size="sm"
        sx={{ minWidth: 220, maxWidth: 360 }}
      />
    </Box>
  );
}
