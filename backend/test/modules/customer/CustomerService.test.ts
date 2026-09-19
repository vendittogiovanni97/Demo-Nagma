const createMockPrisma = () => ({
  customer: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  booking: {
    aggregate: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import prisma from '../../../src/core/shared/utils/prisma';
import { CustomerService } from '../../../src/modules/customer/services/customerService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new CustomerService();
  });

  describe('search', () => {
    it('should search customers with pagination', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([{ id: 1, firstName: 'Mario', lastName: 'Rossi', _count: { bookings: 3 } }]);
      mockPrisma.customer.count.mockResolvedValue(1);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      const result = await service.search({ search: 'Mario', page: '1', limit: '20' });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    // I campi Dal/Al della pagina Clienti venivano inviati al server e ignorati:
    // l'elenco restava invariato qualunque intervallo si impostasse.
    it('filtra per data di iscrizione quando è indicato un intervallo', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);
      mockPrisma.customer.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      await service.search({ startDate: '2026-07-01', endDate: '2026-07-31' });

      const where = mockPrisma.customer.findMany.mock.calls.at(-1)![0].where;
      expect(where.createdAt.gte).toEqual(new Date('2026-07-01'));
      expect(where.createdAt.lte).toEqual(new Date('2026-07-31T23:59:59.999'));
    });

    it('non applica alcun filtro data senza intervallo', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);
      mockPrisma.customer.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      await service.search({ search: 'Mario' });

      const where = mockPrisma.customer.findMany.mock.calls.at(-1)![0].where;
      expect(where.createdAt).toBeUndefined();
    });

    it('should handle empty search query', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);
      mockPrisma.customer.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      const result = await service.search({});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getById', () => {
    it('should return customer when found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 1, firstName: 'Mario', bookings: [] });
      const result = await service.getById(1);
      expect(result).toEqual({ id: 1, firstName: 'Mario', bookings: [] });
    });

    it('should return null when not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      const result = await service.getById(999);
      expect(result).toBeNull();
    });
  });

  describe('getSummary', () => {
    it('should return customer summary with aggregated data', async () => {
      const customer = { id: 1, firstName: 'Mario', lastName: 'Rossi', phone: '+39 123' };
      mockPrisma.customer.findFirst.mockResolvedValue(customer);
      mockPrisma.booking.aggregate.mockResolvedValue({ _sum: { price: { toNumber: () => 500 } } });
      mockPrisma.booking.findMany.mockResolvedValue([
        { date: new Date(), status: 'COMPLETATO', price: { toNumber: () => 300 }, artist: { name: 'Tizio' } },
      ]);
      mockPrisma.booking.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      const result = await service.getSummary(1);

      expect(result).toMatchObject({ firstName: 'Mario', totalSpent: 500, upcomingBookings: 0 });
    });

    it('should return null when customer not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      const result = await service.getSummary(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createData = { firstName: 'Mario', lastName: 'Rossi', phone: '+39 123', email: 'mario@test.it' };

    it('should create customer when no duplicates exist', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      mockPrisma.customer.create.mockResolvedValue({ id: 1, ...createData });

      const result = await service.create(createData);

      expect(result).toEqual({ id: 1, ...createData });
    });

    it('should allow a phone already used by another customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      mockPrisma.customer.create.mockResolvedValue({ id: 3, ...createData });

      await service.create(createData);

      expect(mockPrisma.customer.findFirst).not.toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ phone: createData.phone }) })
      );
    });

    it('should throw when name already exists', async () => {
      mockPrisma.customer.findFirst.mockResolvedValueOnce({ id: 2, firstName: 'Mario', lastName: 'Rossi' });

      await expect(service.create(createData)).rejects.toThrow('Un cliente con nome "Mario Rossi" esiste già.');
    });
  });

  describe('update', () => {
    it('should update customer data', async () => {
      mockPrisma.customer.findFirst
        .mockResolvedValueOnce({ id: 1, firstName: 'Old', lastName: 'Name', deletedAt: null })
        .mockResolvedValueOnce(null);
      mockPrisma.customer.update.mockResolvedValue({ id: 1, firstName: 'Updated' });

      const result = await service.update(1, { firstName: 'Updated' });

      expect(result).toEqual({ id: 1, firstName: 'Updated' });
    });

    it('should allow updating to a phone already used by another customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValueOnce({ id: 1, firstName: 'Mario', lastName: 'Rossi', deletedAt: null });
      mockPrisma.customer.update.mockResolvedValue({ id: 1, phone: '+39 999' });

      const result = await service.update(1, { phone: '+39 999' });

      expect(result).toEqual({ id: 1, phone: '+39 999' });
    });

    it('should throw when name conflicts with another customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValueOnce({ id: 1, firstName: 'Mario', lastName: 'Rossi', deletedAt: null });
      mockPrisma.customer.findFirst.mockResolvedValueOnce({ id: 2, firstName: 'Mario', lastName: 'Rossi', deletedAt: null });

      await expect(service.update(1, { firstName: 'Mario', lastName: 'Rossi' }))
        .rejects.toThrow('Un altro cliente si chiama già "Mario Rossi".');
    });
  });

  describe('delete', () => {
    it('should soft-delete customer', async () => {
      mockPrisma.customer.updateMany.mockResolvedValue({ count: 1 });
      await service.delete(1);
      expect(mockPrisma.customer.updateMany).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
