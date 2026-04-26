"use client";

import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { formatPrice } from '@/utils/format';

export interface SpesaColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: number;
  render?: (value: unknown, row: Record<string, unknown>) => string;
}

export function useSpesaColumns(): SpesaColumn[] {
  return [
    {
      key: 'name',
      label: 'Nome',
      align: 'left',
    },
    {
      key: 'createdAt',
      label: 'Data',
      align: 'left',
      render: (value) => format(new Date(value as string), 'd MMM', { locale: it }),
    },
    {
      key: 'price',
      label: 'Prezzo',
      align: 'right',
      render: (value) => formatPrice(value as number),
    },
  ];
}
