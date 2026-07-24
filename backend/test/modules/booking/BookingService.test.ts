import { Prisma } from '@prisma/client';
import { AppError } from '../../../src/core/shared/errors/AppError';

const createMockPrisma = () => ({
  booking: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  bookingHistory: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
  transaction: {
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  config: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
  staff: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import prisma from '../../../src/core/shared/utils/prisma';
import { BookingService } from '../../../src/modules/booking/services/bookingService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

function bookingRow(overrides = {}) {
  return {
    id: 1,
    customerId: 1,
    artistId: 1,
    date: new Date('2026-07-15T10:00:00'),
    duration: 120,
    status: 'CREATO',
    price: null,
    deposit: null,
    notes: null,
    formData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    customer: { id: 1, firstName: 'Mario', lastName: 'Rossi', phone: '+39 123', email: null, notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    artist: { id: 1, name: 'Tattoo Artist', color: '#000', type: 'ARTIST', email: null, phone: null, password: 'x', createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    ...overrides,
  };
}

function mockTx() {
  return {
    booking: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    bookingHistory: {
      create: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };
}

describe('BookingService', () => {
  let bookingService: BookingService;

  beforeEach(() => {
    jest.clearAllMocks();
    bookingService = new BookingService();
  });

  describe('create', () => {
    it('should create booking when no conflict', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);
      const tx = mockTx();
      tx.booking.create.mockResolvedValue(bookingRow());
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      const result = await bookingService.create({
        customerId: 1,
        artistId: 1,
        date: '2026-07-15T10:00:00',
        duration: 120,
      }, 1);

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(tx.booking.create).toHaveBeenCalled();
      expect(tx.bookingHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'CREATO' }) })
      );
      expect(result.id).toBe(1);
    });

    it('should throw 409 on conflict', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ id: 42 }]);

      await expect(bookingService.create({
        customerId: 1, artistId: 1, date: '2026-07-15T10:00:00',
      })).rejects.toThrow(new AppError(
        'Esiste già una prenotazione per questo artista nella fascia oraria selezionata',
        409, 'BOOKING_CONFLICT',
        { conflictingBookingId: 42 }
      ));
    });
  });

  describe('update', () => {
    it('should update booking and change status to SPOSTATO when date changes', async () => {
      const old = bookingRow({ date: new Date('2026-07-15T10:00:00') });
      mockPrisma.booking.findUnique.mockResolvedValue(old);
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const tx = mockTx();
      tx.booking.update.mockResolvedValue({ ...old, date: new Date('2026-07-16T10:00:00') });
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await bookingService.update(1, { date: '2026-07-16T10:00:00', artistId: 1 }, 1);

      expect(mockPrisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { customer: true, artist: true },
      });
      expect(tx.bookingHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'SPOSTATO' }) })
      );
    });

    it('should throw 404 when booking not found', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      await expect(bookingService.update(999, {}))
        .rejects.toThrow(new AppError('Prenotazione non trovata', 404, 'NOT_FOUND'));
    });

    it('should throw 404 when booking is soft-deleted', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(bookingRow({ deletedAt: new Date() }));

      await expect(bookingService.update(1, {}))
        .rejects.toThrow(new AppError('Prenotazione non trovata', 404, 'NOT_FOUND'));
    });
  });

  describe('delete', () => {
    it('should soft-delete booking and create refund when deposit exists', async () => {
      const old = bookingRow({ deposit: 50, price: 200, status: 'CONFERMATO' });
      const tx = mockTx();
      tx.booking.findUnique.mockResolvedValue(old);
      tx.transaction.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await bookingService.delete(1, 1);

      expect(tx.booking.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'CANCELLATO', price: 0 },
      });
      expect(tx.bookingHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'CANCELLATO' }) })
      );
      expect(tx.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ type: 'USCITA', category: 'Acconto' }) })
      );
    });

    it('should not create refund if no deposit', async () => {
      const old = bookingRow({ deposit: 0, price: 0 });
      const tx = mockTx();
      tx.booking.findUnique.mockResolvedValue(old);
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await bookingService.delete(1);

      expect(tx.transaction.create).not.toHaveBeenCalled();
    });

    it('should do nothing when booking not found', async () => {
      const tx = mockTx();
      tx.booking.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await bookingService.delete(999);

      expect(tx.booking.update).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    function setupList() {
      mockPrisma.booking.findMany.mockResolvedValue([bookingRow()]);
      mockPrisma.booking.count.mockResolvedValue(1);
      mockPrisma.$transaction.mockImplementation((arg: unknown) =>
        Array.isArray(arg) ? Promise.all(arg) : (arg as Function)()
      );
    }

    function lastWhere() {
      return mockPrisma.booking.findMany.mock.calls.at(-1)![0].where;
    }

    it('excludes ANNULLATO/CANCELLATO when status is ALL', async () => {
      setupList();
      await bookingService.findAll({ month: '2026-07', status: 'ALL' });
      expect(lastWhere().status).toEqual({ notIn: ['ANNULLATO', 'CANCELLATO'] });
    });

    it('filters by explicit status', async () => {
      setupList();
      await bookingService.findAll({ month: '2026-07', status: 'COMPLETATO' });
      expect(lastWhere().status).toBe('COMPLETATO');
    });

    it('does not add status filter when status is absent', async () => {
      setupList();
      await bookingService.findAll({ month: '2026-07' });
      expect(lastWhere().status).toBeUndefined();
    });

    it('builds an OR search over customer and artist', async () => {
      setupList();
      await bookingService.findAll({ month: '2026-07', search: 'rossi' });
      const or = lastWhere().OR;
      expect(Array.isArray(or)).toBe(true);
      expect(or).toEqual(
        expect.arrayContaining([
          { customer: { is: { firstName: { contains: 'rossi', mode: 'insensitive' } } } },
          { artist: { is: { name: { contains: 'rossi', mode: 'insensitive' } } } },
        ])
      );
    });

    it('narrows the month range with startDate/endDate', async () => {
      setupList();
      await bookingService.findAll({ month: '2026-07', startDate: '2026-07-10', endDate: '2026-07-20' });
      const date = lastWhere().date;
      expect(date.gte).toEqual(new Date('2026-07-10'));
      expect(date.lte).toEqual(new Date('2026-07-20T23:59:59.999'));
    });

    it('honors sortOrder on the date column', async () => {
      setupList();
      await bookingService.findAll({ month: '2026-07', sortOrder: 'desc' });
      expect(mockPrisma.booking.findMany.mock.calls.at(-1)![0].orderBy).toEqual({ date: 'desc' });
    });
  });
});
