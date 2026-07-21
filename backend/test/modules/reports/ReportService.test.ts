const createMockPrisma = () => ({
  transaction: {
    findMany: jest.fn(),
  },
  booking: {
    count: jest.fn(),
    groupBy: jest.fn(),
    findMany: jest.fn(),
  },
  customer: {
    count: jest.fn(),
  },
  staff: {
    findMany: jest.fn(),
  },
});

jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import prisma from '../../../src/core/shared/utils/prisma';
import { ReportsService } from '../../../src/modules/reports/services/reports.service';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService();
  });

  describe('getSummary', () => {
    it('should aggregate financial, booking and customer metrics correctly', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { amount: 1500, type: 'INCOME' },
        { amount: 300, type: 'EXPENSE' },
      ]);
      const mockBookings = Array(15).fill({ status: 'COMPLETATO' }).concat(Array(5).fill({ status: 'ANNULLATO' }));
      mockPrisma.booking.findMany.mockResolvedValue(mockBookings as any);
      mockPrisma.customer.count.mockResolvedValueOnce(100);
      mockPrisma.customer.count.mockResolvedValueOnce(5);
      mockPrisma.booking.groupBy.mockResolvedValue([
        { staffId: 1, _count: { id: 8 } },
      ]);
      mockPrisma.staff.findMany.mockResolvedValue([
        { id: 1, name: 'Marco Tatuatore' },
      ]);

      const result = await service.getSummary({});

      expect(result.financial.totalRevenue).toBe(1500);
      expect(result.financial.totalExpenses).toBe(300);
      expect(result.financial.netProfit).toBe(1200);
      expect(result.bookings.totalBookings).toBe(20);
      expect(result.bookings.completedBookings).toBe(15);
      expect(result.bookings.completionRate).toBe(75);
    });
  });
});
