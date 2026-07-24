import type { ColumnDefinition as Column } from '@/common/components/table/DataTable';
import type { CustomerModel as Customer } from '@/modules/customer/model/customer.model';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Icon from '@/common/components/ui/Icon';
import { useMemo } from 'react';
import { alpha, useTheme } from '@mui/material';
import { Box } from '@mui/material';

export function useCustomerColumns(): Column<Customer>[] {
  const theme = useTheme();

  return useMemo<Column<Customer>[]>(
    () => [
      {
        key: 'cliente',
        label: 'Cliente',
        minWidth: 180,
        flex: 1.35,
        render: (customer) => (
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontWeight: 600, lineHeight: 1.25, color: theme.palette.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {customer.firstName} {customer.lastName}
            </Box>
            {customer.notes && (
              <Box
                sx={{
                  fontSize: '0.75rem',
                  color: theme.palette.text.secondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '260px',
                  mt: 0.5,
                  whiteSpace: 'nowrap',
                }}
              >
                {customer.notes}
              </Box>
            )}
          </Box>
        ),
      },
      {
        key: 'phone',
        label: 'Telefono',
        minWidth: 150,
        flex: 1,
        render: (customer) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '0.875rem',
              color: theme.palette.text.secondary,
            }}
          >
            <Icon name="phone" size={13} color={theme.palette.primary.main} />
            <Box component="span" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              {customer.phone}
            </Box>
          </Box>
        ),
      },
      {
        key: 'email',
        label: 'Email',
        minWidth: 200,
        flex: 1.45,
        render: (customer) =>
          customer.email ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '0.875rem',
                color: theme.palette.text.secondary,
              }}
            >
              <Icon name="mail" size={13} color={theme.palette.primary.main} />
              <Box
                component="span"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px', whiteSpace: 'nowrap' }}
              >
                {customer.email}
              </Box>
            </Box>
          ) : (
            <Box component="span" sx={{ fontSize: '0.875rem', color: alpha(theme.palette.error.main, 0.4) }}>
              —
            </Box>
          ),
      },
      {
        key: 'createdAt',
        label: 'Iscritto il',
        minWidth: 130,
        flex: 0.9,
        render: (customer) => (
          <Box
            component="span"
            sx={{
              fontSize: '0.875rem',
              color: theme.palette.text.secondary,
              fontVariant: 'tabular-nums',
            }}
          >
            {customer.createdAt
              ? format(new Date(customer.createdAt), 'dd MMM yyyy', { locale: it })
              : '—'}
          </Box>
        ),
      },
      {
        key: 'bookings',
        label: 'Prenotazioni',
        align: 'center',
        minWidth: 120,
        flex: 0.8,
        render: (customer) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                height: '28px',
                px: 2.5,
                borderRadius: '9999px',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: '0.75rem',
                fontVariant: 'tabular-nums',
              }}
            >
              {customer.totalBookings || 0}
            </Box>
          </Box>
        ),
      },
    ],
    [theme]
  );
}

export function useCustomerExportColumns() {
  return useMemo(
    () => [
      { label: 'Nome', value: (customer: Customer) => `${customer.firstName} ${customer.lastName}` },
      { label: 'Telefono', value: (customer: Customer) => customer.phone },
      { label: 'Email', value: (customer: Customer) => customer.email || '' },
      { label: 'Note', value: (customer: Customer) => customer.notes || '' },
      {
        label: 'Creato il',
        value: (customer: Customer) =>
          format(new Date(customer.createdAt), 'dd/MM/yyyy', { locale: it }),
      },
      { label: 'Appuntamenti', value: (customer: Customer) => customer.totalBookings || 0 },
    ],
    []
  );
}
