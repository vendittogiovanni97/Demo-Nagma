export type ReportType = 'FINANCIAL' | 'BOOKINGS' | 'STAFF_PERFORMANCE' | 'CUSTOMERS';

export interface ReportFilterDto {
  startDate?: string;
  endDate?: string;
  reportType?: ReportType;
  staffId?: number;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ReportSummaryDto {
  period: {
    startDate: string;
    endDate: string;
  };
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
}

export interface ReportDetailItemDto {
  id: string;
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  staffName?: string;
  customerName?: string;
  status?: string;
}

export interface PaginatedReportDetailsDto {
  data: ReportDetailItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ExportFormat = 'csv' | 'pdf';
