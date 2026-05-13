"use client";

import {
  Box,
  Chip,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import SmartModal from '@/components/common/SmartModal';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import {
  AttachmentList,
  AttachmentUploadModal,
} from '@/modules/booking/components/attachments';
import type { Booking } from '@/modules/booking/model/booking.types';

interface BookingAttachmentsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onMutate?: () => void;
}

export default function BookingAttachmentsModal({
  booking,
  isOpen,
  onClose,
  onMutate,
}: BookingAttachmentsModalProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAdmin } = useAuth();

  const bookingId = booking ? String(booking.id) : '';
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    setIsUploadOpen(false);
  }, [booking?.id]);

  const handleUploadSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    setIsUploadOpen(false);
    onMutate?.();
  }, [onMutate]);

  if (!booking) return null;

  const customerName = booking.customer
    ? `${booking.customer.firstName} ${booking.customer.lastName}`
    : 'Cliente sconosciuto';

  return (
    <>
      <SmartModal
        isOpen={isOpen}
        onClose={onClose}
        title="Allegati prenotazione"
        maxWidth="md"
        showFooter={false}
        headerAction={
          <Chip
            label={customerName}
            size="small"
            sx={{
              backgroundColor: 'rgba(0, 191, 255, 0.08)',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.75rem',
              border: '1px solid rgba(0, 191, 255, 0.15)',
              fontFamily: 'Outfit, sans-serif',
              height: 24,
              px: 0.5,
            }}
          />
        }
      >
        <Stack spacing={2}>
          {isAdmin && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'stretch', sm: 'flex-end' },
              }}
            >
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={(e) => {
                  // Blur il pulsante prima di aprire il Dialog secondario:
                  // MUI imposta aria-hidden sul Dialog parent e i lettori di
                  // schermo lamentano il focus rimasto su un nodo nascosto.
                  (e.currentTarget as HTMLButtonElement).blur();
                  setIsUploadOpen(true);
                }}
                fullWidth={fullScreen}
              >
                Carica allegato
              </Button>
            </Box>
          )}

          <AttachmentList bookingId={bookingId} refreshTrigger={refreshTrigger} />
        </Stack>
      </SmartModal>

      <AttachmentUploadModal
        bookingId={bookingId}
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}
