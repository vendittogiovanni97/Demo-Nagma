"use client";

import type { Booking } from '@/modules/booking/model/booking.types';
import {
  Box,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { Clock, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

interface BookingCardProps {
  booking: Booking;
  top: number;
  height: number;
  canSendWhatsApp: boolean;
  onWhatsApp: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
}

export default function BookingCard({
  booking,
  top,
  height,
  canSendWhatsApp,
  onWhatsApp,
  onEdit,
  onDelete,
}: BookingCardProps) {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const color = booking.artist?.color ?? theme.palette.primary.main;

  return (
    <Box
      key={booking.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'absolute',
        left: 1,
        right: 1,
        top: `${top}px`,
        height: `${height}px`,
        borderRadius: 2,
        p: 1.5,
        fontSize: '0.75rem',
        borderLeft: `4px solid ${color}`,
        backgroundColor: `${color}28`,
        borderColor: `${color}40`,
        border: `1px solid ${color}40`,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        backdropFilter: 'blur(8px)',
        cursor: 'default',
        transition: theme.transitions.create(['all'], { duration: 300 }),
        zIndex: isHovered ? 20 : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        pr: 5,
      }}
    >
      {/* Actions column - Hidden by default, visible on hover */}
      <Stack
        direction="column"
        useFlexGap
        sx={{ gap: 0.75, position: 'absolute', right: 1, top: 1, opacity: isHovered ? 1 : 0, transition: theme.transitions.create(['opacity'], { duration: 300 }), pointerEvents: isHovered ? 'auto' : 'none' }}
      >
        {canSendWhatsApp && booking.customer?.id && (
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onWhatsApp(booking);
            }}
            title="WhatsApp"
            sx={{
              width: 24,
              height: 24,
              p: 0,
              bgcolor: '#10b98115',
              color: '#10b981',
              '&:hover': {
                bgcolor: '#10b981',
                color: '#ffffff',
                transform: 'scale(1.1)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
              borderRadius: 1,
              boxShadow: theme.shadows[1],
            }}
          >
            <MessageCircle size={14} />
          </IconButton>
        )}
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(booking);
          }}
          title="Modifica"
          sx={{
            width: 24,
            height: 24,
            p: 0,
            bgcolor: '#3b82f615',
            color: '#60a5fa',
            '&:hover': {
              bgcolor: '#3b82f6',
              color: '#ffffff',
              transform: 'scale(1.1)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            borderRadius: 1,
            boxShadow: theme.shadows[1],
          }}
        >
          <Pencil size={14} />
        </IconButton>
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(booking.id);
          }}
          title="Elimina"
          sx={{
            width: 24,
            height: 24,
            p: 0,
            bgcolor: `${theme.palette.error.main}15`,
            color: theme.palette.error.main,
            '&:hover': {
              bgcolor: theme.palette.error.main,
              color: '#ffffff',
              transform: 'scale(1.1)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            borderRadius: 1,
            boxShadow: theme.shadows[1],
          }}
        >
          <Trash2 size={14} />
        </IconButton>
      </Stack>

      {/* Content */}
      <Box>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
            mb: 0.25,
          }}
        >
          {booking.customer?.firstName} {booking.customer?.lastName}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
          }}
        >
          ● {booking.artist?.name}
        </Typography>
      </Box>

      {/* Time info */}
      <Stack
        useFlexGap
        sx={{ gap: 0.5, fontSize: '10px', fontWeight: 700, color: `${theme.palette.text.secondary}99` }}
      >
        <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center' }}>
          <Clock size={10} style={{ flexShrink: 0 }} />
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {format(new Date(booking.date), 'HH:mm')}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {formatDuration(booking.duration)}
        </Typography>
      </Stack>
    </Box>
  );
}
