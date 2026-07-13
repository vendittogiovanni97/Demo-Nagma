"use client";

import PermissionGate from '@/common/components/auth/PermissionGate';
import DataTable, { type Column } from '@/common/components/data-display/DataTable';
import PaginationControls from '@/common/components/feedback/PaginationControls';
import Button from '@/common/components/ui/Button';
import type { CustomerModel as Customer } from '@/modules/customer/model/customer.model';
import { Box, useTheme as useMuiTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Icon from '@/common/components/ui/Icon';
import { useRouter } from 'next/navigation';
import CustomerCard from './CustomerCard';

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
      <DataTable<Customer>
        columns={columns}
        data={customers}
        isLoading={isLoading}
        pageSize={9}
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
              icon={<Icon name="eye" size={18} />}
              title="Dettagli"
              onClick={() => router.push(`/clienti/${customer.id}`)}
            />
            <PermissionGate requireAdmin>
              <>
                <Button
                  variant="icon"
                  icon={<Icon name="edit" size={18} />}
                  title="Modifica"
                  onClick={() => onEdit(customer)}
                />
                <Button
                  variant="icon"
                  icon={<Icon name="trash2" size={18} />}
                  sx={{
                    color: alpha(theme.palette.error.main, 0.6),
                    '&:hover': {
                      color: theme.palette.error.main,
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
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
            bgcolor: alpha(theme.palette.common.white, 0.02),
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
