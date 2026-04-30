"use client";

import PermissionGate from '@/components/auth/PermissionGate';
import SmartTable from '@/components/common/SmartTable';
import type { Column } from '@/components/data-display/DataTable';
import WhatsAppSendModal from '@/components/modals/WhatsAppSendModal';
import Button from '@/components/ui/Button';
import type { Booking } from '@/types/booking';
import { Box } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { CheckCircle2, Edit, MessageCircle, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import BookingCard from './BookingCard';

interface BookingDataTableProps {
  columns: Column<Booking>[];
  data: Booking[];
  isLoading: boolean;
  hasError: boolean;
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
  onComplete,
  onRestore,
  onEdit,
  onDelete,
}: BookingDataTableProps) {
  const theme = useMuiTheme();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedBookingForWhatsApp, setSelectedBookingForWhatsApp] = useState<Booking | null>(null);

  const handleOpenWhatsAppModal = (booking: Booking) => {
    setSelectedBookingForWhatsApp(booking);
    setIsWhatsAppModalOpen(true);
  };

  const getRowStyle = (booking: Booking) => {
    if (booking.status === 'COMPLETATO') {
      return {
        backgroundColor: `${theme.palette.success.main}08`,
      };
    }
    if (booking.status === 'ANNULLATO') {
      return {
        backgroundColor: `${theme.palette.error.main}08`,
      };
    }
    return undefined;
  };

  return (
    <>
      <SmartTable<Booking>
        columns={columns}
        data={data}
        isLoading={isLoading}
        hasError={hasError}
        keyExtractor={(b) => b.id}
        getRowStyle={getRowStyle}
        pageSize={12}
        renderCard={(booking) => (
          <BookingCard
            booking={booking}
            onEdit={onEdit}
            onDelete={onDelete}
            onComplete={onComplete}
            onRestore={onRestore}
            onWhatsApp={() => handleOpenWhatsAppModal(booking)}
          />
        )}
        actions={(booking) => (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            <PermissionGate requireAdmin>
              <>
                {booking.status !== 'COMPLETATO' && booking.status !== 'ANNULLATO' && (
                  <>
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
                {booking.status === 'ANNULLATO' && (
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
          </Box>
        )}
      />
      <WhatsAppSendModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        booking={selectedBookingForWhatsApp}
      />
    </>
  );
}
