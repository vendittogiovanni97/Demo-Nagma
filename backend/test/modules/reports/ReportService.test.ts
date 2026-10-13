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

  describe('getArtistRevenue', () => {
    const staffMock = (rows: Array<{ id: number; name: string }>) => {
      (mockPrisma as unknown as { staff: unknown }).staff = {
        findMany: jest.fn().mockResolvedValue(rows.map((r) => ({ ...r, color: '#000000', type: 'COLLABORATORE' }))),
      };
    };
    const booking = (over: Record<string, unknown>) => ({
      date: new Date('2026-10-02T10:00:00Z'),
      status: 'COMPLETATO',
      deposit: 0,
      artist: { isRentPayee: false },
      customer: { firstName: 'Mario', lastName: 'Rossi' },
      ...over,
    });

    it('somma la quota netta dell\'artista, non il prezzo lordo', async () => {
      staffMock([{ id: 1, name: 'Marco' }, { id: 2, name: 'Sara' }]);
      mockPrisma.booking.findMany.mockResolvedValue([
        booking({ id: 101, artistId: 1, price: 200, deposit: 50, formData: { percentualeMode: '70', artistPrice: 140 } }),
        booking({ id: 102, artistId: 1, price: 150, deposit: 30, formData: { percentualeMode: '50', artistPrice: 75 } }),
      ] as never);

      const result = await service.getArtistRevenue({ mode: 'day', day: '2026-10-02' });

      const marco = result.artists.find((a) => a.id === 1);
      expect(marco?.totalRevenue).toBe(215);
      expect(marco?.grossRevenue).toBe(350);
      expect(marco?.studioRevenue).toBe(135);
      expect(marco?.totalDeposits).toBe(80);
      expect(marco?.completedBookingsCount).toBe(2);
      expect(marco?.bookings.map((b) => b.artistShare)).toEqual([140, 75]);

      expect(result.artists.find((a) => a.id === 2)?.totalRevenue).toBe(0);
      expect(result.summary).toMatchObject({ totalRevenue: 215, grossRevenue: 350, studioRevenue: 135, completedBookingsCount: 2 });
    });

    it('all\'affittuario di postazione va il 100% e allo studio 0', async () => {
      staffMock([{ id: 3, name: 'Aniello' }]);
      mockPrisma.booking.findMany.mockResolvedValue([
        booking({ id: 201, artistId: 3, price: 500, formData: { percentualeMode: '100', artistPrice: 0 }, artist: { isRentPayee: true } }),
      ] as never);

      const result = await service.getArtistRevenue({ mode: 'month', year: 2026, month: 10 });

      expect(result.artists[0]).toMatchObject({ totalRevenue: 500, grossRevenue: 500, studioRevenue: 0 });
    });

    it('la quota artista non supera mai il prezzo e senza compenso salvato è 0', async () => {
      staffMock([{ id: 1, name: 'Marco' }]);
      mockPrisma.booking.findMany.mockResolvedValue([
        booking({ id: 301, artistId: 1, price: 100, formData: { artistPrice: 999 } }),
        booking({ id: 302, artistId: 1, price: 100, formData: {} }),
      ] as never);

      const result = await service.getArtistRevenue({ mode: 'day', day: '2026-10-02' });

      expect(result.artists[0]).toMatchObject({ totalRevenue: 100, grossRevenue: 200, studioRevenue: 100 });
    });

    it.each([
      ['giorno in ora legale', { mode: 'day' as const, day: '2026-10-01' }, '2026-09-30T22:00:00.000Z', '2026-10-01T22:00:00.000Z'],
      ['mese a cavallo del cambio d\'ora', { mode: 'month' as const, year: 2026, month: 10 }, '2026-09-30T22:00:00.000Z', '2026-10-31T23:00:00.000Z'],
      ['anno', { mode: 'year' as const, year: 2026 }, '2025-12-31T23:00:00.000Z', '2026-12-31T23:00:00.000Z'],
      ['dicembre', { mode: 'month' as const, year: 2026, month: 12 }, '2026-11-30T23:00:00.000Z', '2026-12-31T23:00:00.000Z'],
    ])('usa la mezzanotte italiana come limite (%s)', async (_label, params, gte, lt) => {
      staffMock([]);
      mockPrisma.booking.findMany.mockResolvedValue([] as never);

      await service.getArtistRevenue(params);

      const where = mockPrisma.booking.findMany.mock.calls[0][0].where;
      expect(where.date.gte.toISOString()).toBe(gte);
      expect(where.date.lt.toISOString()).toBe(lt);
      expect(where.artist).toEqual({ is: { deletedAt: null } });
    });
  });
});
