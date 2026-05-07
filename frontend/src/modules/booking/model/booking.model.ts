import { BookingStatus } from '../api/booking.types';

export interface BookingModel {
  id: number;
  customerId: number;
  customerName: string;
  artistId: number;
  artistName: string;
  artistColor: string;
  date: string;
  formattedDate: string;
  formattedTime: string;
  duration: number;
  status: BookingStatus;
  price: number;
  deposit: number;
  notes: string;
  formData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  };
  artist?: {
    id: number;
    name: string;
    color?: string;
  };
  attachments?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
  }>;
}

export interface BookingSummaryModel {
  id: number;
  customerName: string;
  artistName: string;
  date: string;
  status: BookingStatus;
  price: number;
}
