import type { ExportFilter } from '@/components/modals/ExportModal';
import { DEBOUNCE_SEARCH_DELAY } from '@/config/env';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { Customer } from '@/types/customer';
import { useMemo, useState } from 'react';

export interface CustomersFilterState {
  search: string;
  startDate: string;
  endDate: string;
  page: number;
}

export interface CustomersFilterActions {
  setSearch: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setPage: (value: number | ((prev: number) => number)) => void;
  resetDates: () => void;
}

export interface UseCustomersFilterResult extends CustomersFilterState, CustomersFilterActions {
  debouncedSearch: string;
  exportFilters: ExportFilter<Customer>[];
}

export function useCustomersFilter(): UseCustomersFilterResult {
  const [search, setSearchRaw] = useState('');
  const [page, setPage] = useState(1);
  const [startDate, setStartDateRaw] = useState('');
  const [endDate, setEndDateRaw] = useState('');

  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_DELAY);

  const setSearch = (value: string) => {
    setSearchRaw(value);
    setPage(1);
  };

  const setStartDate = (value: string) => {
    setStartDateRaw(value);
    setPage(1);
  };

  const setEndDate = (value: string) => {
    setEndDateRaw(value);
    setPage(1);
  };

  const resetDates = () => {
    setStartDateRaw('');
    setEndDateRaw('');
  };

  const exportFilters: ExportFilter<Customer>[] = useMemo(
    () => [
      {
        key: 'nome',
        label: 'Nome',
        type: 'text',
        placeholder: 'Cerca per nome...',
        filterFn: (c, v) =>
          `${c.firstName ?? ''} ${c.lastName ?? ''}`.toLowerCase().includes(v.toLowerCase()),
      },
      {
        key: 'telefono',
        label: 'Telefono',
        type: 'text',
        placeholder: 'Cerca per telefono...',
        filterFn: (c, v) => c.phone?.includes(v) ?? false,
      },
      {
        key: 'appuntamenti',
        label: 'Appuntamenti',
        type: 'select',
        options: [
          { value: '', label: 'Qualsiasi' },
          { value: '0', label: 'Nessuno' },
          { value: '1+', label: '1 o più' },
        ],
        filterFn: (c, v) => {
          const count = c._count?.bookings || 0;
          if (v === '0') return count === 0;
          if (v === '1+') return count >= 1;
          return true;
        },
      },
    ],
    [debouncedSearch]
  );

  return {
    search,
    startDate,
    endDate,
    page,
    debouncedSearch,
    exportFilters,
    setSearch,
    setStartDate,
    setEndDate,
    setPage,
    resetDates,
  };
}
