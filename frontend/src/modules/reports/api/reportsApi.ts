import { apiClient } from '@/common/shared/api/client';
import { API_BASE_URL, ENDPOINTS } from '@/common/shared/api/endpoints';
import { getToken } from '@/common/shared/utils/auth';

export interface ReportFilterParams {
  startDate?: string;
  endDate?: string;
  reportType?: string;
  staffId?: number;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ReportSummaryResponse {
  success: boolean;
  data: {
    period: { startDate: string; endDate: string };
    financial: {
      totalRevenue: number;
      totalExpenses: number;
      netProfit: number;
      transactionCount: number;
    };
    bookings: {
      totalBookings: number;
      completedBookings: number;
      cancelledBookings: number;
      completionRate: number;
    };
    customers: {
      totalActiveCustomers: number;
      newCustomersInPeriod: number;
    };
    topStaffPerformers: Array<{
      staffId: number;
      staffName: string;
      completedBookingsCount: number;
      totalRevenueGenerated: number;
    }>;
  };
}

export interface ReportDetailItem {
  id: string;
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
}

export interface ReportDetailsResponse {
  success: boolean;
  data: ReportDetailItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const reportsApi = {
  getSummary: (params?: ReportFilterParams) =>
    apiClient.get<ReportSummaryResponse>(ENDPOINTS.REPORTS.SUMMARY, params as any),

  getDetails: (params?: ReportFilterParams) =>
    apiClient.get<ReportDetailsResponse>(ENDPOINTS.REPORTS.DETAILS, params as any),

  downloadReport: async (params?: ReportFilterParams, format: 'csv' | 'pdf' = 'csv') => {
    const token = getToken();
    const query = new URLSearchParams({ ...(params as any), format });
    const url = `${API_BASE_URL}${ENDPOINTS.REPORTS.EXPORT}?${query.toString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Errore durante il download del report');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `report_${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
