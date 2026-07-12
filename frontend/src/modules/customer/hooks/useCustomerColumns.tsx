import type { Column } from '@/common/components/data-display/DataTable';
import type { CustomerModel as Customer } from '@/modules/customer/model/customer.model';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Icon from '@/common/components/ui/Icon';
import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { Box } from '@mui/material';

export function useCustomerColumns(): Column<Customer>[] {
  const theme = useTheme();

  return useMemo<Column<Customer>[]>(
    () => [
      {
        key: 'cliente',
        label: 'Cliente',
        render: (customer) => (
          <Box>
            <Box sx={{ fontWeight: 600, lineHeight: 1.25, color: theme.palette.text.primary }}>
              {customer.firstName} {customer.lastName}
            </Box>
            {customer.notes && (
              <Box
                sx={{
                  fontSize: '0.75rem',
                  color: theme.palette.text.secondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '220px',
                  mt: 0.5,
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
        width: '160px',
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
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}
              >
                {customer.email}
              </Box>
            </Box>
          ) : (
            <Box component="span" sx={{ fontSize: '0.875rem', color: 'rgba(244,67,54,0.4)' }}>
              —
            </Box>
          ),
      },
      {
        key: 'createdAt',
        label: 'Iscritto il',
        width: '130px',
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
        width: '110px',
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
                backgroundColor: 'rgba(0, 191, 255, 0.1)',
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
