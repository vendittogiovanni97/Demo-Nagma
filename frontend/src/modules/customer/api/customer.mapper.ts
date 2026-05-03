import type { CustomerDTO, CustomerSummaryDTO } from './customer.types';
import type { CustomerModel, CustomerSummaryModel } from '../model/customer.model';

export const customerMapper = {
  toModel(dto: CustomerDTO): CustomerModel {
    return {
      id: dto.id,
      fullName: `${dto.firstName} ${dto.lastName}`.trim(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      email: dto.email || '',
      notes: dto.notes || '',
      createdAt: dto.createdAt,
      totalBookings: dto._count?.bookings || 0,
      bookings: dto.bookings,
      whatsappLogs: dto.whatsappLogs,
    };
  },

  toSummaryModel(dto: CustomerSummaryDTO): CustomerSummaryModel {
    return {
      id: dto.id,
      fullName: `${dto.firstName} ${dto.lastName}`.trim(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email || '',
      phone: dto.phone,
      notes: dto.notes || '',
      createdAt: dto.createdAt,
      totalSpent: dto.totalSpent,
      upcomingBookingsCount: dto.upcomingBookings,
      totalBookings: dto._count.bookings,
      lastBooking: dto.lastBooking ? {
        date: dto.lastBooking.date,
        status: dto.lastBooking.status,
        price: dto.lastBooking.price || 0,
        artistName: dto.lastBooking.artist.name,
      } : null,
    };
  }
};
