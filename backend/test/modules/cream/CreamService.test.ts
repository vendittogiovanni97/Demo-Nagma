const createMockPrisma = () => ({
  creamTattoo: {
    findFirst: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  creamSale: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    updateMany: jest.fn(),
  },
  staff: {
    findMany: jest.fn(),
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
import { CreamService } from '../../../src/modules/cream/services/CreamService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe('CreamService', () => {
  let service: CreamService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CreamService();
  });

  describe('findActive', () => {
    it('should return active cream', async () => {
      mockPrisma.creamTattoo.findFirst.mockResolvedValue({ id: 1, name: 'Aftercare', isActive: true });
      const result = await service.findActive();
      expect(result).toEqual({ id: 1, name: 'Aftercare', isActive: true });
    });

    it('should return null when no active cream', async () => {
      mockPrisma.creamTattoo.findFirst.mockResolvedValue(null);
      expect(await service.findActive()).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return cream by id', async () => {
      mockPrisma.creamTattoo.findFirst.mockResolvedValue({ id: 1, name: 'Balm' });
      expect(await service.findById(1)).toEqual({ id: 1, name: 'Balm' });
    });
  });

  describe('create', () => {
    it('should deactivate existing when creating active cream', async () => {
      mockPrisma.creamTattoo.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.creamTattoo.create.mockResolvedValue({ id: 1, name: 'New Cream', isActive: true });

      const result = await service.create({ name: 'New Cream', isActive: true });

      expect(mockPrisma.creamTattoo.updateMany).toHaveBeenCalledWith({
        where: { isActive: true },
        data: { isActive: false },
      });
      expect(result.name).toBe('New Cream');
    });

    it('should create inactive cream without deactivating others', async () => {
      mockPrisma.creamTattoo.create.mockResolvedValue({ id: 2, name: 'Inactive', isActive: false });

      const result = await service.create({ name: 'Inactive', isActive: false });

      expect(mockPrisma.creamTattoo.updateMany).not.toHaveBeenCalled();
      expect(result.isActive).toBe(false);
    });
  });

  describe('createSale', () => {
    it('should create sale record', async () => {
      mockPrisma.creamSale.create.mockResolvedValue({ id: 1, creamId: 1, artistId: 1, quantity: 2, artist: {} });

      const result = await service.createSale({ creamId: 1, artistId: 1, quantity: 2 });

      expect(result.id).toBe(1);
    });
  });

  describe('deleteSale', () => {
    it('should soft-delete a sale', async () => {
      mockPrisma.creamSale.updateMany.mockResolvedValue({ count: 1 });

      await service.deleteSale(7);

      expect(mockPrisma.creamSale.updateMany).toHaveBeenCalledWith({
        where: { id: 7, deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should reject a missing or already deleted sale', async () => {
      mockPrisma.creamSale.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.deleteSale(99)).rejects.toThrow('Vendita crema non trovata.');
    });
  });

  describe('findSalesByCreamPaged', () => {
    it('should return paginated sales', async () => {
      mockPrisma.creamSale.findMany.mockResolvedValue([{ id: 1, quantity: 2 }]);
      mockPrisma.creamSale.count.mockResolvedValue(1);
      mockPrisma.creamSale.aggregate.mockResolvedValue({ _sum: { quantity: 2 } });
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      const result = await service.findSalesByCreamPaged(1, 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalQuantity).toBe(2);
    });

    it('should filter by date range', async () => {
      mockPrisma.creamSale.findMany.mockResolvedValue([]);
      mockPrisma.creamSale.count.mockResolvedValue(0);
      mockPrisma.creamSale.aggregate.mockResolvedValue({ _sum: { quantity: null } });
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      await service.findSalesByCreamPaged(1, 1, 20, { startDate: '2026-01-01', endDate: '2026-12-31' });

      expect(mockPrisma.creamSale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ soldAt: expect.any(Object) }) })
      );
    });
  });

  describe('getSalesSummary', () => {
    it('should return aggregated sales per artist', async () => {
      mockPrisma.staff.findMany.mockResolvedValue([
        { id: 1, name: 'Tizio', color: '#000', type: 'ARTIST', _count: { creamSales: 2 }, creamSales: [{ quantity: 1 }, { quantity: 3 }] },
      ]);

      const result = await service.getSalesSummary();

      expect(result).toHaveLength(1);
      expect(result[0].totalQuantity).toBe(4);
      expect(result[0].totalSales).toBe(2);
    });
  });
});
