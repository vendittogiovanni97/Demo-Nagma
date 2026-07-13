import prisma from '../../../../core/shared/utils/prisma';
import { AppError } from '../../../../core/shared/errors/AppError';

export class BookingPlacementService {
  async getPlacementByBookingId(bookingId: number) {
    const raw = await prisma.bookingPlacement.findFirst({
      where: { bookingId, deletedAt: null },
    });
    if (!raw) return null;
    return raw;
  }

  async savePlacement(props: {
    bookingId: number;
    bodyZone: string;
    view?: string;
    x?: number | null;
    y?: number | null;
    sizeWidth?: number | null;
    sizeHeight?: number | null;
    notes?: string | null;
  }) {
    const booking = await prisma.booking.findUnique({
      where: { id: props.bookingId, deletedAt: null },
    });
    if (!booking) {
      throw new AppError('Prenotazione non trovata.', 404, 'BOOKING_NOT_FOUND');
    }

    const raw = await prisma.bookingPlacement.upsert({
      where: { bookingId: props.bookingId },
      update: {
        bodyZone: props.bodyZone,
        view: props.view,
        x: props.x,
        y: props.y,
        sizeWidth: props.sizeWidth,
        sizeHeight: props.sizeHeight,
        notes: props.notes,
      },
      create: {
        bookingId: props.bookingId,
        bodyZone: props.bodyZone,
        view: props.view || 'FRONT',
        x: props.x,
        y: props.y,
        sizeWidth: props.sizeWidth,
        sizeHeight: props.sizeHeight,
        notes: props.notes,
      },
    });
    return raw;
  }
}
