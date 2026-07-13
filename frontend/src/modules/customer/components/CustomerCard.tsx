'use client';

import PermissionGate from '@/common/components/auth/PermissionGate';
import Button, { DeleteButton } from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';
import type { CustomerModel as Customer } from '@/modules/customer/model/customer.model';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import Icon from '@/common/components/ui/Icon';
import { useRouter } from 'next/navigation';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
}

export default function CustomerCard({
  customer,
  onEdit,
  onDelete,
}: CustomerCardProps) {
  const theme = useTheme();
  const router = useRouter();

  // Format registration date
  const registeredDate = new Date(customer.createdAt).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Get booking count from _count or bookings array
  const bookingCount = customer.totalBookings ?? customer.bookings?.length ?? 0;

  return (
    <Card variant="glass" size="md">
      <Stack spacing={2}>
        {/* Header: Name */}
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              wordBreak: 'break-word',
            }}
          >
            {customer.firstName} {customer.lastName}
          </Typography>
        </Box>

        {/* Customer Info */}
        <Stack spacing={1.5}>
          {/* Phone */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Telefono
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 500,
                wordBreak: 'break-word',
              }}
            >
              {customer.phone}
            </Typography>
          </Box>

          {/* Email */}
          {customer.email && (
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Email
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 500,
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {customer.email}
              </Typography>
            </Box>
          )}

          {/* Registration Date */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Iscritto dal
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 500,
              }}
            >
              {registeredDate}
            </Typography>
          </Box>

          {/* Booking Count */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Prenotazioni
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {bookingCount}
            </Typography>
          </Box>
        </Stack>

        {/* Actions */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            mt: 1,
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon name="eye" size={16} />}
            fullWidth
            onClick={() => router.push(`/clienti/${customer.id}`)}
          >
            Dettagli
          </Button>

          <PermissionGate requireAdmin>
            <Button
              variant="secondary"
              size="sm"
              icon={<Icon name="edit" size={16} />}
              fullWidth
              onClick={() => onEdit(customer)}
            >
              Modifica
            </Button>
          </PermissionGate>

          <PermissionGate requireAdmin>
            <DeleteButton
              size="sm"
              icon={<Icon name="trash2" size={16} />}
              fullWidth
              onClick={() => onDelete(customer.id)}
            >
              Elimina
            </DeleteButton>
          </PermissionGate>
        </Box>
      </Stack>
    </Card>
  );
}
