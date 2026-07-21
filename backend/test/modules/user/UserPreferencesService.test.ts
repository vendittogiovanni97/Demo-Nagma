const createMockPrisma = () => ({
  userPreference: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
});

jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import prisma from '../../../src/core/shared/utils/prisma';
import { UserPreferencesService } from '../../../src/modules/user/services/userPreferencesService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserPreferencesService();
  });

  describe('getPreferences', () => {
    it('should upsert and return user preferences', async () => {
      const mockPref = {
        id: 1,
        userId: 10,
        language: 'it',
        timezone: 'Europe/Rome',
        dateFormat: 'DD/MM/YYYY',
        itemsPerPage: 25,
        emailNotifications: true,
        inAppNotifications: true,
      };

      mockPrisma.userPreference.upsert.mockResolvedValue(mockPref as any);

      const result = await service.getPreferences(10);

      expect(result.language).toBe('it');
      expect(result.itemsPerPage).toBe(25);
      expect(mockPrisma.userPreference.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 10 } })
      );
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences with new data', async () => {
      const mockUpdated = {
        id: 1,
        userId: 10,
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        itemsPerPage: 50,
        emailNotifications: false,
        inAppNotifications: true,
      };

      mockPrisma.userPreference.upsert.mockResolvedValue(mockUpdated as any);

      const result = await service.updatePreferences(10, {
        language: 'en',
        timezone: 'UTC',
        itemsPerPage: 50,
      });

      expect(result.language).toBe('en');
      expect(result.timezone).toBe('UTC');
      expect(result.itemsPerPage).toBe(50);
    });
  });
});
