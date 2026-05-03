import { Booking, BookingStatus } from '../domain/Booking';
import { BookingHistory } from '../domain/BookingHistory';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';

export interface BookingFilters {
  month?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  offset?: number;
}
export interface BookingHistoryFilters {
  startDate?: string;
  endDate?: string;
  action?: BookingStatus;
  userId?: number;
}

export interface IBookingRepository {
  save(booking: Booking): Promise<Booking>;
  findById(id: number): Promise<Booking | null>;
  findAllPaged(filters: BookingFilters): Promise<IPaginatedResponse<Booking>>;
  findAllSimple(filters: BookingFilters): Promise<{ data: Booking[], total: number, hasMore: boolean }>;
  update(id: number, data: Partial<Booking>): Promise<Booking>;
  delete(id: number): Promise<void>;
  
  // History
  addHistory(history: BookingHistory): Promise<void>;
  getHistory(bookingId: number): Promise<BookingHistory[]>;
  findAllHistoryPaged(page: number, limit: number, filters: BookingHistoryFilters): Promise<IPaginatedResponse<BookingHistory>>;
  
  // Stats
  getStats(month?: string): Promise<any>;
  
  // Specialized
  getAvailableArtists(start: Date, end: Date): Promise<any[]>;
  hasConflict(artistId: number, start: Date, end: Date, excludeId?: number): Promise<number | null>;
  
  // Transactions (Infrastructure level orchestration might be needed, but repository can provide a way to do it in transaction)
  executeInTransaction<T>(work: (repo: IBookingRepository, tx: any) => Promise<T>): Promise<T>;
}
