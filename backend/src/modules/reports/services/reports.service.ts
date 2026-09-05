import { Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import prisma from '../../../core/shared/utils/prisma';
import {
  ReportFilterDto,
  ReportSummaryDto,
  PaginatedReportDetailsDto,
  ReportDetailItemDto,
} from '../types/reports.types';

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
}
