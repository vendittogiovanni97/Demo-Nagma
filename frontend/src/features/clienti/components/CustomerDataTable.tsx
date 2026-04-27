"use client";

import PermissionGate from '@/components/auth/PermissionGate';
import type { Column } from '@/components/data-display/DataTable';
import DataTable from '@/components/data-display/DataTable';
import PaginationControls from '@/components/feedback/PaginationControls';
import Button from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import type { Customer } from '@/types/customer';
import { Box, Stack, Typography, useTheme as useMuiTheme } from '@mui/material';
import { Edit, Eye, MessageCircle, Trash2 } from 'lucide-react';
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
  const { isSmall } = useTheme();

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Desktop: DataTable */}
      {!isSmall && (
        <DataTable<Customer>
          columns={columns}
          data={customers}
          isLoading={isLoading}
          emptyMessage={
            debouncedSearch
              ? 'Nessun risultato trovato. Prova a modificare i termini di ricerca.'
              : 'Nessun cliente presente. Clicca "Nuovo Cliente" per aggiungere il primo contatto.'
          }
          keyExtractor={(c) => c.id}
          actions={(customer) => (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: '100%' }}>
              <Button
                variant="icon"
                icon={<Eye size={18} />}
                title="Dettagli"
                onClick={() => router.push(`/clienti/${customer.id}`)}
              />
              <PermissionGate requireAdmin>
                <Button
                  variant="icon"
                  icon={<MessageCircle size={18} />}
                  title="WhatsApp"
                  onClick={() =>
                    router.push(
                      `/whatsapp?customerId=${customer.id}&customerName=${encodeURIComponent(`${customer.firstName} ${customer.lastName}`)}&customerPhone=${encodeURIComponent(customer.phone)}`
                    )
                  }
                />
              </PermissionGate>
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
      )}

      {/* Mobile: Card Layout */}
      {isSmall && (
        <Stack spacing={2} sx={{ p: 1 }}>
          {isLoading && (
            <Typography sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
              Caricamento...
            </Typography>
          )}
          {!isLoading && customers.length === 0 && (
            <Typography sx={{ textAlign: 'center', color: theme.palette.text.secondary, py: 4 }}>
              {debouncedSearch
                ? 'Nessun risultato trovato. Prova a modificare i termini di ricerca.'
                : 'Nessun cliente presente. Clicca "Nuovo Cliente" per aggiungere il primo contatto.'}
            </Typography>
          )}
          {!isLoading &&
            customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
        </Stack>
      )}

      {totalPages > 1 && (
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: 'rgba(255,255,255,0.02)',
            marginTop: 'auto',
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
