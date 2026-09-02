import { AppError } from '../../../src/core/shared/errors/AppError';

const createMockPrisma = () => ({
  entrataLibera: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
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
import { EntrataLiberaService } from '../../../src/modules/finance/services/entrataLiberaService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe('EntrataLiberaService', () => {
  let service: EntrataLiberaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EntrataLiberaService();
    // Supporta sia la forma array (findAll) sia la forma callback (create/delete) di $transaction
    mockPrisma.$transaction.mockImplementation((arg: any) =>
      typeof arg === 'function' ? arg(mockPrisma) : Promise.all(arg)
    );
  });

  describe('findAll', () => {
    it('should return paginated incomes', async () => {
      mockPrisma.entrataLibera.findMany.mockResolvedValue([{ id: 1, name: 'Rimborso', amount: 50 }]);
      mockPrisma.entrataLibera.count.mockResolvedValue(1);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      const result = await service.findAll(undefined, 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by month', async () => {
      mockPrisma.entrataLibera.findMany.mockResolvedValue([]);
      mockPrisma.entrataLibera.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      await service.findAll('2026-07', 1, 20);

      expect(mockPrisma.entrataLibera.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ createdAt: expect.any(Object) }) })
      );
    });
  });

  describe('create', () => {
    it('should create income and corresponding transaction', async () => {
      mockPrisma.entrataLibera.create.mockResolvedValue({ id: 1, name: 'Rimborso', amount: 50 });
      mockPrisma.transaction.create.mockResolvedValue({});

      const result = await service.create({ name: 'Rimborso', amount: 50 });

      expect(result.amount).toBe(50);
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'ENTRATA',
          category: 'Entrate Libere',
          description: 'Entrata Libera: Rimborso',
          amount: 50,
        }),
      });
    });
  });

  describe('delete', () => {
    it('should soft-delete income and linked transactions', async () => {
      mockPrisma.entrataLibera.findFirst.mockResolvedValue({ id: 1, name: 'Rimborso' });

      await service.delete(1);

      expect(mockPrisma.entrataLibera.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
      expect(mockPrisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { sourceId: 1, sourceType: 'ENTRATA_LIBERA', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw when income not found', async () => {
      mockPrisma.entrataLibera.findFirst.mockResolvedValue(null);

      await expect(service.delete(999))
        .rejects.toThrow(new AppError('Entrata non trovata', 404, 'NOT_FOUND'));
    });
  });
});
