"use client";

import PermissionGate from '@/common/components/auth/PermissionGate';
import DataTable, { type ColumnDefinition as Column } from '@/common/components/table/DataTable';
import Button from '@/common/components/ui/Button';
import type { Booking } from '@/modules/booking/model/booking.types';
import WhatsAppSendModal from '@/modules/whatsapp/components/modals/WhatsAppSendModal';
import { Box } from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import Icon from '@/common/components/ui/Icon';
import { memo, useState } from 'react';
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

function BookingDataTable({
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
      <DataTable<Booking>
        columns={columns}
        data={data}
        isLoading={isLoading}
        hasError={hasError}
        keyExtractor={(b) => b.id}
        getRowStyle={getRowStyle}
        pageSize={9}
        hideToolbar
        hideState={true}
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
        actions={(booking: Booking) => (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            <PermissionGate requireAdmin>
              <>
                {booking.status !== 'COMPLETATO' && booking.status !== 'ANNULLATO' && (
                  <>
                    <Button
                      variant="icon"
                      icon={<Icon name="checkCircle2" size={18} />}
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
                      icon={<Icon name="messageCircle" size={18} />}
                      title="WhatsApp"
                      sx={{
                        color: alpha(theme.palette.custom.whatsapp, 0.6),
                        '&:hover': {
                          color: theme.palette.custom.whatsapp,
                          backgroundColor: alpha(theme.palette.custom.whatsapp, 0.063),
                        },
                      }}
                      onClick={() => handleOpenWhatsAppModal(booking)}
                    />
                    <Button
                      variant="icon"
                      icon={<Icon name="pencil" size={17} color={theme.palette.primary.main} />}
                      title="Modifica"
                      sx={{
                        color: theme.palette.primary.main,
                        '&:hover': {
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                      onClick={() => onEdit(booking)}
                    />
                    <Button
                      variant="icon"
                      icon={<Icon name="trash2" size={18} />}
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
                    icon={<Icon name="rotateCcw" size={18} />}
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

export default memo(BookingDataTable);
