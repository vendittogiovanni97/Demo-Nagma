"use client";

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Plus, X } from 'lucide-react';
import { useSWRConfig } from 'swr';

import {
  AttachmentList,
  AttachmentUploadModal,
} from '@/components/attachments';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import type { Booking } from '@/types/booking';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
  const { mutate: mutateSwr } = useSWRConfig();

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    setIsUploadOpen(false);
  }, [booking?.id]);

  const bookingId = booking ? String(booking.id) : '';
  const swrKey = bookingId ? `${API_BASE}/attachments/booking/${bookingId}` : null;

  // Triggera revalidate SWR della lista allegati subito + chiude la modal
  // di upload, così l'utente vede la lista aggiornata senza azioni extra.
  const handleUploadSuccess = useCallback(() => {
    if (swrKey) mutateSwr(swrKey);
    setIsUploadOpen(false);
    onMutate?.();
  }, [swrKey, mutateSwr, onMutate]);

  if (!booking) return null;

  const customerName = booking.customer
    ? `${booking.customer.firstName} ${booking.customer.lastName}`
    : 'Cliente sconosciuto';

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
        aria-labelledby="booking-attachments-title"
      >
        <DialogTitle
          id="booking-attachments-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            pr: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="div"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                fontWeight: 700,
                color: theme.palette.primary.main,
                fontFamily: 'Outfit, sans-serif',
                lineHeight: 1.2,
              }}
            >
              Allegati prenotazione
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.8125rem',
                mt: 0.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {customerName}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Chiudi"
            size="small"
            sx={{ flexShrink: 0 }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
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

            <AttachmentList bookingId={bookingId} />
          </Stack>
        </DialogContent>
      </Dialog>

      <AttachmentUploadModal
        bookingId={bookingId}
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}
