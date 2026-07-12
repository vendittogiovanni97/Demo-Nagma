import bcryptjs from 'bcryptjs';

const createMockPrisma = () => ({
  config: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import prisma from '../../../src/core/shared/utils/prisma';
import { ConfigService } from '../../../src/modules/config/services/configService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConfigService();
  });

  describe('initializeConfig', () => {
    it('should load config from DB into cache', async () => {
      mockPrisma.config.findMany.mockResolvedValue([
        { paramsKey: 'APP_VERSION', value: '2.0.0' },
        { paramsKey: 'SHOW_CONSENSI', value: 'true' },
      ]);

      await service.initializeConfig(false);

      expect(service.getAppVersionSync()).toBe('2.0.0');
      expect(service.getShowConsensiSync()).toBe(true);
    });

    it('should seed defaults when no config exists and seed=true', async () => {
      mockPrisma.config.findMany.mockResolvedValue([]);
      mockPrisma.config.count.mockResolvedValue(0);
      mockPrisma.config.upsert.mockResolvedValue({});

      await service.initializeConfig(true);

      expect(mockPrisma.config.upsert).toHaveBeenCalled();
    });
  });

  describe('getValue / setValue', () => {
    it('should cache value after first fetch', async () => {
      mockPrisma.config.findFirst.mockResolvedValue({ paramsKey: 'TEST_KEY', value: 'test-val' });

      const result = await service.getValue('TEST_KEY');

      expect(result).toBe('test-val');
      expect(mockPrisma.config.findFirst).toHaveBeenCalledTimes(1);

      const cached = await service.getValue('TEST_KEY');
      expect(cached).toBe('test-val');
      expect(mockPrisma.config.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should return default when config not found', async () => {
      mockPrisma.config.findFirst.mockResolvedValue(null);

      const result = await service.getValue('NONEXISTENT', 'default');
      expect(result).toBe('default');
    });

    it('should set value and clear cache', async () => {
      mockPrisma.config.upsert.mockResolvedValue({});

      await service.setValue('TEST_KEY', 'new-val');

      expect(mockPrisma.config.upsert).toHaveBeenCalledWith({
        where: { paramsKey: 'TEST_KEY' },
        update: { value: 'new-val' },
        create: { paramsKey: 'TEST_KEY', value: 'new-val' },
      });
    });
  });

  describe('getAll', () => {
    it('should return all non-deleted configs', async () => {
      mockPrisma.config.findMany.mockResolvedValue([{ paramsKey: 'A', value: '1' }]);
      expect(await service.getAll()).toHaveLength(1);
    });
  });

  describe('sync getters', () => {
    it('should return defaults when not initialized', () => {
      expect(service.getValueSync('NONEXISTENT', 'fallback')).toBe('fallback');
      expect(service.getMaxPageLimitSync()).toBe(100);
      expect(service.getAppVersionSync()).toBe('1.0.0');
    });
  });

  describe('verifyBookingUpdatePassword', () => {
    it('should return false when password is empty', async () => {
      mockPrisma.config.findFirst.mockResolvedValue(null);

      const result = await service.verifyBookingUpdatePassword('test');
      expect(result).toBe(false);
    });

    it('should hash and verify plain text password', async () => {
      jest.spyOn(bcryptjs, 'hash').mockResolvedValue('$2b$10$hashed' as never);
      jest.spyOn(bcryptjs, 'compare').mockResolvedValue(true as never);

      mockPrisma.config.findFirst.mockResolvedValue({ paramsKey: 'BOOKING_UPDATE_PASSWORD', value: 'plain-pass' });
      mockPrisma.config.upsert.mockResolvedValue({});

      const result = await service.verifyBookingUpdatePassword('plain-pass');
      expect(result).toBe(true);
    });

    it('should verify existing bcrypt password', async () => {
      jest.spyOn(bcryptjs, 'compare').mockResolvedValue(true as never);

      mockPrisma.config.findFirst.mockResolvedValue({
        paramsKey: 'BOOKING_UPDATE_PASSWORD',
        value: '$2b$10$existinghash',
      });

      const result = await service.verifyBookingUpdatePassword('correct');
      expect(result).toBe(true);
    });
  });

  describe('boolean flags', () => {
    it('should parse showConsensi as true', async () => {
      mockPrisma.config.findFirst.mockResolvedValue({ paramsKey: 'SHOW_CONSENSI', value: 'true' });
      expect(await service.getShowConsensi()).toBe(true);
    });

    it('should parse showConsensi as false', async () => {
      mockPrisma.config.findFirst.mockResolvedValue({ paramsKey: 'SHOW_CONSENSI', value: 'false' });
      expect(await service.getShowConsensi()).toBe(false);
    });

    it('should parse showPosizionamento correctly', async () => {
      mockPrisma.config.findFirst.mockResolvedValue({ paramsKey: 'SHOW_POSIZIONAMENTO', value: 'true' });
      expect(await service.getShowPosizionamento()).toBe(true);
    });

    it('should return default phone prefix', async () => {
      mockPrisma.config.findFirst.mockResolvedValue({ paramsKey: 'DEFAULT_PHONE_PREFIX', value: '+1' });
      expect(await service.getDefaultPhonePrefix()).toBe('+1');
    });

    it('should get booking update password', async () => {
      mockPrisma.config.findFirst.mockResolvedValue({ paramsKey: 'BOOKING_UPDATE_PASSWORD', value: 'secret' });
      expect(await service.getBookingUpdatePassword()).toBe('secret');
    });
  });
});
