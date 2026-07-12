"use client";

import Box from '@mui/material/Box';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Icon from '@/common/components/ui/Icon';

import PageHeader from '@/common/components/common/PageHeader';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import { useDeleteConfirm } from '@/common/hooks/useDeleteConfirm';
import { spesaLiberaApi } from '../api/spesa-libera.api';
import SpesaDataTable from '../components/SpesaDataTable';
import SpesaFilters from '../components/SpesaFilters';
import SpesaForm from '../components/SpesaForm';
import { useSpesaFilters } from '../hooks/useSpesaFilters';
import { useSpeseLibere } from '../hooks/useTransactions';

export default function SpesePage() {
  const { currentDate, setCurrentDate } = useSpesaFilters();
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const monthStr = format(currentDate, 'yyyy-MM');
  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: it });

  const { data: allSpese, isLoading, mutate } = useSpeseLibere(monthStr);

  const spese = allSpese?.filter((s) => s.createdAt.startsWith(monthStr)) ?? [];
  const total = spese.reduce((acc, s) => acc + s.price, 0);

  const handleDelete = async (id: number) => {
    await deleteItem({
      confirmMessage: 'Eliminare questa spesa?',
      action: async () => {
        await spesaLiberaApi.delete(id);
        await mutate();
      },
      successMessage: 'Spesa eliminata',
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 1.5,
        pr: 2,
        pl: 2,
      }}
    >
      <PageHeader
        title="Spese Libere"
        subtitle="Annotazioni rapide di spesa"
        icon={<Icon name="wallet" size={24} />}
        filters={<SpesaFilters currentDate={currentDate} onDateChange={setCurrentDate} />}
      />

      <SpesaForm monthStr={monthStr} onSuccess={mutate} />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <SpesaDataTable
          spese={spese}
          isLoading={isLoading}
          monthLabel={monthLabel}
          total={total}
          onDelete={handleDelete}
        />
      </Box>
      <ConfirmDialog {...confirmDialogProps} />
    </Box>
  );
}
