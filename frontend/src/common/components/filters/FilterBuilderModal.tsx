'use client';

import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { FilterCondition, FilterOperator } from '@/modules/saved-views/api/savedViewApi';
import Icon from '@/common/components/ui/Icon';

export interface FieldOption {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
}

interface FilterBuilderModalProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterCondition[]) => void;
  availableFields: FieldOption[];
  initialFilters?: FilterCondition[];
}

const OPERATOR_LABELS: { value: FilterOperator; label: string }[] = [
  { value: 'contains', label: 'Contiene' },
  { value: 'equals', label: 'È Uguale a' },
  { value: 'startsWith', label: 'Inizia con' },
  { value: 'greaterThan', label: 'Maggiore di (>)' },
  { value: 'lessThan', label: 'Minore di (<)' },
  { value: 'inRange', label: 'Incluso tra' },
  { value: 'isEmpty', label: 'È Vuoto' },
];

export default function FilterBuilderModal({
  open,
  onClose,
  onApplyFilters,
  availableFields,
  initialFilters = [],
}: FilterBuilderModalProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>([]);

  useEffect(() => {
    if (open) {
      if (initialFilters.length > 0) {
        setConditions(initialFilters);
      } else if (availableFields.length > 0) {
        setConditions([
          { field: availableFields[0].key, operator: 'contains', value: '', logic: 'AND' },
        ]);
      }
    }
  }, [open, initialFilters, availableFields]);

  const handleAddCondition = () => {
    const defaultField = availableFields[0]?.key || 'name';
    setConditions((prev) => [
      ...prev,
      { field: defaultField, operator: 'contains', value: '', logic: 'AND' },
    ]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCondition = (index: number, fieldKey: keyof FilterCondition, value: any) => {
    setConditions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [fieldKey]: value };
      return copy;
    });
  };

  const handleApply = () => {
    onApplyFilters(conditions);
    onClose();
  };

  const handleReset = () => {
    setConditions([]);
    onApplyFilters([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Icon name="filtro" size={22} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Costruttore Filtri Avanzati
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Icon name="x" size={18} />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Crea condizioni di ricerca componibili con logica AND/OR per filtrare i dati della tabella.
        </Typography>

        {conditions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Nessun filtro attivo. Clicca su &quot;Aggiungi Condizione&quot; per iniziare.
            </Typography>
          </Box>
        ) : (
          conditions.map((cond, idx) => (
            <Box key={idx} sx={{ mb: 2, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                {idx > 0 && (
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Select
                      fullWidth
                      size="small"
                      value={cond.logic || 'AND'}
                      onChange={(e) => handleUpdateCondition(idx, 'logic', e.target.value)}
                    >
                      <MenuItem value="AND">AND</MenuItem>
                      <MenuItem value="OR">OR</MenuItem>
                    </Select>
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: idx > 0 ? 3 : 4 }}>
                  <Select
                    fullWidth
                    size="small"
                    value={cond.field}
                    onChange={(e) => handleUpdateCondition(idx, 'field', e.target.value)}
                  >
                    {availableFields.map((f) => (
                      <MenuItem key={f.key} value={f.key}>
                        {f.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <Select
                    fullWidth
                    size="small"
                    value={cond.operator}
                    onChange={(e) => handleUpdateCondition(idx, 'operator', e.target.value)}
                  >
                    {OPERATOR_LABELS.map((op) => (
                      <MenuItem key={op.value} value={op.value}>
                        {op.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>

                <Grid size={{ xs: 12, sm: idx > 0 ? 3 : 4 }}>
                  {cond.operator !== 'isEmpty' && (
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Valore filtro..."
                      value={cond.value || ''}
                      onChange={(e) => handleUpdateCondition(idx, 'value', e.target.value)}
                    />
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 1 }} sx={{ textAlign: 'right' }}>
                  <IconButton color="error" size="small" onClick={() => handleRemoveCondition(idx)}>
                    <Icon name="x" size={18} />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))
        )}

        <Button
          variant="outlined"
          size="small"
          onClick={handleAddCondition}
          startIcon={<Icon name="check" size={16} />}
          sx={{ mt: 1 }}
        >
          Aggiungi Condizione
        </Button>
      </DialogContent>
      <Divider />

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button variant="outlined" color="error" onClick={handleReset}>
          Azzera Filtri
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Annulla
          </Button>
          <Button variant="contained" color="primary" onClick={handleApply} sx={{ px: 3, fontWeight: 700 }}>
            Applica Filtri
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
