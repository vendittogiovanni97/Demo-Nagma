export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface BookingStats {
  total: number;
  confirmed: number;
  cancelled: number;
  rescheduled: number;
  completed: number;
  month: string;
}

export interface Booking {
  id: string;
  date: string;
  type: string;
  status: string;
  customerId: string;
  artistId: string;
  customer?: {
    firstName: string;
    lastName: string;
  };
  artist?: {
    name: string;
  };
}
