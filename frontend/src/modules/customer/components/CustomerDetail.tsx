"use client";

import { Skeleton } from '@/common/components/feedback/Skeleton';
import StatePanel from '@/common/components/feedback/StatePanel';
import Badge from '@/common/components/ui/Badge';
import Button, { CancelButton, DeleteButton } from '@/common/components/ui/Button';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import { BOOKING_STATUS_CONFIG, getBookingStatusBadgeVariant } from '@/common/config/status-config';
import { useAuth } from '@/common/context/AuthContext';
import { useDeleteConfirm } from '@/common/hooks/useDeleteConfirm';
import { customerApi as customerService } from '@/modules/customer/api/customer.api';
import CustomerModal from '@/modules/customer/components/modals/CustomerModal';
import { useCustomer, useCustomerSummary } from '@/modules/customer/hooks/useCustomer';
import type { CustomerModel as Customer, WhatsAppLog } from '@/modules/customer/model/customer.model';
import type { Booking } from '@/modules/booking/model/booking.types';
import {
  Alert,
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Paper from '@/common/components/ui/Paper';
import { formatDate } from '@/common/shared/utils/format';
import Icon from '@/common/components/ui/Icon';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  id: number;
  embedded?: boolean;
  onClose?: () => void;
}

export default function CustomerDetail({ id, embedded = false, onClose }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const {
    data: customer,
    isLoading: isLoadingCustomer,
    error: customerError,
    mutate: mutateCustomer,
  } = useCustomer(id);

  const { data: summary, isLoading: isLoadingSummary } = useCustomerSummary(id);

  const bookings = customer?.bookings || [];
  const whatsappLogs = customer?.whatsappLogs || [];

  const upcomingBookings = bookings.filter(
    (b: Booking) => b.status !== 'ANNULLATO' && new Date(b.date) >= new Date()
  );
  const pastBookings = bookings.filter(
    (b: Booking) => b.status === 'COMPLETATO' || new Date(b.date) < new Date()
  );

  const handleDelete = async () => {
    if (!isAdmin) return;
    await deleteItem({
      confirmMessage: 'Sei sicuro di voler eliminare questo cliente?',
      action: () => customerService.delete(id),
      successMessage: 'Cliente eliminato',
      errorMessage: "Errore durante l'eliminazione",
      onSuccess: () => (embedded ? onClose?.() : router.push('/clienti')),
    });
  };

  const handleEdit = () => {
    if (!customer) return;
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    mutateCustomer();
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  if (customerError) {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <StatePanel
          variant="error"
          title="Cliente non trovato"
          description="Il cliente potrebbe essere stato eliminato o non esiste."
action={
              <CancelButton
                onClick={() => (embedded ? onClose?.() : router.push('/clienti'))}
                sx={{ mt: 2 }}
              >
                {embedded ? 'Chiudi' : 'Torna alla lista'}
              </CancelButton>
            }
        />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!embedded && (
            <CancelButton
              variant="ghost"
              size="sm"
              onClick={() => router.push('/clienti')}
              icon={<Icon name="arrowLeft" size={20} />}
              sx={{ p: 1 }}
            />
          )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {isLoadingCustomer ? (
              <Skeleton variant="text" sx={{ width: 'auto', maxWidth: '192px' }} />
            ) : (
              `${customer?.firstName} ${customer?.lastName}`
            )}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Scheda cliente
          </Typography>
        </Box>
{isAdmin && (
            <>
              <Button variant="secondary" icon={(props: any) => <Icon name="edit" {...props} />} onClick={handleEdit}>
                Modifica
              </Button>
              <DeleteButton onClick={handleDelete}>
                Elimina
              </DeleteButton>
            </>
          )}
      </Box>

      {isLoadingCustomer ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' },
            gap: 3,
          }}
        >
          <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 4' } }}>
            <Paper
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.common.white, 0.04),
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Skeleton variant="text" sx={{ width: '75%', height: '24px' }} />
              <Skeleton variant="text" sx={{ width: '50%', height: '16px' }} />
              <Skeleton variant="text" sx={{ width: '100%', height: '16px' }} />
              <Skeleton variant="text" sx={{ width: '66%', height: '16px' }} />
            </Paper>
          </Box>
          <Box
            sx={{
              gridColumn: { xs: 'span 12', lg: 'span 8' },
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Skeleton variant="text" sx={{ width: '75%', height: '24px' }} />
            <Skeleton variant="text" sx={{ width: '50%', height: '16px' }} />
          </Box>
        </Box>
      ) : customer ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' },
            gap: 3,
          }}
        >
          {/* Sidebar: Info Cliente */}
          <Box
            sx={{
              gridColumn: { xs: 'span 12', lg: 'span 4' },
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Paper
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.common.white, 0.04),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Icon name="user" size={18} color={theme.palette.primary.main} />
                Dati Anagrafici
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.875rem' }}
                >
                  <Icon name="phone" size={16} color={theme.palette.primary.main} />
                  <Link
                    href={`tel:${customer.phone}`}
                    sx={{
                      color: 'text.primary',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {customer.phone}
                  </Link>
                </Box>
                {customer.email && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: '0.875rem',
                    }}
                  >
                    <Icon name="mail" size={16} color={theme.palette.primary.main} />
                    <Link
                      href={`mailto:${customer.email}`}
                      sx={{
                        color: 'text.primary',
                        textDecoration: 'none',
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      {customer.email}
                    </Link>
                  </Box>
                )}
                {customer.birthDate && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: '0.875rem',
                      color: 'text.primary',
                    }}
                  >
                    <Icon name="calendar" size={16} color={theme.palette.primary.main} />
                    Nato il {formatDate(customer.birthDate, 'dd MMMM yyyy')}
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    fontSize: '0.875rem',
                    color: theme.palette.text.secondary,
                  }}
                >
                  <Icon name="calendar" size={16} />
                  Cliente dal{' '}
                  {formatDate(customer.createdAt, 'dd MMM yyyy')}
                </Box>
              </Box>

              {customer.notes && (
                <Alert
                  severity="warning"
                  sx={{
                    mt: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Icon name="alertTriangle" size={16} />
                    <Box>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          mb: 0.5,
                          color: theme.palette.warning.main,
                        }}
                      >
                        Note
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
                        {customer.notes}
                      </Typography>
                    </Box>
                  </Box>
                </Alert>
              )}
            </Paper>

            {summary && !isLoadingSummary && (
              <Paper
                sx={{
                  p: 3,
                  bgcolor: alpha(theme.palette.common.white, 0.04),
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Icon name="trendingUp" size={18} color={theme.palette.primary.main} />
                  Riepilogo
                </Typography>
                <Box
                  sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, mb: 2 }}
                >
                  <Box sx={{ gridColumn: 'span 3' }}>
                    <Box
                      sx={{
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                        borderRadius: 1,
                        p: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: theme.palette.success.main,
                        }}
                      >
                        €{summary.totalSpent.toFixed(0)}
                      </Typography>
                      <Typography
                        sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.5 }}
                      >
                        Totale Speso
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ gridColumn: 'span 3' }}>
                    <Box
                      sx={{
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                        borderRadius: 1,
                        p: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: theme.palette.info.main,
                        }}
                      >
                        {summary.totalBookings}
                      </Typography>
                      <Typography
                        sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.5 }}
                      >
                        Appuntamenti
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ gridColumn: 'span 3' }}>
                    <Box
                      sx={{
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                        borderRadius: 1,
                        p: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: theme.palette.warning.main,
                        }}
                      >
                        {summary.upcomingBookingsCount}
                      </Typography>
                      <Typography
                        sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.5 }}
                      >
                        Futuri
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {summary.lastBooking && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography
                      sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mb: 0.5 }}
                    >
                      Ultimo servizio
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
                      Appuntamento — {summary.lastBooking.artistName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                      {formatDate(summary.lastBooking.date, 'dd MMM yyyy')}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Box>

          {/* Main Content */}
          <Box
            sx={{
              gridColumn: { xs: 'span 12', lg: 'span 8' },
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {/* Prossimi Appuntamenti */}
            <Paper
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.common.white, 0.04),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Icon name="calendar" size={18} color={theme.palette.primary.main} />
                  Prossimi Appuntamenti
                </Typography>
                {upcomingBookings.length > 0 && (
                  <Box
                    sx={{
                      fontSize: '0.75rem',
                      bgcolor: theme.palette.info.light,
                      color: theme.palette.info.dark,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '12px',
                    }}
                  >
                    {upcomingBookings.length}
                  </Box>
                )}
              </Box>
              {upcomingBookings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: theme.palette.text.secondary }}>
                  <Icon name="calendar" size={32} />
                  <Typography variant="body2">Nessun appuntamento futuro</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {upcomingBookings.map((booking: Booking) => (
                    <Box
                      key={booking.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                        borderRadius: 1,
                        '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.08) },
                        transition: 'colors 0.2s',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: '4px',
                            height: '40px',
                            borderRadius: '4px',
                            backgroundColor: booking.artist?.color || theme.palette.text.secondary,
                          }}
                        />
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: theme.palette.text.primary }}
                          >
                            Appuntamento
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {booking.artist?.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          {formatDate(booking.date, 'dd MMM')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {formatDate(booking.date, 'HH:mm')}
                        </Typography>
                        <Box>
                          <Badge
                            variant={getBookingStatusBadgeVariant(booking.status)}
                            size="xs"
                          >
                            {BOOKING_STATUS_CONFIG[booking.status]?.label ?? booking.status}
                          </Badge>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>

            {/* Storico Appuntamenti */}
            <Paper
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.common.white, 0.04),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Icon name="clock" size={18} color={theme.palette.text.secondary} />
                Storico Appuntamenti
              </Typography>
              {pastBookings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: theme.palette.text.secondary }}>
                  <Icon name="clock" size={32} />
                  <Typography variant="body2">Nessun appuntamento passato</Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {['Data', 'Artista', 'Prezzo', 'Stato'].map((h, i) => (
                          <TableCell
                            key={h}
                            align={i >= 2 ? 'right' : 'left'}
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderColor: 'divider',
                              pb: 1,
                            }}
                          >
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pastBookings.map((booking: Booking) => (
                        <TableRow key={booking.id} sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell
                            sx={{
                              color: 'text.primary',
                              fontSize: '0.875rem',
                              borderColor: 'divider',
                              py: 1,
                            }}
                          >
                            {formatDate(booking.date, 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.875rem',
                              borderColor: 'divider',
                              py: 1,
                            }}
                          >
                            {booking.artist?.name}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: 'text.primary',
                              fontSize: '0.875rem',
                              borderColor: 'divider',
                              py: 1,
                            }}
                          >
                            {booking.price ? `€${booking.price.toFixed(0)}` : '—'}
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: 'divider', py: 1 }}>
                            <Badge variant={getBookingStatusBadgeVariant(booking.status)} size="xs">
                              {BOOKING_STATUS_CONFIG[booking.status]?.label ?? booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>

            {/* Ultimi WhatsApp */}
            {whatsappLogs.length > 0 && (
              <Paper
                sx={{
                  p: 3,
                  bgcolor: alpha(theme.palette.common.white, 0.04),
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Icon name="messageCircle" size={18} color={theme.palette.success.main} />
                  Ultimi WhatsApp
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {whatsappLogs.map((log: WhatsAppLog) => (
                    <Box
                      key={log.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        p: 1.5,
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: theme.palette.text.primary }}
                          >
                            {log.templateName || 'Messaggio personalizzato'}
                          </Typography>
                          <Box
                            sx={{
                              fontSize: '0.75rem',
                              px: 1,
                              py: 0.25,
                              borderRadius: '12px',
                              bgcolor:
                                log.status !== 'FAILED'
                                  ? alpha(theme.palette.success.main, 0.2)
                                  : alpha(theme.palette.error.main, 0.2),
                              color:
                                log.status !== 'FAILED'
                                  ? theme.palette.success.light
                                  : theme.palette.error.light,
                            }}
                          >
                            {log.status !== 'FAILED' ? 'Inviato' : 'Fallito'}
                          </Box>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            mt: 0.5,
                            display: 'block',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {log.message}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary, ml: 2, flexShrink: 0 }}
                      >
                        {formatDate(log.createdAt, 'dd MMM')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        </Box>
      ) : (
        <StatePanel
          variant="empty"
          title="Nessun dato disponibile"
          description="Impossibile recuperare le informazioni del cliente."
        />
      )}

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSuccess={handleModalSuccess}
        customer={editingCustomer}
      />
      <ConfirmDialog {...confirmDialogProps} />
    </Box>
  );
}
