"use client";

import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Mail,
  MessageCircle,
  Phone,
  TrendingUp,
  User
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';

import { ENDPOINTS } from '@/api/endpoints';
import { Skeleton } from '@/components/feedback/Skeleton';
import StatePanel from '@/components/feedback/StatePanel';
import CustomerModal from '@/components/modals/CustomerModal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { BOOKING_STATUS_CONFIG, getBookingStatusBadgeVariant } from '@/config/status-config';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { customerService } from '@/services/customer.service';
import type { Customer, CustomerSummary, WhatsAppLog } from '@/types/customer';
import { Box, Paper, Typography, useTheme, Alert, Link, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

export default function CustomerDetailPage() {
  const toast = useToast();
  const theme = useTheme();
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const idStr = params.id as string;
  const id = Number(idStr);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data: customer, isLoading: isLoadingCustomer, error: customerError, mutate: mutateCustomer } = useSWR<Customer>(
    !isNaN(id) ? ENDPOINTS.CUSTOMERS.BY_ID(id) : null,
    () => customerService.getById(id)
  );

  const { data: summary, isLoading: isLoadingSummary } = useSWR<CustomerSummary>(
    !isNaN(id) ? ENDPOINTS.CUSTOMERS.SUMMARY(id) : null,
    () => customerService.getSummary(id)
  );

  const bookings = customer?.bookings || [];
  const whatsappLogs = customer?.whatsappLogs || [];

  const upcomingBookings = bookings.filter(
    (b) => b.status !== 'CANCELLED' && new Date(b.date) >= new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'COMPLETED' || new Date(b.date) < new Date()
  );

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (confirm('Sei sicuro di voler eliminare questo cliente?')) {
      try {
        await customerService.delete(id);
        toast.success('Cliente eliminato');
        router.push('/clienti');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Errore durante l\'eliminazione';
        toast.error(errorMessage);
      }
    }
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
            <Button
              variant="primary"
              onClick={() => router.push('/clienti')}
              sx={{ mt: 2 }}
            >
              Torna alla lista
            </Button>
          }
        />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/clienti')}
          icon={<ArrowLeft size={20} />}
          sx={{ p: 1 }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {isLoadingCustomer ? <Skeleton variant="text" sx={{ width: 'auto', maxWidth: '192px' }} /> : `${customer?.firstName} ${customer?.lastName}`}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Scheda cliente</Typography>
        </Box>
        {isAdmin ? (
          <>
            <Button
              variant="secondary"
              icon={<Edit />}
              onClick={handleEdit}
            >
              Modifica
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
            >
              Elimina
            </Button>
          </>
        ) : null}
      </Box>

      {isLoadingCustomer ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' }, gap: 3 }}>
          <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 4' } }}>
            <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Skeleton variant="text" sx={{ width: '75%', height: '24px' }} />
              <Skeleton variant="text" sx={{ width: '50%', height: '16px' }} />
              <Skeleton variant="text" sx={{ width: '100%', height: '16px' }} />
              <Skeleton variant="text" sx={{ width: '66%', height: '16px' }} />
            </Paper>
          </Box>
<Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 8' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Skeleton variant="text" sx={{ width: '75%', height: '24px' }} />
            <Skeleton variant="text" sx={{ width: '50%', height: '16px' }} />
          </Box>
        </Box>
      ) : customer ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' }, gap: 3 }}>
          {/* Sidebar: Info Cliente */}
          <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 4' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Dati Anagrafici */}
            <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <User size={18} style={{ color: theme.palette.primary.main }} />
                Dati Anagrafici
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.875rem' }}>
                  <Phone size={16} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
                  <Link href={`tel:${customer.phone}`} sx={{ color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                    {customer.phone}
                  </Link>
                </Box>
                {customer.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.875rem' }}>
                    <Mail size={16} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
                    <Link href={`mailto:${customer.email}`} sx={{ color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                      {customer.email}
                    </Link>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                  <Calendar size={16} style={{ flexShrink: 0 }} />
                  Cliente dal {format(new Date(customer.createdAt), 'dd MMM yyyy', { locale: it })}
                </Box>
              </Box>

              {customer.notes && (
                <Alert severity="warning" sx={{ mt: 2, bgcolor: 'rgba(255, 152, 0, 0.08)', border: `1px solid rgba(255, 152, 0, 0.2)` }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '4px' }} />
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5, color: theme.palette.warning.main }}>Note</Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>{customer.notes}</Typography>
                    </Box>
                  </Box>
                </Alert>
              )}
            </Paper>

            {/* Riepilogo */}
            {summary && !isLoadingSummary && (
              <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp size={18} style={{ color: theme.palette.primary.main }} />
                  Riepilogo
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, mb: 2 }}>
                  <Box sx={{ gridColumn: 'span 3' }}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, p: 2, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.success.main }}>€{summary.totalSpent.toFixed(0)}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.5 }}>Totale Speso</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ gridColumn: 'span 3' }}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, p: 2, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.info.main }}>{summary._count.bookings}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.5 }}>Appuntamenti</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ gridColumn: 'span 3' }}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, p: 2, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.warning.main }}>{summary.upcomingBookings}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.5 }}>Futuri</Typography>
                    </Box>
                  </Box>
                </Box>

                {summary.lastBooking && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mb: 0.5 }}>Ultimo servizio</Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
                      Appuntamento — {summary.lastBooking.artist.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                      {format(new Date(summary.lastBooking.date), 'dd MMM yyyy', { locale: it })}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Box>

          {/* Main Content */}
          <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 8' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Prossimi Appuntamenti */}
            <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calendar size={18} style={{ color: theme.palette.primary.main }} />
                  Prossimi Appuntamenti
                </Typography>
                {upcomingBookings.length > 0 && (
                  <Box sx={{ fontSize: '0.75rem', bgcolor: theme.palette.info.light, color: theme.palette.info.dark, px: 1.5, py: 0.5, borderRadius: '12px' }}>
                    {upcomingBookings.length}
                  </Box>
                )}
              </Box>
              {upcomingBookings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: theme.palette.text.secondary }}>
                  <Calendar size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                  <Typography variant="body2">Nessun appuntamento futuro</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {upcomingBookings.map((booking) => (
                    <Box
                      key={booking.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                        transition: 'colors 0.2s'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: '4px',
                            height: '40px',
                            borderRadius: '4px',
                            backgroundColor: booking.artist?.color || '#6b7280'
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Appuntamento</Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {booking.artist?.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          {format(new Date(booking.date), 'dd MMM', { locale: it })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {format(new Date(booking.date), 'HH:mm')}
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
            <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={18} style={{ color: theme.palette.text.secondary }} />
                Storico Appuntamenti
              </Typography>
              {pastBookings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: theme.palette.text.secondary }}>
                  <Clock size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                  <Typography variant="body2">Nessun appuntamento passato</Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {['Data', 'Artista', 'Prezzo', 'Stato'].map((h, i) => (
                          <TableCell key={h} align={i >= 2 ? 'right' : 'left'} sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderColor: 'divider', pb: 1 }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pastBookings.map((booking) => (
                        <TableRow key={booking.id} sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ color: 'text.primary', fontSize: '0.875rem', borderColor: 'divider', py: 1 }}>
                            {format(new Date(booking.date), 'dd MMM yyyy', { locale: it })}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem', borderColor: 'divider', py: 1 }}>
                            {booking.artist?.name}
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'text.primary', fontSize: '0.875rem', borderColor: 'divider', py: 1 }}>
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
              <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MessageCircle size={18} style={{ color: theme.palette.success.main }} />
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
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                            {log.templateName || 'Messaggio personalizzato'}
                          </Typography>
                          <Box sx={{
                            fontSize: '0.75rem',
                            px: 1,
                            py: 0.25,
                            borderRadius: '12px',
                            bgcolor: log.status === 'MANUAL_SENT' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                            color: log.status === 'MANUAL_SENT' ? theme.palette.success.light : theme.palette.error.light
                          }}>
                            {log.status === 'MANUAL_SENT' ? 'Inviato' : 'Fallito'}
                          </Box>
                        </Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {log.message}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, ml: 2, flexShrink: 0 }}>
                        {format(new Date(log.createdAt), 'dd MMM', { locale: it })}
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

      {/* Modal Modifica */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCustomer(null); }}
        onSuccess={handleModalSuccess}
        customer={editingCustomer}
      />
    </Box>
  );
}
