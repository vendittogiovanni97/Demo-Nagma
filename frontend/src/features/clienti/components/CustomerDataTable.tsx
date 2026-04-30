"use client";

import SmartTable from '@/components/common/SmartTable';
import PermissionGate from '@/components/auth/PermissionGate';
import PaginationControls from '@/components/feedback/PaginationControls';
import Button from '@/components/ui/Button';
import type { Customer } from '@/types/customer';
import { Box, useTheme as useMuiTheme } from '@mui/material';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CustomerCard from './CustomerCard';
import type { Column } from '@/components/data-display/DataTable';

interface Props {
  customers: Customer[];
  columns: Column<Customer>[];
  isLoading: boolean;
  debouncedSearch: string;
  page: number;
  totalPages: number;
  total: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
}

export default function CustomerDataTable({
  customers,
  columns,
  isLoading,
  debouncedSearch,
  page,
  totalPages,
  total,
  onPrevPage,
  onNextPage,
  onEdit,
  onDelete,
}: Props) {
  const theme = useMuiTheme();
  const router = useRouter();

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SmartTable<Customer>
        columns={columns}
        data={customers}
        isLoading={isLoading}
        keyExtractor={(c) => c.id}
        emptyTitle={debouncedSearch ? 'Nessun risultato trovato' : 'Nessun cliente presente'}
        emptyDescription={
          debouncedSearch
            ? 'Prova a modificare i termini di ricerca.'
            : 'Clicca "Nuovo Cliente" per aggiungere il primo contatto.'
        }
        renderCard={(customer) => (
          <CustomerCard
            customer={customer}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
        actions={(customer) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Button
              variant="icon"
              icon={<Eye size={18} />}
              title="Dettagli"
              onClick={() => router.push(`/clienti/${customer.id}`)}
            />
            <PermissionGate requireAdmin>
              <>
                <Button
                  variant="icon"
                  icon={<Edit size={18} />}
                  title="Modifica"
                  onClick={() => onEdit(customer)}
                />
                <Button
                  variant="icon"
                  icon={<Trash2 size={18} />}
                  sx={{
                    color: 'rgba(244,67,54,0.6)',
                    '&:hover': {
                      color: theme.palette.error.main,
                      backgroundColor: 'rgba(244,67,54,0.1)',
                    },
                  }}
                  title="Elimina"
                  onClick={() => onDelete(customer.id)}
                />
              </>
            </PermissionGate>
          </Box>
        )}
      />

      {totalPages > 1 && (
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: 'rgba(255,255,255,0.02)',
            mt: 'auto'
          }}
        >
          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={total}
            onPrev={onPrevPage}
            onNext={onNextPage}
            label="clienti"
          />
        </Box>
      )}
    </Box>
  );
}
