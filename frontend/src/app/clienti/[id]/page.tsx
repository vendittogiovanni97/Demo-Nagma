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

export default function CustomerDetailPage() {
  const toast = useToast();
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
      <div className="flex-1 flex flex-col">
        <StatePanel
          variant="error"
          title="Cliente non trovato"
          description="Il cliente potrebbe essere stato eliminato o non esiste."
          action={
            <Button
              variant="primary"
              onClick={() => router.push('/clienti')}
              className="mt-4"
            >
              Torna alla lista
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/clienti')}
          icon={<ArrowLeft size={20} />}
          className="p-2"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-outfit">
            {isLoadingCustomer ? <Skeleton variant="text" className="w-48" /> : `${customer?.firstName} ${customer?.lastName}`}
          </h1>
          <p className="text-sm text-text-secondary">Scheda cliente</p>
        </div>
        {isAdmin ? (
          <>
            <Button
              variant="secondary"
              icon={Edit}
              onClick={handleEdit}
            >
              Modifica
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Elimina
            </Button>
          </>
        ) : null}
      </div>

      {isLoadingCustomer ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 space-y-4">
              <Skeleton variant="text" className="w-3/4 h-6" />
              <Skeleton variant="text" className="w-1/2 h-4" />
              <Skeleton variant="text" className="w-full h-4" />
              <Skeleton variant="text" className="w-2/3 h-4" />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6"><Skeleton variant="text" className="w-full h-32" /></div>
            <div className="glass-panel p-6"><Skeleton variant="text" className="w-full h-32" /></div>
          </div>
        </div>
      ) : customer ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar: Info Cliente */}
          <div className="lg:col-span-1 space-y-6">
            {/* Dati Anagrafici */}
            <div className="glass-panel p-6">
              <h2 className="text-lg font-bold font-outfit mb-4 flex items-center gap-2">
                <User size={18} className="text-accent" />
                Dati Anagrafici
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-accent shrink-0" />
                  <a href={`tel:${customer.phone}`} className="text-white hover:text-accent transition">
                    {customer.phone}
                  </a>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-accent shrink-0" />
                    <a href={`mailto:${customer.email}`} className="text-white hover:text-accent transition">
                      {customer.email}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <Calendar size={16} className="shrink-0" />
                  Cliente dal {format(new Date(customer.createdAt), 'dd MMM yyyy', { locale: it })}
                </div>
              </div>

              {customer.notes && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Note</p>
                      <p className="text-sm text-white">{customer.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Riepilogo */}
            {summary && !isLoadingSummary && (
              <div className="glass-panel p-6">
                <h2 className="text-lg font-bold font-outfit mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-accent" />
                  Riepilogo
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-400">€{summary.totalSpent.toFixed(0)}</p>
                    <p className="text-xs text-text-secondary mt-1">Totale Speso</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-400">{summary._count.bookings}</p>
                    <p className="text-xs text-text-secondary mt-1">Appuntamenti</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-400">{summary.upcomingBookings}</p>
                    <p className="text-xs text-text-secondary mt-1">Futuri</p>
                  </div>
                </div>

                {summary.lastBooking && (
                  <div className="mt-4 pt-4 border-t border-surface-border">
                    <p className="text-xs text-text-secondary mb-1">Ultimo servizio</p>
                    <p className="text-sm text-white">
                      Appuntamento — {summary.lastBooking.artist.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {format(new Date(summary.lastBooking.date), 'dd MMM yyyy', { locale: it })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prossimi Appuntamenti */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-outfit flex items-center gap-2">
                  <Calendar size={18} className="text-accent" />
                  Prossimi Appuntamenti
                </h2>
                {upcomingBookings.length > 0 && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                    {upcomingBookings.length}
                  </span>
                )}
              </div>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nessun appuntamento futuro</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-1 h-10 rounded-full"
                          style={{ backgroundColor: booking.artist?.color || '#6b7280' }}
                        />
                        <div>
                          <p className="text-sm font-bold text-white">Appuntamento</p>
                          <p className="text-xs text-text-secondary">
                            {booking.artist?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">
                          {format(new Date(booking.date), 'dd MMM', { locale: it })}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {format(new Date(booking.date), 'HH:mm')}
                        </p>
                        <Badge
                          variant={getBookingStatusBadgeVariant(booking.status)}
                          size="xs"
                        >
                          {BOOKING_STATUS_CONFIG[booking.status]?.label ?? booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Storico Appuntamenti */}
            <div className="glass-panel p-6">
              <h2 className="text-lg font-bold font-outfit mb-4 flex items-center gap-2">
                <Clock size={18} className="text-text-secondary" />
                Storico Appuntamenti
              </h2>
              {pastBookings.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <Clock size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nessun appuntamento passato</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-text-secondary text-xs uppercase tracking-wider border-b border-surface-border">
                        <th className="pb-2 font-bold">Data</th>
                        <th className="pb-2 font-bold">Artista</th>
                        <th className="pb-2 font-bold text-right">Prezzo</th>
                        <th className="pb-2 font-bold text-right">Stato</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {pastBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-surface-border/50 hover:bg-white/2 transition-colors">
                          <td className="py-2 text-white">
                            {format(new Date(booking.date), 'dd MMM yyyy', { locale: it })}
                          </td>
                          <td className="py-2 text-text-secondary">
                            {booking.artist?.name}
                          </td>
                          <td className="py-2 text-right text-white">
                            {booking.price ? `€${booking.price.toFixed(0)}` : '—'}
                          </td>
                          <td className="py-2 text-right">
                            <Badge
                              variant={getBookingStatusBadgeVariant(booking.status)}
                              size="xs"
                            >
                              {BOOKING_STATUS_CONFIG[booking.status]?.label ?? booking.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Ultimi WhatsApp */}
            {whatsappLogs.length > 0 && (
              <div className="glass-panel p-6">
                <h2 className="text-lg font-bold font-outfit mb-4 flex items-center gap-2">
                  <MessageCircle size={18} className="text-emerald-400" />
                  Ultimi WhatsApp
                </h2>
                <div className="space-y-2">
                  {whatsappLogs.map((log: WhatsAppLog) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {log.templateName || 'Messaggio personalizzato'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            log.status === 'MANUAL_SENT'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {log.status === 'MANUAL_SENT' ? 'Inviato' : 'Fallito'}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                          {log.message}
                        </p>
                      </div>
                      <p className="text-xs text-text-secondary ml-3 shrink-0">
                        {format(new Date(log.createdAt), 'dd MMM', { locale: it })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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
    </div>
  );
}
