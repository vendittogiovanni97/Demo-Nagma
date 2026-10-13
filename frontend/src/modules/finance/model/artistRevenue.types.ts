export interface ArtistRevenueBooking {
  id: number;
  date: string;
  customerName: string;
  price: number;
  artistShare: number;
  deposit: number;
  status: string;
}

export interface ArtistRevenueItem {
  id: number;
  name: string;
  color: string;
  type: string;
  totalRevenue: number;
  grossRevenue: number;
  studioRevenue: number;
  totalDeposits: number;
  completedBookingsCount: number;
  averageTicket: number;
  revenueShare: number;
  bookings: ArtistRevenueBooking[];
}

export interface ArtistRevenueResponse {
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
  artists: ArtistRevenueItem[];
}

export interface ArtistRevenueFilterParams {
  mode?: 'day' | 'month' | 'year' | 'custom';
  year?: number;
  month?: number;
  day?: string;
  startDate?: string;
  endDate?: string;
}
