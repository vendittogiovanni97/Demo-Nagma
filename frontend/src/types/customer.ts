import type { Booking } from './booking';
import type { CreamSale } from './cream';

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
  creamSales?: CreamSale[];
}

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  notes?: string;
}
