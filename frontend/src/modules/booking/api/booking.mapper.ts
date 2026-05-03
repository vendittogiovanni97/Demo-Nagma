import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { BookingDTO } from './booking.types';
import type { BookingModel } from '../model/booking.model';

export const bookingMapper = {
  toModel(dto: BookingDTO): BookingModel {
    const dateObj = new Date(dto.date);
    
    return {
      id: dto.id,
      customerId: dto.customerId,
      customerName: dto.customer ? `${dto.customer.firstName} ${dto.customer.lastName}`.trim() : 'Cliente Sconosciuto',
      artistId: dto.artistId,
      artistName: dto.artist ? dto.artist.name : 'Artista Sconosciuto',
      artistColor: dto.artist?.color || '#000000',
      date: dto.date,
      formattedDate: format(dateObj, 'dd MMM yyyy', { locale: it }),
      formattedTime: format(dateObj, 'HH:mm'),
      duration: dto.duration,
      status: dto.status,
      price: dto.price || 0,
      deposit: dto.deposit || 0,
      notes: dto.notes || '',
      formData: dto.formData || {},
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }
};
