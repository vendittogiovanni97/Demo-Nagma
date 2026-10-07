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

export interface ArtistRevenueItemDto {
  id: number;
  name: string;
  color: string;
  type: string;
  /** Quota netta incassata dall'artista. */
  totalRevenue: number;
  grossRevenue: number;
  studioRevenue: number;
  totalDeposits: number;
  completedBookingsCount: number;
  averageTicket: number;
  revenueShare: number;
  bookings: Array<{
    id: number;
    date: string;
    customerName: string;
    price: number;
    artistShare: number;
    deposit: number;
    status: string;
  }>;
}

export interface ArtistRevenueQuery {
  mode?: 'day' | 'month' | 'year' | 'custom';
  year?: number;
  month?: number;
  day?: string;
  startDate?: string;
  endDate?: string;
}

export interface ArtistRevenueResponseDto {
  period: {
    mode: 'day' | 'month' | 'year' | 'custom';
    startDate: string;
    endDate: string;
    year?: number;
    month?: number;
    day?: string;
  };
  summary: {
    totalRevenue: number;
    grossRevenue: number;
    studioRevenue: number;
    totalDeposits: number;
    completedBookingsCount: number;
    averageTicket: number;
  };
  artists: ArtistRevenueItemDto[];
}
