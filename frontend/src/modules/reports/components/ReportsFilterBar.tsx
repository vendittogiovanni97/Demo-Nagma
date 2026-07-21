'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Icon from '@/common/components/ui/Icon';
import { ReportFilterParams } from '../api/reportsApi';

interface ReportsFilterBarProps {
  filters: ReportFilterParams;
  onFilterChange: (newFilters: ReportFilterParams) => void;
  onExport: (format: 'csv' | 'pdf') => void;
  onRefresh: () => void;
  isExporting: boolean;
}

export function ReportsFilterBar({
  filters,
  onFilterChange,
  onExport,
  onRefresh,
  isExporting,
}: ReportsFilterBarProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, endDate: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handlePresetSelect = (days: number) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    onFilterChange({
      ...filters,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      page: 1,
    });
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Filtri Report & Esportazione
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Icon name="refreshCw" size={16} />}
              onClick={onRefresh}
            >
              Aggiorna
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon name="download" size={16} />}
              onClick={() => onExport('csv')}
              disabled={isExporting}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Icon name="fileText" size={16} />}
              onClick={() => onExport('pdf')}
              disabled={isExporting}
            >
              Export PDF
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              type="date"
              label="Data Inizio"
              slotProps={{ inputLabel: { shrink: true } }}
              value={filters.startDate || ''}
              onChange={handleStartDateChange}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              type="date"
              label="Data Fine"
              slotProps={{ inputLabel: { shrink: true } }}
              value={filters.endDate || ''}
              onChange={handleEndDateChange}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Cerca nei movimenti"
              placeholder="Descrizione o categoria..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="text" onClick={() => handlePresetSelect(7)}>
                7g
              </Button>
              <Button size="small" variant="text" onClick={() => handlePresetSelect(30)}>
                30g
              </Button>
              <Button size="small" variant="text" onClick={() => handlePresetSelect(90)}>
                90g
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
