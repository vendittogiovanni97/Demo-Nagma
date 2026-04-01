import { Booking } from './dashboard';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  _count?: {
    bookings: number;
  };
  bookings?: Booking[];
  creamSales?: any[]; // Da tipizzare se necessario
}
