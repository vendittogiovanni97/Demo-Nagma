import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

export interface PdfColumn {
  key: string;
  label: string;
  type?: string;
}

export interface PdfHeaderOptions {
  title: string;
  totalRecords: number;
  subtitle?: string;
  logoPath?: string;
}

export interface PdfDocumentConfig {
  margin?: number;
  size?: 'A4' | 'A3' | 'LETTER';
  layout?: 'landscape' | 'portrait';
}

export class PdfUtils {
  static readonly PAGE_WIDTH_LANDSCAPE = 841.89;
  static readonly PAGE_HEIGHT_LANDSCAPE = 595.28;
  static readonly DEFAULT_MARGIN = 35;

  /**
   * Trova il percorso del logo aziendale cercando immagini compatibili PNG/JPEG tra frontend/public e la root
   */
  static getLogoPath(): string | null {
    const candidates = [
      path.join(process.cwd(), '..', 'frontend', 'public', 'logo-dark-text.png'),
      path.join(process.cwd(), 'frontend', 'public', 'logo-dark-text.png'),
      path.join(process.cwd(), '..', 'frontend', 'public', 'logo.png'),
      path.join(process.cwd(), 'frontend', 'public', 'logo.png'),
      path.join(process.cwd(), '..', 'frontend', 'public', 'logo-dark-text.svg.png'),
      path.join(process.cwd(), 'frontend', 'public', 'logo-dark-text.svg.png'),
      path.join(process.cwd(), '..', 'public', 'logo.png'),
      path.join(process.cwd(), 'public', 'logo.png'),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return null;
  }

  /**
   * Crea un nuovo documento PDFKit configurato per formato Landscape A4
   */
  static createDocument(config: PdfDocumentConfig = {}): typeof PDFDocument {
    const margin = config.margin ?? this.DEFAULT_MARGIN;
    const layout = config.layout ?? 'landscape';
    const size = config.size ?? 'A4';

    const doc = new PDFDocument({
      margin,
      size,
      layout,
      bufferPages: true,
      autoFirstPage: true,
    });

    // Imposta il margine inferiore interno a 0 per disattivare l'auto-paginazione spuria di PDFKit
    doc.page.margins.bottom = 0;
    return doc;
  }

  /**
   * Disegna l'intestazione aziendale con Logo (in alto a sinistra), Titolo, Data e Header della Tabella
   */
  static drawBrandHeader(
    doc: typeof PDFDocument,
    options: PdfHeaderOptions,
    columns: PdfColumn[],
    colPositions: number[],
    colWidths: number[]
  ): number {
    doc.page.margins.bottom = 0;
    const margin = this.DEFAULT_MARGIN;
    const contentWidth = this.PAGE_WIDTH_LANDSCAPE - margin * 2;
    const logoPath = options.logoPath || this.getLogoPath();

    // 1. Logo Aziendale in alto a sinistra (ingrandito)
    let logoDrawn = false;
    if (logoPath && fs.existsSync(logoPath) && !logoPath.endsWith('.svg')) {
      try {
        doc.image(logoPath, margin, margin - 4, { height: 46 });
        logoDrawn = true;
      } catch {
        logoDrawn = false;
      }
    }

    if (!logoDrawn) {
      // Disegna il Brand Logo Vettoriale NAGMA in alto a sinistra (ingrandito)
      doc.roundedRect(margin, margin - 2, 42, 42, 7).fill('#0098AA');
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#FFFFFF').text('N', margin, margin + 7, { width: 42, align: 'center', lineBreak: false });

      doc.font('Helvetica-Bold').fontSize(16).fillColor('#0F172A').text('NAGMA', margin + 50, margin + 4, { lineBreak: false });
      doc.font('Helvetica').fontSize(8.5).fillColor('#64748B').text('MANAGEMENT SYSTEM', margin + 50, margin + 23, { lineBreak: false });
    }

    // Titolo e Metadati dell'Export (in alto a destra)
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#0F172A').text(options.title, margin + 240, margin + 2, {
      width: contentWidth - 240,
      align: 'right',
      lineBreak: false,
    });

    const dateStr = `Export del ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}`;
    const recordStr = `Totale Record: ${options.totalRecords}`;
    doc.font('Helvetica').fontSize(8.5).fillColor('#64748B').text(
      `${dateStr}  •  ${recordStr}`,
      margin + 240,
      margin + 20,
      { width: contentWidth - 240, align: 'right', lineBreak: false }
    );

    // 2. Linea di accento blu sotto l'intestazione
    const lineY = margin + 48;
    doc.moveTo(margin, lineY).lineTo(margin + contentWidth, lineY).lineWidth(2).strokeColor('#3B82F6').stroke();

    // 3. Intestazione Tabella (Fascia Slate scuro #1E293B con righe più alte 26pt)
    const tableHeaderY = lineY + 10;
    const tableHeaderHeight = 26;

    // Sfondo rettangolare per l'header della tabella
    doc.rect(margin, tableHeaderY, contentWidth, tableHeaderHeight).fill('#1E293B');

    // Testi delle Colonne
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
    columns.forEach((col, idx) => {
      const colX = colPositions[idx];
      const colW = colWidths[idx];
      const isRightAlign = col.type === 'number' || col.type === 'currency' || col.label.includes('(€)');

      doc.text(col.label, colX + 6, tableHeaderY + 8, {
        width: colW - 12,
        align: isRightAlign ? 'right' : 'left',
        lineBreak: false,
      });
    });

    return tableHeaderY + tableHeaderHeight + 4;
  }

  /**
   * Disegna un Badge/Chip di Stato colorato con pill arrotondata
   */
  static drawStatusBadge(
    doc: typeof PDFDocument,
    statusStr: string,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    const statusUpper = statusStr.toUpperCase();
    let bg = '#F1F5F9';
    let fg = '#475569';

    if (statusUpper.includes('CONFERM')) {
      bg = '#DBEAFE'; fg = '#1E40AF'; // Blu Cobalto
    } else if (statusUpper.includes('CREAT')) {
      bg = '#E0F2FE'; fg = '#0369A1'; // Sky Blue
    } else if (statusUpper.includes('COMPLET')) {
      bg = '#D1FAE5'; fg = '#047857'; // Emerald
    } else if (statusUpper.includes('ANNULL')) {
      bg = '#FEE2E2'; fg = '#B91C1C'; // Red
    } else if (statusUpper.includes('CANCEL')) {
      bg = '#E2E8F0'; fg = '#334155'; // Slate Gray
    } else if (statusUpper.includes('SPOST')) {
      bg = '#F3E8FF'; fg = '#7E22CE'; // Viola / Purple
    } else if (statusUpper.includes('MODIF')) {
      bg = '#FEF3C7'; fg = '#B45309'; // Amber
    }

    const badgeW = Math.min(w - 10, 72);
    const badgeH = 18;
    const badgeX = x + (w - badgeW) / 2;
    const badgeY = y + (h - badgeH) / 2;

    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4).fill(bg);
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(fg).text(statusStr, badgeX, badgeY + 4.5, {
      width: badgeW,
      align: 'center',
      lineBreak: false,
    });
  }

  /**
   * Finalizza la numerazione delle pagine nel footer ed evita qualsiasi pagina bianca vuota
   */
  static finalizeFooter(doc: typeof PDFDocument, totalRecords: number): void {
    const margin = this.DEFAULT_MARGIN;
    const pageWidth = this.PAGE_WIDTH_LANDSCAPE;
    const pageHeight = this.PAGE_HEIGHT_LANDSCAPE;
    const contentWidth = pageWidth - margin * 2;

    // Disabilita espressamente i margini bottom per evitare che PDFKit crei nuove pagine durante il footer
    doc.page.margins.bottom = 0;

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      const footerLineY = pageHeight - margin + 4;
      const footerTextY = footerLineY + 5;

      // Linea divisoria footer
      doc.moveTo(margin, footerLineY).lineTo(margin + contentWidth, footerLineY).lineWidth(0.5).strokeColor('#E2E8F0').stroke();

      doc.font('Helvetica').fontSize(8.5).fillColor('#64748B');
      doc.text(
        `Nagma Management System`,
        margin,
        footerTextY,
        { width: contentWidth / 2, align: 'left', lineBreak: false }
      );
      doc.text(
        `Pagina ${i + 1} di ${range.count}`,
        margin + contentWidth / 2,
        footerTextY,
        { width: contentWidth / 2, align: 'right', lineBreak: false }
      );
    }
  }
}
