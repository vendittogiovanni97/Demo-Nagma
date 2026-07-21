'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useReports } from '@/modules/reports/hooks/useReports';
import { ReportsFilterBar } from '@/modules/reports/components/ReportsFilterBar';
import { ReportsSummaryCards } from '@/modules/reports/components/ReportsSummaryCards';
import { ReportsDataGrid } from '@/modules/reports/components/ReportsDataGrid';

export default function ReportsPage() {
  const {
    filters,
    setFilters,
    summary,
    isSummaryLoading,
    details,
    totalDetails,
    page,
    limit,
    totalPages,
    isDetailsLoading,
    exportReport,
    isExporting,
    refresh,
  } = useReports();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          📊 Reportistica & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitora le performance finanziarie, gli appuntamenti e le metriche operative in tempo reale.
        </Typography>
      </Box>

      {/* Bar dei filtri ed esportazione */}
      <ReportsFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onExport={exportReport}
        onRefresh={refresh}
        isExporting={isExporting}
      />

      {/* Carte KPI di riepilogo */}
      <ReportsSummaryCards summary={summary} isLoading={isSummaryLoading} />

      {/* Griglia dati AG-Grid */}
      <ReportsDataGrid
        data={details}
        total={totalDetails}
        limit={limit}
        isLoading={isDetailsLoading}
      />
    </Container>
  );
}
