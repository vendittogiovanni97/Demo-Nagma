'use client';

import PermissionGate from '@/components/auth/PermissionGate';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Customer } from '@/types/customer';
import { Avatar, Box, Stack, Typography, useTheme } from '@mui/material';
import { Edit, Eye, MessageCircle, Trash2 } from 'lucide-react';
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
  const bookingCount = customer._count?.bookings ?? customer.bookings?.length ?? 0;

  // Generate initials for avatar
  const getInitials = () => {
    return `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card variant="glass" size="md">
      <Stack spacing={2}>
        {/* Header: Avatar + Name */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: theme.palette.primary.main,
              color: '#000',
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            {getInitials()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
        </Stack>

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
            icon={<Eye size={16} />}
            fullWidth
            onClick={() => router.push(`/clienti/${customer.id}`)}
          >
            Dettagli
          </Button>

          <PermissionGate requireAdmin>
            <Button
              variant="secondary"
              size="sm"
              icon={<MessageCircle size={16} />}
              fullWidth
              onClick={() =>
                router.push(
                  `/whatsapp?customerId=${customer.id}&customerName=${encodeURIComponent(`${customer.firstName} ${customer.lastName}`)}&customerPhone=${encodeURIComponent(customer.phone)}`
                )
              }
            >
              WhatsApp
            </Button>
          </PermissionGate>

          <PermissionGate requireAdmin>
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit size={16} />}
              fullWidth
              onClick={() => onEdit(customer)}
            >
              Modifica
            </Button>
          </PermissionGate>

          <PermissionGate requireAdmin>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={16} />}
              fullWidth
              onClick={() => onDelete(customer.id)}
            >
              Elimina
            </Button>
          </PermissionGate>
        </Box>
      </Stack>
    </Card>
  );
}
