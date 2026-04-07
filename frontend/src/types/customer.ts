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
  creamSales?: CreamSale[];
}

export interface Cream {
  id: string;
  name: string;
  brand?: string;
  price: number;
  stock: number;
}

export interface CreamSale {
  id: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  cream: Cream;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  color?: string;
}
