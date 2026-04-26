"use client";

import { Stack } from '@mui/material';
import { CheckCircle2, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import DataTable from '@/components/data-display/DataTable';
import StatePanel from '@/components/feedback/StatePanel';
import PermissionGate from '@/components/auth/PermissionGate';
import Button from '@/components/ui/Button';
import type { Column } from '@/components/data-display/DataTable';
import type { Booking } from '@/types/booking';

interface BookingDataTableProps {
  columns: Column<Booking>[];
  data: Booking[];
  isLoading: boolean;
  hasError: boolean;
  debouncedSearch: string;
  onComplete: (id: number) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
}

export default function BookingDataTable({
  columns,
  data,
  isLoading,
  hasError,
  debouncedSearch,
  onComplete,
  onEdit,
  onDelete,
}: BookingDataTableProps) {
  const theme = useTheme();

  if (hasError) {
    return (
      <StatePanel
        variant="error"
        fullPage
        title="Impossibile caricare le prenotazioni"
        description="Riprova tra qualche secondo o aggiorna la pagina."
      />
    );
  }

  return (
    <DataTable<Booking>
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage={
        debouncedSearch
          ? 'Nessun risultato. Prova a modificare i termini di ricerca.'
          : 'Nessuna prenotazione per questo mese.'
      }
      keyExtractor={(booking) => booking.id}
      pageSize={8}
      actions={(booking) => (
        <Stack direction="row" useFlexGap sx={{ gap: 0.5, justifyContent: 'center', width: '100%' }}>
          <PermissionGate requireAdmin>
            <>
              {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                <Button
                  variant="icon"
                  icon={<CheckCircle2 size={18} />}
                  title="Completato"
                  sx={{
                    color: `${theme.palette.success.main}99`,
                    '&:hover': {
                      color: theme.palette.success.main,
                      backgroundColor: `${theme.palette.success.main}10`,
                    },
                  }}
                  onClick={() => onComplete(booking.id)}
                />
              )}
              <Button
                variant="icon"
                icon={<Edit size={18} />}
                title="Modifica"
                onClick={() => onEdit(booking)}
              />
              <Button
                variant="icon"
                icon={<Trash2 size={18} />}
                sx={{
                  color: `${theme.palette.error.main}99`,
                  '&:hover': {
                    color: theme.palette.error.main,
                    backgroundColor: `${theme.palette.error.main}10`,
                  },
                }}
                title="Elimina"
                onClick={() => onDelete(booking.id)}
              />
            </>
          </PermissionGate>
        </Stack>
      )}
    />
  );
}
