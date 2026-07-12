import { AppError } from '../../../src/core/shared/errors/AppError';

const createMockPrisma = () => ({
  spesaLibera: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
    updateMany: jest.fn(),
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
import { SpesaLiberaService } from '../../../src/modules/finance/services/spesaLiberaService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe('SpesaLiberaService', () => {
  let service: SpesaLiberaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SpesaLiberaService();
  });

  describe('findAll', () => {
    it('should return paginated expenses', async () => {
      mockPrisma.spesaLibera.findMany.mockResolvedValue([{ id: 1, name: 'Carta', price: 10 }]);
      mockPrisma.spesaLibera.count.mockResolvedValue(1);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      const result = await service.findAll(undefined, 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by month', async () => {
      mockPrisma.spesaLibera.findMany.mockResolvedValue([]);
      mockPrisma.spesaLibera.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      await service.findAll('2026-07', 1, 20);

      expect(mockPrisma.spesaLibera.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ createdAt: expect.any(Object) }) })
      );
    });
  });

  describe('create', () => {
    it('should create expense and corresponding transaction', async () => {
      mockPrisma.spesaLibera.create.mockResolvedValue({ id: 1, name: 'Carta', price: 10 });
      mockPrisma.transaction.create.mockResolvedValue({});

      const result = await service.create({ name: 'Carta', price: 10 });

      expect(result.price).toBe(10);
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'EXPENSE',
          category: 'Spese Libere',
          description: 'Spesa Libera: Carta',
          amount: 10,
        }),
      });
    });
  });

  describe('delete', () => {
    it('should soft-delete expense and linked transactions', async () => {
      mockPrisma.spesaLibera.findUnique.mockResolvedValue({ id: 1, name: 'Carta' });

      await service.delete(1);

      expect(mockPrisma.spesaLibera.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
      expect(mockPrisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { sourceId: 1, sourceType: 'SPESA_LIBERA', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw when expense not found', async () => {
      mockPrisma.spesaLibera.findUnique.mockResolvedValue(null);

      await expect(service.delete(999))
        .rejects.toThrow(new AppError('Spesa non trovata', 404, 'NOT_FOUND'));
    });
  });
});
