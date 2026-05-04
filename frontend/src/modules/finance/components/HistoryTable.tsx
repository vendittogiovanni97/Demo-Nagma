"use client";

import SmartModal from '@/components/common/SmartModal';
import SmartTable from '@/components/common/SmartTable';
import { Column } from '@/components/data-display/DataTable';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Edit, Eye, Info, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { TransactionHistory } from '../api/finance.api';

interface HistoryTableProps {
  data: TransactionHistory[];
  isLoading: boolean;
}

export default function HistoryTable({ data, isLoading }: HistoryTableProps) {
  const theme = useTheme();
  const [selectedLog, setSelectedLog] = useState<TransactionHistory | null>(null);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATED': return theme.palette.success.main;
      case 'UPDATED': return theme.palette.info.main;
      case 'DELETED': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED': return <PlusCircle size={14} />;
      case 'UPDATED': return <Edit size={14} />;
      case 'DELETED': return <Trash2 size={14} />;
      default: return <Info size={14} />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATED': return 'Creazione';
      case 'UPDATED': return 'Modifica';
      case 'DELETED': return 'Eliminazione';
      default: return action;
    }
  };

  const columns: Column<TransactionHistory>[] = [
    {
      key: 'changedAt',
      label: 'Data e Ora',
      width: '180px',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {format(new Date(row.changedAt), 'dd/MM/yyyy HH:mm', { locale: it })}
        </Typography>
      )
    },
    {
      key: 'changedBy',
      label: 'Operatore',
      width: '200px',
      render: (row) => (
        <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'center' }} component="div">

          <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: theme.palette.primary.main }}>
            {row.changedBy?.name?.charAt(0) ?? 'U'}
          </Avatar>
          <Typography variant="body2">{row.changedBy?.name ?? 'Utente Sconosciuto'}</Typography>
        </Stack>
      )
    },
    {
      key: 'action',
      label: 'Azione',
      width: '150px',
      render: (row) => (
        <Chip
          size="small"
          icon={getActionIcon(row.action)}
          label={getActionLabel(row.action)}
          sx={{
            fontWeight: 700,
            bgcolor: `${getActionColor(row.action)}15`,
            color: getActionColor(row.action),
            border: `1px solid ${getActionColor(row.action)}30`
          }}
        />
      )
    },
    {
      key: 'transaction',
      label: 'Oggetto',
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.transaction?.description || `Transazione #${row.transactionId}`}
        </Typography>
      )
    }
  ];

  const actions = (row: TransactionHistory) => (
    <Tooltip title="Vedi Dettagli JSON">
      <IconButton size="small" onClick={() => setSelectedLog(row)} sx={{ color: theme.palette.primary.main }}>
        <Eye size={18} />
      </IconButton>
    </Tooltip>
  );

  return (
    <>
      <SmartTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        actions={actions}
        emptyTitle="Nessuna attività registrata"
      />

      <SmartModal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Dettagli Modifica"
        saveLabel="Chiudi"
        onSave={() => setSelectedLog(null)}
        maxWidth="md"
      >
        {selectedLog && (
          <Box sx={{ p: 1 }}>
            <Stack sx={{ gap: 3 }} component="div">

              {selectedLog.oldData && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', opacity: 0.6 }}>Stato Precedente</Typography>
                  <Box component="pre" sx={{ fontSize: '0.75rem', p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1.5, mt: 0.5, overflow: 'auto', maxHeight: 300 }}>
                    {JSON.stringify(selectedLog.oldData, null, 2)}
                  </Box>
                </Box>
              )}
              {selectedLog.newData && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', opacity: 0.6 }}>Nuovo Stato</Typography>
                  <Box component="pre" sx={{ fontSize: '0.75rem', p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1.5, mt: 0.5, overflow: 'auto', maxHeight: 300 }}>
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </Box>
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </SmartModal>
    </>
  );
}

