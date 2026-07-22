import bcrypt from 'bcryptjs';
import { AppError } from '../../../src/core/shared/errors/AppError';

const createMockPrisma = () => ({
  staff: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  shift: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
    update: jest.fn(),
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
import { StaffService } from '../../../src/modules/staff/services/staffService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe('StaffService', () => {
  let service: StaffService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StaffService();
  });

  describe('searchMembers', () => {
    it('should return paginated members', async () => {
      mockPrisma.staff.findMany.mockResolvedValue([{ id: 1, name: 'Tizio' }]);
      mockPrisma.staff.count.mockResolvedValue(1);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      const result = await service.searchMembers({ search: 'Tizio', page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by type', async () => {
      mockPrisma.staff.findMany.mockResolvedValue([]);
      mockPrisma.staff.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      await service.searchMembers({ type: 'ARTIST', page: 1, limit: 20 });

      expect(mockPrisma.staff.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ type: 'COLLABORATORE' }) })
      );
    });
  });

  describe('listAllMembers', () => {
    it('should return all non-deleted members', async () => {
      mockPrisma.staff.findMany.mockResolvedValue([{ id: 1, name: 'Tizio' }]);
      const result = await service.listAllMembers();
      expect(result).toHaveLength(1);
    });
  });

  describe('getMemberById', () => {
    it('should return member when found', async () => {
      mockPrisma.staff.findFirst.mockResolvedValue({ id: 1, name: 'Tizio' });
      expect(await service.getMemberById(1)).toEqual({ id: 1, name: 'Tizio' });
    });

    it('should return null when not found', async () => {
      mockPrisma.staff.findFirst.mockResolvedValue(null);
      expect(await service.getMemberById(999)).toBeNull();
    });
  });

  describe('createMember', () => {
    it('should create member with default color', async () => {
      mockPrisma.staff.create.mockResolvedValue({ id: 1, name: 'Tizio', color: '#00bfff' });
      const result = await service.createMember({ name: 'Tizio', type: 'ARTIST' });
      expect(mockPrisma.staff.create).toHaveBeenCalledWith({
        data: { name: 'Tizio', type: 'ARTIST', color: '#00bfff' },
      });
    });
  });

  describe('updateMember', () => {
    it('should update member', async () => {
      mockPrisma.staff.update.mockResolvedValue({ id: 1, name: 'Updated' });
      expect(await service.updateMember(1, { name: 'Updated' })).toEqual({ id: 1, name: 'Updated' });
    });
  });

  describe('deleteMember', () => {
    it('should soft-delete member', async () => {
      await service.deleteMember(1);
      expect(mockPrisma.staff.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('listShifts', () => {
    it('should return all shifts when no weekStart', async () => {
      mockPrisma.shift.findMany.mockResolvedValue([{ id: 's1', staff: { name: 'Tizio' } }]);
      const result = await service.listShifts();
      expect(result).toHaveLength(1);
    });

    it('should filter by week range when weekStart provided', async () => {
      mockPrisma.shift.findMany.mockResolvedValue([]);
      await service.listShifts('2026-07-13');
      expect(mockPrisma.shift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { date: expect.objectContaining({ gte: expect.any(Date), lte: expect.any(Date) }) } })
      );
    });
  });

  describe('getStaffShifts', () => {
    it('should return shifts for a specific staff', async () => {
      mockPrisma.shift.findMany.mockResolvedValue([{ id: 's1', staffId: 1 }]);
      const result = await service.getStaffShifts(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('createShift', () => {
    it('should create shift with label', async () => {
      mockPrisma.shift.findMany.mockResolvedValue([]);
      mockPrisma.shift.create.mockResolvedValue({ id: 's1', staffId: 1, date: new Date('2026-07-15'), startTime: '09:00', endTime: '13:00', staff: {} });

      const result = await service.createShift({ staffId: 1, date: new Date('2026-07-15'), label: 'Mattina' });

      expect(result.startTime).toBe('09:00');
    });

    it('should throw on time conflict', async () => {
      mockPrisma.shift.findMany.mockResolvedValue([{ startTime: '09:00', endTime: '13:00' }]);

      await expect(service.createShift({ staffId: 1, date: new Date('2026-07-15'), label: 'Mattina' }))
        .rejects.toThrow(new AppError('Conflitto orario rilevato per questo staff nel giorno specificato', 409));
    });

    it('should throw when missing date and weekStart', async () => {
      mockPrisma.shift.findMany.mockResolvedValue([]);

      await expect(service.createShift({ staffId: 1 }))
        .rejects.toThrow(new AppError('Data o weekStart/dayOfWeek obbligatori', 400));
    });
  });

  describe('updateShift', () => {
    it('should update shift data', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({ id: 's1', date: new Date(), startTime: '09:00', endTime: '13:00' });
      mockPrisma.shift.update.mockResolvedValue({ id: 's1', startTime: '10:00', staff: {} });

      const result = await service.updateShift('s1', { startTime: '10:00' });

      expect(result.startTime).toBe('10:00');
    });

    it('should throw when shift not found', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue(null);

      await expect(service.updateShift('s999', {}))
        .rejects.toThrow(new AppError('Turno non trovato', 404));
    });
  });

  describe('deleteShift', () => {
    it('should delete shift', async () => {
      await service.deleteShift('s1');
      expect(mockPrisma.shift.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
    });
  });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 1 });
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      await service.resetPassword(1, { newPassword: 'new123' });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'hashed' },
      });
    });

    it('should throw when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.resetPassword(999, { newPassword: 'x' }))
        .rejects.toThrow(new AppError('Utente non trovato.', 404));
    });
  });
});
