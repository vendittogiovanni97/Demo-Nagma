const createMockPrisma = () => ({
  bookingPlacement: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
  booking: {
    findUnique: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

jest.mock('../../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import prisma from '../../../../src/core/shared/utils/prisma';
import { BookingPlacementService } from '../../../../src/modules/newfeature/posizionamento/services/bookingPlacementService';

const mockPrisma = prisma as unknown as any;

describe('BookingPlacementService', () => {
  let service: BookingPlacementService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BookingPlacementService();
    mockPrisma.booking.findUnique.mockResolvedValue({ id: 1, deletedAt: null });
  });

  describe('getPlacementByBookingId', () => {
    it('should return placement when found', async () => {
      mockPrisma.bookingPlacement.findFirst.mockResolvedValue({ id: 'pl-1', bookingId: 1, bodyZone: 'Braccio' });
      const result = await service.getPlacementByBookingId(1);
      expect(result).toEqual({ id: 'pl-1', bookingId: 1, bodyZone: 'Braccio' });
    });

    it('should return null when not found', async () => {
      mockPrisma.bookingPlacement.findFirst.mockResolvedValue(null);
      expect(await service.getPlacementByBookingId(999)).toBeNull();
    });
  });

  describe('savePlacement', () => {
    it('should upsert placement (create new)', async () => {
      mockPrisma.bookingPlacement.upsert.mockResolvedValue({ id: 'pl-1', bookingId: 1, bodyZone: 'Braccio', view: 'FRONT' });

      const result = await service.savePlacement({ bookingId: 1, bodyZone: 'Braccio' });

      expect(result.bodyZone).toBe('Braccio');
      expect(mockPrisma.bookingPlacement.upsert).toHaveBeenCalledWith({
        where: { bookingId: 1 },
        update: expect.any(Object),
        create: expect.objectContaining({ bookingId: 1, bodyZone: 'Braccio', view: 'FRONT' }),
      });
    });

    it('should upsert placement (update existing)', async () => {
      mockPrisma.bookingPlacement.upsert.mockResolvedValue({ id: 'pl-1', bookingId: 1, bodyZone: 'Gamba', view: 'BACK' });

      const result = await service.savePlacement({ bookingId: 1, bodyZone: 'Gamba', view: 'BACK', x: 100, y: 200 });

      expect(result.bodyZone).toBe('Gamba');
    });

    it('should use default view FRONT when not provided', async () => {
      mockPrisma.bookingPlacement.upsert.mockResolvedValue({ bookingId: 1, bodyZone: 'Spalla', view: 'FRONT' });

      await service.savePlacement({ bookingId: 1, bodyZone: 'Spalla' });

      expect(mockPrisma.bookingPlacement.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: expect.objectContaining({ view: 'FRONT' }) })
      );
    });
  });
});
