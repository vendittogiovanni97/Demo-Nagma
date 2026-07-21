import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import prisma from '../../../core/shared/utils/prisma';
import { ExportRequestDto, ExportColumnDto } from '../types/export.types';

export class ExportService {
  /**
   * Risolve i dati dall'entità Prisma oppure usa quelli trasmessi.
   */
  async resolveRows(req: ExportRequestDto): Promise<Record<string, any>[]> {
    if (req.data && Array.isArray(req.data)) {
      return req.data;
    }

    const entityType = req.entityType;
    if (!entityType) return [];

    switch (entityType) {
      case 'customer': {
        const customers = await prisma.customer.findMany({
          where: { deletedAt: null },
          orderBy: { lastName: 'asc' },
          take: 2000,
        });
        return customers.map((c) => ({
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          fullName: `${c.firstName} ${c.lastName}`,
          phone: c.phone,
          email: c.email || '',
          createdAt: c.createdAt.toISOString().split('T')[0],
        }));
      }

      case 'booking': {
        const bookings = await prisma.booking.findMany({
          where: { deletedAt: null },
          include: { customer: true, artist: true },
          orderBy: { date: 'desc' },
          take: 2000,
        });
        return bookings.map((b) => ({
          id: b.id,
          customerName: b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : '',
          artistName: b.artist?.name || '',
          date: b.date.toISOString().split('T')[0],
          status: b.status,
          price: b.price ? Number(b.price) : 0,
          deposit: b.deposit ? Number(b.deposit) : 0,
        }));
      }

      case 'transaction': {
        const transactions = await prisma.transaction.findMany({
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
          take: 2000,
        });
        return transactions.map((t) => ({
          id: t.id,
          date: t.date.toISOString().split('T')[0],
          type: t.type,
          category: t.category,
          description: t.description,
          amount: Number(t.amount),
        }));
      }

      case 'staff': {
        const staffList = await prisma.staff.findMany({
          where: { deletedAt: null },
          orderBy: { name: 'asc' },
        });
        return staffList.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          createdAt: s.createdAt.toISOString().split('T')[0],
        }));
      }

      default:
        return [];
    }
  }

  /**
   * Genera una stringa CSV formattata in UTF-8 BOM.
   */
  async generateCsv(req: ExportRequestDto, rows: Record<string, any>[]): Promise<string> {
    const columns = req.columns;
    const headerRow = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

    const dataRows = rows.map((row) =>
      columns
        .map((col) => {
          const val = this.formatValue(row[col.key], col.type);
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    // UTF-8 BOM prefix for Excel
    return '\uFEFF' + [headerRow, ...dataRows].join('\n');
  }

  /**
   * Genera un buffer XLSX usando ExcelJS con formattazione e stili.
   */
  async generateExcel(req: ExportRequestDto, rows: Record<string, any>[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const title = req.title || 'Export Dati Demo-Nagma';
    const worksheet = workbook.addWorksheet('Export');

    // Title Row
    worksheet.mergeCells(1, 1, 1, req.columns.length || 1);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = title.toUpperCase();
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Header Row
    const headerRowValues = req.columns.map((col) => col.label);
    const headerRow = worksheet.addRow(headerRowValues);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
    });

    // Data Rows
    rows.forEach((row, rowIndex) => {
      const rowValues = req.columns.map((col) => this.formatValue(row[col.key], col.type));
      const addedRow = worksheet.addRow(rowValues);
      addedRow.height = 20;

      const isEven = rowIndex % 2 === 0;
      addedRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 9 };
        if (isEven) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        const colDef = req.columns[colNumber - 1];
        if (colDef?.type === 'number' || colDef?.type === 'currency') {
          cell.alignment = { horizontal: 'right' };
        }
      });
    });

    // Auto Column Widths
    req.columns.forEach((col, idx) => {
      const column = worksheet.getColumn(idx + 1);
      const maxLen = Math.max(
        col.label.length,
        ...rows.map((r) => String(r[col.key] ?? '').length)
      );
      column.width = Math.min(Math.max(maxLen + 4, 12), 40);
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  /**
   * Genera un buffer PDF formattato tramite PDFKit.
   */
  async generatePdf(req: ExportRequestDto, rows: Record<string, any>[]): Promise<Buffer> {
    const title = req.title || 'Export Dati Demo-Nagma';
    const columns = req.columns;

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header Documento
      doc.fontSize(16).text(title, { align: 'center' });
      doc.fontSize(9).text(`Data Export: ${new Date().toLocaleDateString('it-IT')} ${new Date().toLocaleTimeString('it-IT')}`, { align: 'center' });
      doc.moveDown(1.5);

      // Tabella Dati PDF
      const colWidth = Math.floor(530 / Math.max(columns.length, 1));
      const startX = 30;
      let startY = doc.y;

      // Draw Header Table Row
      doc.fontSize(9).fillColor('#1E293B');
      columns.forEach((col, idx) => {
        doc.text(col.label, startX + idx * colWidth, startY, {
          width: colWidth - 5,
          align: 'left',
        });
      });
      doc.moveDown(0.5);
      doc.moveTo(startX, doc.y).lineTo(startX + 530, doc.y).strokeColor('#CBD5E1').stroke();
      doc.moveDown(0.5);

      // Draw Rows
      doc.fillColor('#334155');
      rows.slice(0, 150).forEach((row) => {
        if (doc.y > 750) {
          doc.addPage();
          startY = doc.y;
        }

        const currentY = doc.y;
        columns.forEach((col, idx) => {
          const val = this.formatValue(row[col.key], col.type);
          doc.fontSize(8).text(String(val), startX + idx * colWidth, currentY, {
            width: colWidth - 5,
            align: 'left',
          });
        });
        doc.moveDown(0.4);
      });

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).fillColor('#94A3B8').text(`Totale record esportati: ${rows.length}`, { align: 'right' });

      doc.end();
    });
  }

  private formatValue(val: any, type?: string): string {
    if (val === undefined || val === null) return '—';
    if (type === 'currency') {
      const num = Number(val);
      return isNaN(num) ? String(val) : `€ ${num.toFixed(2)}`;
    }
    if (type === 'boolean') {
      return val ? 'Sì' : 'No';
    }
    return String(val);
  }
}
