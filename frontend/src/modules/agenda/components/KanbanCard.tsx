'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@/common/components/ui/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';
import { Clock, Phone, MessageSquare, CreditCard, User, Sparkles } from 'lucide-react';
import type { KanbanBookingItem } from '../hooks/useKanbanBookings';
import { formatPrice } from '@/common/shared/utils/format';

interface KanbanCardProps {
  booking: KanbanBookingItem;
  onOpenPayment?: (booking: KanbanBookingItem) => void;
}

export function KanbanCard({ booking, onOpenPayment }: KanbanCardProps) {
  const theme = useTheme();
  const [elapsedMinutes, setElapsedMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (booking.kanbanStage === 'IN_SEDUTA' && booking.sessionStartedAt) {
      const calculate = () => {
        const start = new Date(booking.sessionStartedAt!).getTime();
        const now = new Date().getTime();
        const diffMin = Math.max(0, Math.floor((now - start) / 60000));
        setElapsedMinutes(diffMin);
      };
      calculate();
      const interval = setInterval(calculate, 30000);
      return () => clearInterval(interval);
    } else {
      setElapsedMinutes(null);
    }
  }, [booking.kanbanStage, booking.sessionStartedAt]);

  const bookingDate = new Date(booking.date);
  const timeFormatted = bookingDate.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const customerName = booking.customer
    ? `${booking.customer.firstName} ${booking.customer.lastName || ''}`.trim()
    : 'Cliente sconosciuto';

  const artistName = booking.artist ? booking.artist.name : 'Non Assegnato';
  const artistColor = booking.artist?.color || theme.palette.primary.main;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!booking.customer?.phone) return;
    const cleanPhone = booking.customer.phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Ciao ${booking.customer.firstName}, ti contattiamo da Nagma Studio in merito al tuo appuntamento.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: (t) =>
          t.palette.mode === 'dark'
            ? alpha(t.palette.background.paper, 0.8)
            : t.palette.background.paper,
        backdropFilter: 'blur(12px)',
        border: '1px solid',
        borderColor: (t) =>
          t.palette.mode === 'dark'
            ? alpha(t.palette.common.white, 0.1)
            : alpha(t.palette.common.black, 0.08),
        boxShadow: (t) =>
          t.palette.mode === 'dark'
            ? `0 4px 20px ${alpha(t.palette.common.black, 0.4)}`
            : `0 4px 12px ${alpha(t.palette.common.black, 0.06)}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: artistColor,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${alpha(artistColor, 0.25)}`,
        },
      }}
    >
      {/* Header: Ora & Artista */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Clock size={15} style={{ color: theme.palette.text.secondary }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            {timeFormatted}
          </Typography>
        </Box>

        <Chip
          icon={<User size={12} style={{ color: artistColor }} />}
          label={artistName}
          size="small"
          sx={{
            height: 24,
            fontSize: '0.72rem',
            fontWeight: 600,
            bgcolor: alpha(artistColor, 0.15),
            color: (t) => (t.palette.mode === 'dark' ? theme.palette.common.white : artistColor),
            border: `1px solid ${alpha(artistColor, 0.3)}`,
          }}
        />
      </Box>

      {/* Nome Cliente */}
      <Typography variant="body1" sx={{ mb: 0.5, fontSize: '0.95rem', fontWeight: 700 }}>
        {customerName}
      </Typography>

      {/* Telefono & WhatsApp */}
      {booking.customer?.phone && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Phone size={13} />
            {booking.customer.phone}
          </Typography>

          <Tooltip title="Invia messaggio WhatsApp">
            <IconButton
              size="small"
              onClick={handleWhatsApp}
              sx={{
                p: 0.5,
                color: theme.palette.custom.whatsapp,
                bgcolor: alpha(theme.palette.custom.whatsapp, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.custom.whatsapp, 0.2) },
              }}
            >
              <MessageSquare size={14} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Timer Seduta (se IN_SEDUTA) */}
      {booking.kanbanStage === 'IN_SEDUTA' && elapsedMinutes !== null && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1.5,
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.12),
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
          }}
        >
          <Sparkles size={14} style={{ color: theme.palette.info.main }} />
          <Typography variant="caption" color="info.main" sx={{ fontWeight: 600 }}>
            In seduta da {elapsedMinutes} min
          </Typography>
        </Box>
      )}

      {/* Dettagli Economici */}
      <Box
        sx={{
          pt: 1.5,
          borderTop: '1px dashed',
          borderColor: (t) => alpha(t.palette.divider, 0.8),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Prezzo: {formatPrice(booking.price || 0)} | Acconto: {formatPrice(booking.deposit || 0)}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color:
                booking.outstandingBalance > 0
                  ? theme.palette.warning.main
                  : theme.palette.success.main,
            }}
          >
            Saldo: {formatPrice(booking.outstandingBalance)}
          </Typography>
        </Box>

        {booking.kanbanStage === 'DA_SALDARE' && onOpenPayment && (
          <Button
            variant="primary"
            size="sm"
            startIcon={<CreditCard size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onOpenPayment(booking);
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              px: 1.5,
              py: 0.5,
              bgcolor: 'warning.main',
              '&:hover': { bgcolor: 'warning.dark' },
            }}
          >
            Incassa
          </Button>
        )}
      </Box>
    </Box>
  );
}
