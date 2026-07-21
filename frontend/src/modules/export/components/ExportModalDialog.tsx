'use client';

import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Icon from '@/common/components/ui/Icon';
import { ExportColumnOption, ExportFormat } from '../api/exportApi';

interface ExportModalDialogProps {
  open: boolean;
  onClose: () => void;
  columns: ExportColumnOption[];
  onConfirm: (options: {
    format: ExportFormat;
    filename: string;
    selectedKeys: string[];
  }) => void;
  isExporting?: boolean;
  defaultFilename?: string;
}

export function ExportModalDialog({
  open,
  onClose,
  columns,
  onConfirm,
  isExporting = false,
  defaultFilename = 'export_custom',
}: ExportModalDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [filename, setFilename] = useState(defaultFilename);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(columns.map((c) => c.key));

  const handleToggleColumn = (key: string) => {
    if (selectedKeys.includes(key)) {
      setSelectedKeys(selectedKeys.filter((k) => k !== key));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  };

  const handleSelectAll = () => {
    if (selectedKeys.length === columns.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(columns.map((c) => c.key));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedKeys.length === 0) return;
    onConfirm({ format, filename, selectedKeys });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon name="download" size={20} />
          Personalizza Esportazione
        </DialogTitle>

        <DialogContent dividers>
          {/* Nome File */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Nome File Output
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Inserisci nome file..."
            />
          </Box>

          {/* Formato */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Formato di Esportazione
            </Typography>
            <RadioGroup
              row
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
            >
              <FormControlLabel value="xlsx" control={<Radio size="small" />} label="Excel (.xlsx)" />
              <FormControlLabel value="csv" control={<Radio size="small" />} label="CSV" />
              <FormControlLabel value="pdf" control={<Radio size="small" />} label="PDF" />
            </RadioGroup>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Selezione Colonne */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Colonne da includere ({selectedKeys.length} / {columns.length})
            </Typography>
            <Button size="small" variant="text" onClick={handleSelectAll}>
              {selectedKeys.length === columns.length ? 'Deseleziona Tutto' : 'Seleziona Tutto'}
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, maxHeight: 200, overflowY: 'auto' }}>
            {columns.map((col) => (
              <FormControlLabel
                key={col.key}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedKeys.includes(col.key)}
                    onChange={() => handleToggleColumn(col.key)}
                  />
                }
                label={col.label}
              />
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={isExporting}>
            Annulla
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isExporting || selectedKeys.length === 0}
            startIcon={<Icon name="download" size={16} />}
          >
            {isExporting ? 'Generazione...' : 'Conferma ed Esporta'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
