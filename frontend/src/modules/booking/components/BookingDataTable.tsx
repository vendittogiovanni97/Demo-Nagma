"use client";

import DataTable, { type ColumnDefinition as Column, type TableAction } from '@/common/components/table/DataTable';
import type { Booking } from '@/modules/booking/model/booking.types';
import WhatsAppSendModal from '@/modules/whatsapp/components/modals/WhatsAppSendModal';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import { memo, useCallback, useState } from 'react';
import BookingCard from './BookingCard';

interface BookingDataTableProps {
  columns: Column<Booking>[];
  data: Booking[];
  isLoading: boolean;
  onComplete: (id: number) => void;
  onRestore: (id: number) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
}

function BookingDataTable({
  columns,
  data,
  isLoading,
  onComplete,
  onRestore,
  onEdit,
  onDelete,
}: BookingDataTableProps) {
  const theme = useMuiTheme();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedBookingForWhatsApp, setSelectedBookingForWhatsApp] = useState<Booking | null>(null);

  const handleOpenWhatsAppModal = useCallback((booking: Booking) => {
    setSelectedBookingForWhatsApp(booking);
    setIsWhatsAppModalOpen(true);
  }, []);

  const rowActions = useCallback((booking: Booking): TableAction[] => [
    {
      id: 'complete',
      label: 'Completato',
      icon: 'checkCircle2',
      tone: 'success',
      adminOnly: true,
      hidden: booking.status === 'COMPLETATO' || booking.status === 'ANNULLATO' || booking.status === 'CANCELLATO',
      onClick: () => onComplete(booking.id),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: 'messageCircle',
      tone: 'whatsapp',
      adminOnly: true,
      hidden: booking.status === 'COMPLETATO' || booking.status === 'ANNULLATO' || booking.status === 'CANCELLATO',
      onClick: () => handleOpenWhatsAppModal(booking),
    },
    {
      id: 'edit',
      label: 'Modifica',
      icon: 'pencil',
      tone: 'primary',
      adminOnly: true,
      hidden: booking.status === 'COMPLETATO' || booking.status === 'ANNULLATO' || booking.status === 'CANCELLATO',
      onClick: () => onEdit(booking),
    },
    {
      id: 'delete',
      label: 'Elimina',
      icon: 'trash2',
      tone: 'error',
      adminOnly: true,
      hidden: booking.status === 'COMPLETATO' || booking.status === 'ANNULLATO' || booking.status === 'CANCELLATO',
      onClick: () => onDelete(booking.id),
    },
    {
      id: 'restore',
      label: 'Ripristina',
      icon: 'rotateCcw',
      tone: 'warning',
      adminOnly: true,
      hidden: booking.status !== 'ANNULLATO',
      onClick: () => onRestore(booking.id),
    },
  ], [handleOpenWhatsAppModal, onComplete, onDelete, onEdit, onRestore]);

  const getRowStyle = (booking: Booking) => {
    const tint = (color: string) => ({ backgroundColor: alpha(color, 0.06) });
    switch (booking.status) {
      case 'CREATO':
        return tint(theme.palette.info.main);
      case 'CONFERMATO':
        return tint(theme.palette.primary.main);
      case 'COMPLETATO':
        return tint(theme.palette.success.main);
      case 'MODIFICATO':
        return tint(theme.palette.warning.main);
      case 'SPOSTATO':
        return tint(theme.palette.custom.purple);
      case 'ANNULLATO':
        return tint(theme.palette.error.main);
      case 'CANCELLATO':
        return tint(theme.palette.text.secondary);
      default:
        return undefined;
    }
  };

  return (
    <>
      <DataTable<Booking>
        columns={columns}
        data={data}
        isLoading={isLoading}
        keyExtractor={(b) => b.id}
        getRowStyle={getRowStyle}
        hideToolbar
        renderCard={(booking: Booking) => (
          <BookingCard
            booking={booking}
            onEdit={onEdit}
            onDelete={onDelete}
            onComplete={onComplete}
            onRestore={onRestore}
            onWhatsApp={() => handleOpenWhatsAppModal(booking)}
          />
        )}
        rowActions={rowActions}
      />
      <WhatsAppSendModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        booking={selectedBookingForWhatsApp}
      />
    </>
  );
}

export default memo(BookingDataTable);
