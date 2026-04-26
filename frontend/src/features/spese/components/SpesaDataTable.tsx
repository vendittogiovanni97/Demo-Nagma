"use client";

import Button from '@/components/ui/Button';
import type { SpesaLibera } from '@/types/spesa-libera';
import { formatPrice } from '@/utils/format';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Loader2, Receipt, Trash2 } from 'lucide-react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

interface SpesaDataTableProps {
  spese: SpesaLibera[];
  isLoading: boolean;
  monthLabel: string;
  total: number;
  onDelete: (id: number) => void;
}

export default function SpesaDataTable({
  spese,
  isLoading,
  monthLabel,
  total,
  onDelete,
}: SpesaDataTableProps) {
  const theme = useTheme();

  const glassPanelSx = {
    backgroundColor: theme.palette.background.paper,
    backdropFilter: 'blur(20px)',
    border: 1,
    borderColor: 'divider',
    borderRadius: 3,
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: 'rgba(0, 191, 255, 0.05)',
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 30px rgba(0, 191, 255, 0.1)',
    },
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          ...glassPanelSx,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          color: theme.palette.text.secondary,
          '&:hover': { transform: 'none' },
        }}
      >
        <Loader2 size={28} className="animate-spin" style={{ marginRight: 12 }} />
        <span>Caricamento...</span>
      </Box>
    );
  }

  if (spese.length === 0) {
    return (
      <Box
        sx={{
          ...glassPanelSx,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          gap: 1.5,
          color: theme.palette.text.secondary,
          '&:hover': { transform: 'none' },
        }}
      >
        <Receipt size={40} style={{ opacity: 0.3 }} />
        <Typography variant="body2">Nessuna spesa per {monthLabel}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...glassPanelSx, overflow: 'hidden', '&:hover': { transform: 'none' } }}>
      <Table sx={{ width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Data</TableCell>
            <TableCell align="right">Prezzo</TableCell>
            <TableCell sx={{ width: 48 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {spese.map((spesa, idx) => (
            <TableRow
              key={spesa.id}
              sx={{
                borderBottom: idx === spese.length - 1 ? 0 : 1,
                borderColor: 'divider',
                transition: 'background-color 0.2s ease',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
              }}
            >
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                {spesa.name}
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                {format(new Date(spesa.createdAt), 'd MMM', { locale: it })}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontVariant: 'tabular-nums',
                }}
              >
                {formatPrice(spesa.price)}
              </TableCell>
              <TableCell align="center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(spesa.id)}
                  icon={<Trash2 size={16} />}
                  title="Elimina"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Totale {monthLabel}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            fontVariant: 'tabular-nums',
          }}
        >
          {formatPrice(total)}
        </Typography>
      </Box>
    </Box>
  );
}
