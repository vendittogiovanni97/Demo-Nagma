import ExcelJS from 'exceljs';
import prisma from '../../../core/shared/utils/prisma';
import { ExportRequestDto, type ExportRow } from '../types/export.types';
import { PdfUtils } from '../utils/pdf.utils';

export class ExportService {
  async resolveRows(req: ExportRequestDto): Promise<ExportRow[]> {
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

  async generateCsv(req: ExportRequestDto, rows: ExportRow[]): Promise<string> {
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

  async generateExcel(req: ExportRequestDto, rows: ExportRow[]): Promise<Buffer> {
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

  async generatePdf(req: ExportRequestDto, rows: ExportRow[]): Promise<Buffer> {
    const rawTitle = req.title || 'Export Dati Demo-Nagma';
    const columns = req.columns;
    const title = rawTitle
      .replace(/(.*?)\s*—\s*\1/g, '$1')
      .replace(/([a-zA-Z0-9àèéìòù])(Mese:)/g, '$1 — $2');

    return new Promise<Buffer>((resolve, reject) => {
      const margin = PdfUtils.DEFAULT_MARGIN;
      const doc = PdfUtils.createDocument({ margin, layout: 'landscape' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const contentWidth = PdfUtils.PAGE_WIDTH_LANDSCAPE - margin * 2;
      const bottomLimit = PdfUtils.PAGE_HEIGHT_LANDSCAPE - margin - 35;

      const getExactColWidth = (label: string, defaultWidth: number): number => {
        const l = label.toLowerCase();
        if (l.includes('durata')) return 85;
        if (l.includes('stato')) return 80;
        if (l.includes('prezzo')) return 75;
        if (l.includes('acconto')) return 75;
        if (l.includes('data')) return 105;
        if (l.includes('artista')) return 120;
        if (l.includes('cliente')) return 135;
        if (l.includes('note')) return 96.89;
        return defaultWidth;
      };

      const defaultColW = contentWidth / Math.max(columns.length, 1);
      const colWidths = columns.map((col) => getExactColWidth(col.label, defaultColW));
      const colPositions = colWidths.reduce<number[]>((acc, w, i) => {
        const prev = i === 0 ? margin : acc[i - 1] + colWidths[i - 1];
        acc.push(prev);
        return acc;
      }, []);

      const drawHeader = () => {
        return PdfUtils.drawBrandHeader(
          doc,
          { title, totalRecords: rows.length },
          columns,
          colPositions,
          colWidths
        );
      };

      let currentY = drawHeader();

      // Rendering Dati con Righe Più Spaziose (rowHeight minimo 36pt per ampio distacco)
      rows.forEach((row, rowIndex) => {
        const cellValues = columns.map((col) => this.formatValue(row[col.key], col.type));

        doc.font('Helvetica').fontSize(8.5);
        const cellHeights = cellValues.map((valStr, idx) => {
          const colW = colWidths[idx] - 12;
          return doc.heightOfString(valStr, { width: Math.max(colW, 20) });
        });

        const maxTextHeight = Math.max(...cellHeights, 14);
        const rowHeight = Math.max(maxTextHeight + 16, 36);

        if (currentY + rowHeight > bottomLimit) {
          doc.addPage({ margin, size: 'A4', layout: 'landscape' });
          doc.page.margins.bottom = 0;
          currentY = drawHeader();
        }

        if (row.__pdfRowVariant === 'success') {
          doc.rect(margin, currentY, contentWidth, rowHeight).fill('#D1FAE5');
        } else if (rowIndex % 2 === 0) {
          doc.rect(margin, currentY, contentWidth, rowHeight).fill('#F8FAFC');
        }

        columns.forEach((col, idx) => {
          const valStr = cellValues[idx];
          const colX = colPositions[idx];
          const colW = colWidths[idx];
          const isRightAlign = col.type === 'number' || col.type === 'currency' || col.label.includes('(€)');
          const isStatusCol = col.label.toLowerCase().includes('stato') || col.key.toLowerCase().includes('status');
          const isStruckThrough = row[`${col.key}__pdfStrikeThrough`] === true;

          if (isStatusCol && valStr && valStr !== '—') {
            PdfUtils.drawStatusBadge(doc, valStr, colX, currentY, colW, rowHeight);
          } else {
            const textX = colX + 6;
            const textY = currentY + (rowHeight - maxTextHeight) / 2;
            doc.font('Helvetica').fontSize(8.5).fillColor(isStruckThrough ? '#DC2626' : '#334155');
            doc.text(valStr, textX, textY, {
              width: colW - 12,
              align: isRightAlign ? 'right' : 'left',
              lineBreak: false,
            });
            if (isStruckThrough) {
              const strikeWidth = Math.min(doc.widthOfString(valStr), colW - 12);
              doc
                .moveTo(textX, textY + 4)
                .lineTo(textX + strikeWidth, textY + 4)
                .lineWidth(0.8)
                .strokeColor('#DC2626')
                .stroke();
            }
          }
        });

        currentY += rowHeight;

        // Linea divisoria (Divider marcato) sotto OGNI riga per la massima chiarezza visiva
        doc.moveTo(margin, currentY).lineTo(margin + contentWidth, currentY).lineWidth(0.8).strokeColor('#CBD5E1').stroke();
      });

      if (req.pdfSummary) {
        const summaryHeight = 38;
        if (currentY + summaryHeight > bottomLimit) {
          doc.addPage({ margin, size: 'A4', layout: 'landscape' });
          doc.page.margins.bottom = 0;
          currentY = drawHeader();
        }

        const valueColumnWidth = colWidths.at(-1) ?? defaultColW;
        const valueColumnX = colPositions.at(-1) ?? margin;
        doc.rect(margin, currentY, contentWidth, summaryHeight).fill('#1E293B');
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#FFFFFF')
          .text(req.pdfSummary.label.toUpperCase(), margin + 8, currentY + 14, {
            width: valueColumnX - margin - 16,
            align: 'left',
            lineBreak: false,
          });
        doc.text(
          req.pdfSummary.value,
          valueColumnX + 6,
          currentY + 14,
          {
            width: valueColumnWidth - 12,
            align: 'left',
            lineBreak: false,
          },
        );
        currentY += summaryHeight;
      }

      // Generazione Footer e numerazione esatta pagine senza mai creare pagine vuote extra
      PdfUtils.finalizeFooter(doc, rows.length);

      doc.end();
    });
  }

  private formatValue(val: unknown, type?: string): string {
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
