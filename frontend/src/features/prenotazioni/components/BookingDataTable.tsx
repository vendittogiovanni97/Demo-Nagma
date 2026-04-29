"use client";

import { Stack, Box, CircularProgress } from '@mui/material';
import { CheckCircle2, Edit, Trash2, MessageCircle, RotateCcw } from 'lucide-react';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import DataTable from '@/components/data-display/DataTable';
import StatePanel from '@/components/feedback/StatePanel';
import PermissionGate from '@/components/auth/PermissionGate';
import WhatsAppSendModal from '@/components/modals/WhatsAppSendModal';
import Button from '@/components/ui/Button';
import BookingCard from './BookingCard';
import type { Column } from '@/components/data-display/DataTable';
import type { Booking } from '@/types/booking';

interface BookingDataTableProps {
  columns: Column<Booking>[];
  data: Booking[];
  isLoading: boolean;
  hasError: boolean;
  debouncedSearch: string;
  onComplete: (id: number) => void;
  onRestore: (id: number) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
}

export default function BookingDataTable({
  columns,
  data,
  isLoading,
  hasError,
  debouncedSearch,
  onComplete,
  onRestore,
  onEdit,
  onDelete,
}: BookingDataTableProps) {
  const theme = useMuiTheme();
  const { isSmall } = useTheme();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedBookingForWhatsApp, setSelectedBookingForWhatsApp] = useState<Booking | null>(null);

  const handleOpenWhatsAppModal = (booking: Booking) => {
    setSelectedBookingForWhatsApp(booking);
    setIsWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = () => {
    setIsWhatsAppModalOpen(false);
    setSelectedBookingForWhatsApp(null);
  };

  const handleWhatsAppSuccess = () => {
    handleCloseWhatsAppModal();
  };

  const getRowStyle = (booking: Booking) => {
    if (booking.status === 'COMPLETED') {
      return {
        backgroundColor: `${theme.palette.success.main}08`,
      };
    }
    if (booking.status === 'CANCELLED') {
      return {
        backgroundColor: `${theme.palette.error.main}08`,
      };
    }
    return undefined;
  };

  if (hasError) {
    return (
      <StatePanel
        variant="error"
        fullPage
        title="Impossibile caricare le prenotazioni"
        description="Riprova tra qualche secondo o aggiorna la pagina."
      />
    );
  }

  // Mobile Layout: Card view for small screens
  if (isSmall) {
    return (
      <>
        <Stack spacing={2}>
          {/* Loading State */}
          {isLoading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 6,
              }}
            >
              <CircularProgress size={40} sx={{ color: theme.palette.primary.main }} />
            </Box>
          )}

          {/* Empty State */}
          {!isLoading && data.length === 0 && (
            <StatePanel
              variant="info"
              title={debouncedSearch ? 'Nessun risultato' : 'Nessuna prenotazione'}
              description={
                debouncedSearch
                  ? 'Prova a modificare i termini di ricerca.'
                  : 'Nessuna prenotazione per questo mese.'
              }
            />
          )}

          {/* Cards List */}
          {!isLoading &&
            data.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onEdit={onEdit}
                onDelete={onDelete}
                onComplete={onComplete}
                onRestore={onRestore}
                onWhatsApp={() => handleOpenWhatsAppModal(booking)}
              />
            ))}
        </Stack>
        <WhatsAppSendModal
          isOpen={isWhatsAppModalOpen}
          onClose={handleCloseWhatsAppModal}
          onSuccess={handleWhatsAppSuccess}
          booking={selectedBookingForWhatsApp}
        />
      </>
    );
  }

  // Desktop Layout: DataTable view for larger screens
  return (
    <>
      <DataTable<Booking>
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage={
          debouncedSearch
            ? 'Nessun risultato. Prova a modificare i termini di ricerca.'
            : 'Nessuna prenotazione per questo mese.'
        }
        keyExtractor={(booking) => booking.id}
        pageSize={8}
        getRowStyle={getRowStyle}
        actions={(booking) => (
          <Stack direction="row" useFlexGap sx={{ gap: 0.5, justifyContent: 'center', width: '100%' }}>
            <PermissionGate requireAdmin>
              <>
                {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                  <Button
                    variant="icon"
                    icon={<CheckCircle2 size={18} />}
                    title="Completato"
                    sx={{
                      color: `${theme.palette.success.main}99`,
                      '&:hover': {
                        color: theme.palette.success.main,
                        backgroundColor: `${theme.palette.success.main}10`,
                      },
                    }}
                    onClick={() => onComplete(booking.id)}
                  />
                )}
                {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                  <>
                    <Button
                      variant="icon"
                      icon={<MessageCircle size={18} />}
                      title="WhatsApp"
                      sx={{
                        color: `#25D36699`,
                        '&:hover': {
                          color: '#25D366',
                          backgroundColor: '#25D36610',
                        },
                      }}
                      onClick={() => handleOpenWhatsAppModal(booking)}
                    />
                    <Button
                      variant="icon"
                      icon={<Edit size={18} />}
                      title="Modifica"
                      onClick={() => onEdit(booking)}
                    />
                    <Button
                      variant="icon"
                      icon={<Trash2 size={18} />}
                      sx={{
                        color: `${theme.palette.error.main}99`,
                        '&:hover': {
                          color: theme.palette.error.main,
                          backgroundColor: `${theme.palette.error.main}10`,
                        },
                      }}
                      title="Elimina"
                      onClick={() => onDelete(booking.id)}
                    />
                  </>
                )}
                {booking.status === 'CANCELLED' && (
                  <Button
                    variant="icon"
                    icon={<RotateCcw size={18} />}
                    title="Ripristina"
                    sx={{
                      color: `${theme.palette.warning.main}99`,
                      '&:hover': {
                        color: theme.palette.warning.main,
                        backgroundColor: `${theme.palette.warning.main}10`,
                      },
                    }}
                    onClick={() => onRestore(booking.id)}
                  />
                )}
              </>
            </PermissionGate>
          </Stack>
        )}
      />
      <WhatsAppSendModal
        isOpen={isWhatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        onSuccess={handleWhatsAppSuccess}
        booking={selectedBookingForWhatsApp}
      />
    </>
  );
}
