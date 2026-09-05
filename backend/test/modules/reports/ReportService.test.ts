const createMockPrisma = () => ({
  transaction: {
    findMany: jest.fn(),
    aggregate: jest.fn(),
    count: jest.fn(),
  },
  booking: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  customer: {
    count: jest.fn(),
  },
  $transaction: jest.fn(),
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
      // $transaction([revenueAgg, expensesAgg, transactionCount])
      mockPrisma.$transaction.mockResolvedValue([
        { _sum: { amount: 1500 } },
        { _sum: { amount: 300 } },
        2,
      ]);

      const mockBookings = [
        ...Array(15).fill(null).map((_, i) => ({
          id: i + 1,
          status: 'COMPLETATO',
          price: 100,
          artistId: 1,
          artist: { id: 1, name: 'Marco Tatuatore' },
        })),
        ...Array(5).fill(null).map((_, i) => ({
          id: i + 16,
          status: 'ANNULLATO',
          price: 0,
          artistId: 1,
          artist: { id: 1, name: 'Marco Tatuatore' },
        })),
      ];
      mockPrisma.booking.findMany.mockResolvedValue(mockBookings as any);
      mockPrisma.customer.count.mockResolvedValueOnce(100);
      mockPrisma.customer.count.mockResolvedValueOnce(5);

      const result = await service.getSummary({});

      expect(result.financial.totalRevenue).toBe(1500);
      expect(result.financial.totalExpenses).toBe(300);
      expect(result.financial.netProfit).toBe(1200);
      expect(result.bookings.totalBookings).toBe(20);
      expect(result.bookings.completedBookings).toBe(15);
      expect(result.bookings.completionRate).toBe(75);
      expect(result.customers.totalActiveCustomers).toBe(100);
      expect(result.customers.newCustomersInPeriod).toBe(5);
    });
  });
});
