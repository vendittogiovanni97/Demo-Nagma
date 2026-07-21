import useSWR from 'swr';
import { useState } from 'react';
import { reportsApi, ReportFilterParams } from '../api/reportsApi';
import { useToast } from '@/common/hooks/useToast';

export function useReports(initialFilters: ReportFilterParams = {}) {
  const [filters, setFilters] = useState<ReportFilterParams>(initialFilters);
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();

  const summaryKey = ['/api/reports/summary', filters.startDate, filters.endDate, filters.staffId];
  const detailsKey = ['/api/reports/details', filters.startDate, filters.endDate, filters.staffId, filters.page, filters.limit, filters.search];

  const {
    data: summaryRes,
    error: summaryError,
    isLoading: isSummaryLoading,
    mutate: mutateSummary,
  } = useSWR(summaryKey, () => reportsApi.getSummary(filters));

  const {
    data: detailsRes,
    error: detailsError,
    isLoading: isDetailsLoading,
    mutate: mutateDetails,
  } = useSWR(detailsKey, () => reportsApi.getDetails(filters));

  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      setIsExporting(true);
      await reportsApi.downloadReport(filters, format);
      toast.success(`Export ${format.toUpperCase()} completato con successo`);
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'esportazione del report');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    filters,
    setFilters,
    summary: summaryRes?.data,
    isSummaryLoading,
    summaryError,
    details: detailsRes?.data || [],
    totalDetails: detailsRes?.total || 0,
    page: detailsRes?.page || 1,
    limit: detailsRes?.limit || 20,
    totalPages: detailsRes?.totalPages || 1,
    isDetailsLoading,
    detailsError,
    exportReport,
    isExporting,
    refresh: () => {
      mutateSummary();
      mutateDetails();
    },
  };
}
