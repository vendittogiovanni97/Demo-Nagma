const createMockPrisma = () => ({
  savedView: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
});

jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import prisma from '../../../src/core/shared/utils/prisma';
import { SavedViewService } from '../../../src/modules/saved-views/services/savedViewService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe('SavedViewService', () => {
  let service: SavedViewService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SavedViewService();
  });

  describe('getSavedViews', () => {
    it('should return saved views for user and module', async () => {
      const mockViews = [
        { id: 1, userId: 1, module: 'customer', name: 'Vip Customers', isDefault: true },
      ];
      mockPrisma.savedView.findMany.mockResolvedValue(mockViews as any);

      const result = await service.getSavedViews(1, 'customer');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Vip Customers');
    });
  });

  describe('createSavedView', () => {
    it('should create new saved view', async () => {
      const mockCreated = {
        id: 2,
        userId: 1,
        module: 'customer',
        name: 'Recent',
        filters: [],
        isDefault: false,
      };

      mockPrisma.savedView.create.mockResolvedValue(mockCreated as any);

      const result = await service.createSavedView(1, {
        module: 'customer',
        name: 'Recent',
        filters: [],
      });

      expect(result.id).toBe(2);
      expect(result.name).toBe('Recent');
    });
  });

  describe('setDefault', () => {
    it('should reset previous defaults and set target view as default', async () => {
      mockPrisma.savedView.findUnique.mockResolvedValue({ id: 2, userId: 1, module: 'customer' } as any);
      mockPrisma.savedView.updateMany.mockResolvedValue({ count: 1 } as any);
      mockPrisma.savedView.update.mockResolvedValue({ id: 2, userId: 1, isDefault: true } as any);

      const result = await service.setDefault(1, 2);

      expect(result.isDefault).toBe(true);
      expect(mockPrisma.savedView.updateMany).toHaveBeenCalledWith({
        where: { userId: 1, module: 'customer' },
        data: { isDefault: false },
      });
    });
  });
});
