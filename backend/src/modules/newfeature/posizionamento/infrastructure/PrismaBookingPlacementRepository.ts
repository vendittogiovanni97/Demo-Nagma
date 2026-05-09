import { IBookingPlacementRepository } from '../contracts/IBookingPlacementRepository';
import { BookingPlacement } from '../domain/BookingPlacement';
import prisma from '../../../../shared/utils/prisma';

export class PrismaBookingPlacementRepository implements IBookingPlacementRepository {
  private mapToDomain(raw: any): BookingPlacement {
    return new BookingPlacement({
      id: raw.id,
      bookingId: raw.bookingId,
      bodyZone: raw.bodyZone,
      view: raw.view || 'FRONT',
      x: raw.x,
      y: raw.y,
      sizeWidth: raw.sizeWidth,
      sizeHeight: raw.sizeHeight,
      notes: raw.notes,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findByBookingId(bookingId: number): Promise<BookingPlacement | null> {
    const raw = await prisma.bookingPlacement.findUnique({
      where: { bookingId },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async save(placement: BookingPlacement): Promise<BookingPlacement> {
    const raw = await prisma.bookingPlacement.upsert({
      where: { bookingId: placement.bookingId },
      update: {
        bodyZone: placement.bodyZone,
        view: placement.view,
        x: placement.x,
        y: placement.y,
        sizeWidth: placement.sizeWidth,
        sizeHeight: placement.sizeHeight,
        notes: placement.notes,
      },
      create: {
        bookingId: placement.bookingId,
        bodyZone: placement.bodyZone,
        view: placement.view || 'FRONT',
        x: placement.x,
        y: placement.y,
        sizeWidth: placement.sizeWidth,
        sizeHeight: placement.sizeHeight,
        notes: placement.notes,
      },
    });
    return this.mapToDomain(raw);
  }
}
