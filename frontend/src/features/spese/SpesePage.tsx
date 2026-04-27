"use client";

import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { spesaLiberaService } from '@/services/spesa-libera.service';
import type { SpesaLibera } from '@/types/spesa-libera';
import Box from '@mui/material/Box';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import useSWR, { mutate } from 'swr';
import SpesaDataTable from './components/SpesaDataTable';
import SpesaFilters from './components/SpesaFilters';
import SpesaForm from './components/SpesaForm';
import { useSpesaFilters } from './hooks/useSpesaFilters';

export default function SpesePage() {
  const { currentDate, setCurrentDate } = useSpesaFilters();
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const monthStr = format(currentDate, 'yyyy-MM');
  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: it });

  const { data: allSpese, isLoading } = useSWR<SpesaLibera[]>(
    ['spese-libere', monthStr],
    () => spesaLiberaService.getAll(monthStr),
    { revalidateOnFocus: false }
  );

  const spese = allSpese?.filter((s) => s.createdAt.startsWith(monthStr)) ?? [];
  const total = spese.reduce((acc, s) => acc + s.price, 0);

  const handleDelete = async (id: number) => {
    await deleteItem({
      confirmMessage: 'Eliminare questa spesa?',
      action: async () => {
        await spesaLiberaService.delete(id);
        await mutate(['spese-libere', monthStr]);
      },
      successMessage: 'Spesa eliminata',
    });
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: 'lg',
        mx: 'auto',
        width: '100%',
        pt: 4,
        px: 2,
      }}
    >
      <SpesaFilters currentDate={currentDate} onDateChange={setCurrentDate} />
      <SpesaForm monthStr={monthStr} />
      <SpesaDataTable
        spese={spese}
        isLoading={isLoading}
        monthLabel={monthLabel}
        total={total}
        onDelete={handleDelete}
      />
      <ConfirmDialog {...confirmDialogProps} />
    </Box>
  );
}
