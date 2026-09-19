import bcrypt from 'bcryptjs';

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
    findMany: jest.fn(),
    create: jest.fn(),
  },
  config: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
  staff: {
    findMany: jest.fn(),
  },
  clientConfig: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
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
    $queryRaw: jest.fn().mockResolvedValue([]),
    $executeRaw: jest.fn().mockResolvedValue(0),
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
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    staff: {
      findUnique: jest.fn(),
    },
  };
}

describe('BookingService', () => {
  let bookingService: BookingService;

  beforeEach(() => {
    jest.clearAllMocks();
    bookingService = new BookingService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('should create booking when no conflict', async () => {
      const tx = mockTx();
      // l'advisory lock usa $executeRaw; $queryRaw risponde alla sola query conflitti
      tx.$queryRaw.mockResolvedValueOnce([]);
      tx.booking.create.mockResolvedValue(bookingRow());
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      const result = await bookingService.create({
        customerId: 1,
        artistId: 1,
        date: '2026-07-15T10:00:00',
        duration: 120,
      }, 1);

      expect(tx.$queryRaw).toHaveBeenCalled();
      expect(tx.booking.create).toHaveBeenCalled();
      expect(tx.bookingHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'CREATO' }) })
      );
      expect(result.id).toBe(1);
    });

    it('should throw 409 on conflict', async () => {
      const tx = mockTx();
      // prima chiamata: advisory lock, seconda: conflitto trovato
      tx.$queryRaw.mockResolvedValueOnce([{ id: 42 }]);
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

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

      const tx = mockTx();
      // prima chiamata: advisory lock, seconda: nessun conflitto
      tx.$queryRaw.mockResolvedValueOnce([]);
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

    it('records only the additional deposit using the payment date', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-05T09:30:00Z'));
      const old = bookingRow({ deposit: 50, price: 300 });
      mockPrisma.booking.findUnique.mockResolvedValue(old);
      const tx = mockTx();
      tx.booking.update.mockResolvedValue({ ...old, deposit: 100 });
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await bookingService.update(1, { deposit: 100 }, 1);

      expect(tx.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'ENTRATA',
          amount: 50,
          date: new Date('2026-08-05T09:30:00Z'),
          sourceType: 'BOOKING_DEPOSIT',
        }),
      });
      jest.useRealTimers();
    });

    it('records a partial refund when the cumulative deposit decreases', async () => {
      const old = bookingRow({ deposit: 100, price: 300 });
      mockPrisma.booking.findUnique.mockResolvedValue(old);
      const tx = mockTx();
      tx.booking.update.mockResolvedValue({ ...old, deposit: 60 });
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await bookingService.update(1, { deposit: 60 }, 1);

      expect(tx.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'USCITA',
          amount: 40,
          sourceType: 'BOOKING_DEPOSIT_REFUND',
        }),
      });
    });

    it('records the final balance using the completion date', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-20T16:00:00Z'));
      const old = bookingRow({ deposit: 100, price: 300, status: 'CONFERMATO' });
      mockPrisma.booking.findUnique.mockResolvedValue(old);
      const tx = mockTx();
      tx.booking.update.mockResolvedValue({ ...old, status: 'COMPLETATO' });
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await bookingService.update(1, { status: 'COMPLETATO' }, 1);

      expect(tx.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'ENTRATA',
          amount: 200,
          date: new Date('2026-08-20T16:00:00Z'),
          sourceType: 'BOOKING',
        }),
      });
      jest.useRealTimers();
    });

    it('records the outstanding deposit refund when update annuls the booking', async () => {
      const old = bookingRow({ deposit: 80, price: 300, status: 'CONFERMATO' });
      mockPrisma.booking.findUnique.mockResolvedValue(old);
      const tx = mockTx();
      tx.booking.update.mockResolvedValue({ ...old, status: 'ANNULLATO' });
      tx.transaction.findMany.mockResolvedValue([]);
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await bookingService.update(1, { status: 'ANNULLATO' }, 1);

      expect(tx.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'USCITA',
          amount: 80,
          sourceType: 'BOOKING_REFUND',
        }),
      });
    });
  });

  describe('verifyPassword', () => {
    const PASSWORD = 'nagmatatto12';

    it.each([['$2a$'], ['$2b$'], ['$2y$']])(
      'accetta la password con hash che inizia per %s',
      async (prefisso) => {
        const hash = bcrypt.hashSync(PASSWORD, 10).replace(/^\$2[aby]\$/, prefisso);
        mockPrisma.clientConfig.findFirst.mockResolvedValue({ id: 1, bookingUpdatePassword: hash });

        await expect(bookingService.verifyPassword(PASSWORD)).resolves.toBeUndefined();
        // Un hash gia' cifrato non va ri-cifrato: lo renderebbe inservibile.
        expect(mockPrisma.clientConfig.update).not.toHaveBeenCalled();
      }
    );

    it('rifiuta una password errata', async () => {
      const hash = bcrypt.hashSync(PASSWORD, 10);
      mockPrisma.clientConfig.findFirst.mockResolvedValue({ id: 1, bookingUpdatePassword: hash });

      await expect(bookingService.verifyPassword('sbagliata')).rejects.toThrow('Password non corretta');
    });

    it('migra a hash un valore storico salvato in chiaro', async () => {
      mockPrisma.clientConfig.findFirst.mockResolvedValue({ id: 1, bookingUpdatePassword: PASSWORD });

      await expect(bookingService.verifyPassword(PASSWORD)).resolves.toBeUndefined();
      expect(mockPrisma.clientConfig.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft-delete booking and create refund when deposit exists', async () => {
      const old = bookingRow({ deposit: 50, price: 200, status: 'CONFERMATO' });
      const tx = mockTx();
      tx.booking.findUnique.mockResolvedValue(old);
      tx.transaction.findMany.mockResolvedValue([]);
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await bookingService.delete(1, 1);

      expect(tx.booking.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'CANCELLATO', price: 0, deletedAt: expect.any(Date) },
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

    it('should not duplicate a cancellation refund already recorded', async () => {
      const old = bookingRow({ deposit: 50, price: 200 });
      const tx = mockTx();
      tx.booking.findUnique.mockResolvedValue(old);
      tx.transaction.findMany.mockResolvedValue([{ amount: 50 }]);
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await bookingService.delete(1);

      expect(tx.transaction.create).not.toHaveBeenCalled();
    });

    it('should throw 404 when booking not found or soft-deleted', async () => {
      const tx = mockTx();
      tx.booking.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await expect(bookingService.delete(999)).rejects.toThrow('Prenotazione non trovata');
    });
  });

  describe('annul', () => {
    it('records the refund of the remaining deposit', async () => {
      const old = bookingRow({ deposit: 30, price: 200 });
      const tx = mockTx();
      tx.booking.findUnique.mockResolvedValue(old);
      tx.transaction.findMany.mockResolvedValue([]);
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await bookingService.annul(1, 1);

      expect(tx.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'USCITA',
          amount: 30,
          sourceType: 'BOOKING_REFUND',
        }),
      });
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

    it('does not filter by status when status is ALL', async () => {
      setupList();
      await bookingService.findAll({ month: '2026-07', status: 'ALL' });
      expect(lastWhere().status).toBeUndefined();
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

  describe('Kanban methods', () => {
    it('fetches today kanban bookings with calculated balance and kanbanStage', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([
        bookingRow({
          id: 10,
          status: 'CREATO',
          price: 200,
          deposit: 50,
          formData: { kanbanStage: 'IN_ATTESA' },
        }),
      ]);

      const res = await bookingService.getTodayKanbanBookings('2026-08-28');
      expect(res).toHaveLength(1);
      expect(res[0].kanbanStage).toBe('IN_ATTESA');
      expect(res[0].price).toBe(200);
      expect(res[0].deposit).toBe(50);
      expect(res[0].outstandingBalance).toBe(150);
    });

    it('updates kanban status and changes booking status appropriately', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(
        bookingRow({ id: 10, status: 'CREATO', formData: null })
      );
      const tx = mockTx();
      tx.booking.update.mockImplementation((args: any) =>
        Promise.resolve(
          bookingRow({
            id: 10,
            status: args.data.status,
            formData: args.data.formData,
          })
        )
      );
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      const res = await bookingService.updateKanbanStatus(10, 'IN_SEDUTA', 1);
      expect(res.kanbanStage).toBe('IN_SEDUTA');
      expect(res.status).toBe('CONFERMATO');
      expect(tx.bookingHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'CONFERMATO' }) })
      );
    });

    it('records the balance transaction atomically when kanban completes the booking', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-28T15:00:00Z'));
      mockPrisma.booking.findUnique.mockResolvedValue(
        bookingRow({ id: 10, status: 'CONFERMATO', price: 300, deposit: 100, formData: null })
      );
      const tx = mockTx();
      tx.booking.update.mockResolvedValue(
        bookingRow({ id: 10, status: 'COMPLETATO', price: 300, deposit: 100 })
      );
      tx.transaction.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      const res = await bookingService.updateKanbanStatus(10, 'SALDATO', 1);

      expect(res.status).toBe('COMPLETATO');
      // (Audit H2) Il saldo deve essere creato DENTRO la transazione (tx), non su prisma globale
      expect(tx.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'ENTRATA',
          amount: 200,
          sourceType: 'BOOKING',
          date: new Date('2026-08-28T15:00:00Z'),
        }),
      });
      expect(mockPrisma.transaction.create).not.toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('does not duplicate the balance transaction when booking is already completed', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(
        bookingRow({ id: 10, status: 'COMPLETATO', price: 300, deposit: 100, formData: null })
      );
      const tx = mockTx();
      tx.booking.update.mockResolvedValue(
        bookingRow({ id: 10, status: 'COMPLETATO', price: 300, deposit: 100 })
      );
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await bookingService.updateKanbanStatus(10, 'SALDATO', 1);

      expect(tx.transaction.create).not.toHaveBeenCalled();
    });
  });
});
