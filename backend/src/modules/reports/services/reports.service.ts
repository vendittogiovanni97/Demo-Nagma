import { Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import prisma from '../../../core/shared/utils/prisma';
import {
  ReportFilterDto,
  ReportSummaryDto,
  PaginatedReportDetailsDto,
  ReportDetailItemDto,
  ArtistRevenueResponseDto,
  ArtistRevenueItemDto,
  ArtistRevenueQuery,
} from '../types/reports.types';
import { todayInZone, zonedDayStart } from '../../../core/shared/utils/date-utils';

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Quota artista salvata nel form prenotazione, limitata al prezzo. */
function artistShareOf(formData: unknown, price: number): number {
  const fd = (formData ?? {}) as Record<string, unknown>;
  const artistPrice = Number(fd.artistPrice);
  if (!Number.isFinite(artistPrice) || artistPrice <= 0) return 0;
  return Math.min(artistPrice, price);
}

export class ReportsService {
  /**
   * Genera le metriche aggregate di riepilogo per il periodo specificato.
   */
  async getSummary(filters: ReportFilterDto): Promise<ReportSummaryDto> {
    const startDate = filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters.endDate ? new Date(filters.endDate + 'T23:59:59.999Z') : new Date();

    // 1. Finanziario: aggregazione server-side (evita di caricare tutti i record in memoria)
    const transactionWhere = { deletedAt: null, date: { gte: startDate, lte: endDate } };
    const [revenueAgg, expensesAgg, transactionCount] = await prisma.$transaction([
      prisma.transaction.aggregate({
        where: { ...transactionWhere, type: 'ENTRATA' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...transactionWhere, type: 'USCITA' },
        _sum: { amount: true },
      }),
      prisma.transaction.count({ where: transactionWhere }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.amount ?? 0);
    const totalExpenses = Number(expensesAgg._sum.amount ?? 0);

    // 2. Booking / Appuntamenti
    const bookingWhere: Prisma.BookingWhereInput = {
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    };
    if (filters.staffId) {
      bookingWhere.artistId = Number(filters.staffId);
    }

    const bookings = await prisma.booking.findMany({
      where: bookingWhere,
      select: {
        id: true,
        status: true,
        price: true,
        artistId: true,
        artist: { select: { id: true, name: true } },
      },
    });

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b) => b.status === 'COMPLETATO').length;
    const cancelledBookings = bookings.filter((b) => b.status === 'ANNULLATO').length;
    const completionRate = totalBookings > 0 ? Number(((completedBookings / totalBookings) * 100).toFixed(1)) : 0;

    // 3. Clienti
    const totalActiveCustomers = await prisma.customer.count({
      where: { deletedAt: null },
    });
    const newCustomersInPeriod = await prisma.customer.count({
      where: {
        deletedAt: null,
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    // 4. Performer Top Staff
    const staffMap = new Map<number, { name: string; count: number; revenue: number }>();
    for (const b of bookings) {
      if (b.artistId && b.artist) {
        const existing = staffMap.get(b.artistId) || { name: b.artist.name, count: 0, revenue: 0 };
        if (b.status === 'COMPLETATO') {
          existing.count += 1;
          if (b.price) existing.revenue += Number(b.price);
        }
        staffMap.set(b.artistId, existing);
      }
    }

    const topStaffPerformers = Array.from(staffMap.entries()).map(([staffId, data]) => ({
      staffId,
      staffName: data.name,
      completedBookingsCount: data.count,
      totalRevenueGenerated: data.revenue,
    })).sort((a, b) => b.totalRevenueGenerated - a.totalRevenueGenerated);

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      financial: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        transactionCount,
      },
      bookings: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        completionRate,
      },
      customers: {
        totalActiveCustomers,
        newCustomersInPeriod,
      },
      topStaffPerformers,
    };
  }

  /**
   * Recupera i dettagli paginati per la griglia AG-Grid.
   */
  async getDetails(filters: ReportFilterDto): Promise<PaginatedReportDetailsDto> {
    const page = filters.page ? Math.max(1, Number(filters.page)) : 1;
    const limit = filters.limit ? Math.max(1, Number(filters.limit)) : 25;
    const skip = (page - 1) * limit;

    const startDate = filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters.endDate ? new Date(filters.endDate + 'T23:59:59.999Z') : new Date();

    const transactionsWhere: Prisma.TransactionWhereInput = {
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    };

    if (filters.search?.trim()) {
      transactionsWhere.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: transactionsWhere,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: transactionsWhere }),
    ]);

    const data: ReportDetailItemDto[] = transactions.map((t) => ({
      id: `TX-${t.id}`,
      date: t.date.toISOString().split('T')[0],
      type: t.type,
      category: t.category,
      description: t.description,
      amount: Number(t.amount),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Esporta il report in formato CSV.
   */
  async exportCsv(filters: ReportFilterDto): Promise<string> {
    const details = await this.getDetails({ ...filters, page: 1, limit: 5000 });
    // Anti CSV/formula injection: neutralizza le celle che iniziano con =,+,-,@,tab,CR
    const cell = (val: unknown): string => {
      let s = String(val ?? '');
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const header = 'ID,Data,Tipo,Categoria,Descrizione,Importo (€)\n';
    const rows = details.data
      .map(
        (item) =>
          `${cell(item.id)},${cell(item.date)},${cell(item.type)},${cell(item.category)},${cell(item.description)},${item.amount}`
      )
      .join('\n');

    return header + rows;
  }

  /**
   * Esporta il report in formato PDF usando PDFKit.
   */
  async exportPdf(filters: ReportFilterDto): Promise<Buffer> {
    const summary = await this.getSummary(filters);
    const details = await this.getDetails({ ...filters, page: 1, limit: 100 });

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header
      doc.fontSize(20).text('REPORT GESTIONALE DEMO-NAGMA', { align: 'center' });
      doc.fontSize(10).text(`Periodo: ${summary.period.startDate} - ${summary.period.endDate}`, { align: 'center' });
      doc.moveDown(2);

      // Riepilogo Finanziario
      doc.fontSize(14).text('1. Riepilogo Finanziario', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Ricavi Totali: €${summary.financial.totalRevenue.toFixed(2)}`);
      doc.text(`Spese Totali: €${summary.financial.totalExpenses.toFixed(2)}`);
      doc.text(`Utile Netto: €${summary.financial.netProfit.toFixed(2)}`);
      doc.moveDown(1.5);

      // Riepilogo Appuntamenti
      doc.fontSize(14).text('2. Statistiche Appuntamenti', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Appuntamenti Totali: ${summary.bookings.totalBookings}`);
      doc.text(`Completati: ${summary.bookings.completedBookings}`);
      doc.text(`Cancellati: ${summary.bookings.cancelledBookings}`);
      doc.text(`Tasso di Completamento: ${summary.bookings.completionRate}%`);
      doc.moveDown(1.5);

      // Tabella Dettagli principali
      doc.fontSize(14).text('3. Ultimi Movimenti Finanziari', { underline: true });
      doc.moveDown(0.5);

      details.data.slice(0, 20).forEach((item) => {
        doc.fontSize(9).text(`${item.date} | ${item.type} | ${item.category} | ${item.description} | €${item.amount.toFixed(2)}`);
      });

      doc.end();
    });
  }

  /**
   * Fatturato netto per artista sulle prenotazioni COMPLETATE del periodo.
   * La quota artista segue la stessa regola dei compensi registrati al completamento
   * (`formData.artistPrice`), mentre l'affittuario di postazione incassa il 100%.
   * I limiti del periodo sono mezzanotti nel fuso dello studio, non in UTC.
   */
  async getArtistRevenue(params: ArtistRevenueQuery): Promise<ArtistRevenueResponseDto> {
    const today = todayInZone();
    const [todayYear, todayMonth] = today.split('-').map(Number);
    const mode = params.mode ?? (params.day ? 'day' : 'month');
    const year = params.year ?? todayYear;
    const month = params.month ?? todayMonth;
    let targetDayStr: string | undefined;

    const dayStart = (isoDay: string, offsetDays = 0) => {
      const [y, m, d] = isoDay.split('-').map(Number);
      return zonedDayStart(y, m, d + offsetDays);
    };

    let startDate: Date;
    let endExclusive: Date;
    if (mode === 'day') {
      targetDayStr = params.day ?? today;
      startDate = dayStart(targetDayStr);
      endExclusive = dayStart(targetDayStr, 1);
    } else if (mode === 'year') {
      startDate = zonedDayStart(year, 1, 1);
      endExclusive = zonedDayStart(year + 1, 1, 1);
    } else if (mode === 'custom' && params.startDate && params.endDate) {
      startDate = dayStart(params.startDate);
      endExclusive = dayStart(params.endDate, 1);
    } else {
      startDate = zonedDayStart(year, month, 1);
      endExclusive = zonedDayStart(year, month + 1, 1);
    }

    const [staffMembers, bookings] = await Promise.all([
      prisma.staff.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, color: true, type: true },
      }),
      prisma.booking.findMany({
        where: {
          deletedAt: null,
          status: 'COMPLETATO',
          // Gli artisti eliminati non hanno una card: escluderli tiene il riepilogo
          // uguale alla somma delle card.
          artist: { is: { deletedAt: null } },
          date: { gte: startDate, lt: endExclusive },
        },
        select: {
          id: true,
          artistId: true,
          price: true,
          deposit: true,
          date: true,
          status: true,
          formData: true,
          artist: { select: { isRentPayee: true } },
          customer: { select: { firstName: true, lastName: true } },
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    type ArtistStat = {
      totalRevenue: number;
      grossRevenue: number;
      studioRevenue: number;
      totalDeposits: number;
      completedCount: number;
      bookingsList: ArtistRevenueItemDto['bookings'];
    };
    const emptyStat = (): ArtistStat => ({
      totalRevenue: 0,
      grossRevenue: 0,
      studioRevenue: 0,
      totalDeposits: 0,
      completedCount: 0,
      bookingsList: [],
    });
    const statsByArtist = new Map<number, ArtistStat>(staffMembers.map((s) => [s.id, emptyStat()]));
    const salon = emptyStat();

    for (const b of bookings) {
      if (!b.artistId) continue;
      const stat = statsByArtist.get(b.artistId);
      if (!stat) continue;

      const price = Number(b.price ?? 0);
      const deposit = Number(b.deposit ?? 0);
      const artistShare = b.artist?.isRentPayee ? price : artistShareOf(b.formData, price);
      const studioShare = price - artistShare;

      for (const target of [stat, salon]) {
        target.totalRevenue += artistShare;
        target.grossRevenue += price;
        target.studioRevenue += studioShare;
        target.totalDeposits += deposit;
        target.completedCount += 1;
      }
      stat.bookingsList.push({
        id: b.id,
        date: b.date.toISOString(),
        customerName: `${b.customer?.firstName ?? ''} ${b.customer?.lastName ?? ''}`.trim() || 'Cliente sconosciuto',
        price,
        artistShare: round2(artistShare),
        deposit,
        status: b.status,
      });
    }

    const artists: ArtistRevenueItemDto[] = staffMembers.map((staff) => {
      const stat = statsByArtist.get(staff.id) ?? emptyStat();
      return {
        id: staff.id,
        name: staff.name,
        color: staff.color,
        type: staff.type,
        totalRevenue: round2(stat.totalRevenue),
        grossRevenue: round2(stat.grossRevenue),
        studioRevenue: round2(stat.studioRevenue),
        totalDeposits: round2(stat.totalDeposits),
        completedBookingsCount: stat.completedCount,
        averageTicket: stat.completedCount > 0 ? round2(stat.grossRevenue / stat.completedCount) : 0,
        revenueShare: salon.totalRevenue > 0 ? Number(((stat.totalRevenue / salon.totalRevenue) * 100).toFixed(1)) : 0,
        bookings: stat.bookingsList,
      };
    });
    artists.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      period: {
        mode,
        startDate: startDate.toISOString(),
        endDate: new Date(endExclusive.getTime() - 1).toISOString(),
        year,
        month,
        day: targetDayStr,
      },
      summary: {
        totalRevenue: round2(salon.totalRevenue),
        grossRevenue: round2(salon.grossRevenue),
        studioRevenue: round2(salon.studioRevenue),
        totalDeposits: round2(salon.totalDeposits),
        completedBookingsCount: salon.completedCount,
        averageTicket: salon.completedCount > 0 ? round2(salon.grossRevenue / salon.completedCount) : 0,
      },
      artists,
    };
  }
}

