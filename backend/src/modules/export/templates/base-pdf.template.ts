import fs from 'fs';
import path from 'path';

export interface PdfTemplateData {
  title: string;
  subtitle?: string;
  totalRecords: number;
  columns: { key: string; label: string; type?: string }[];
  rows: Record<string, unknown>[];
  logoBase64?: string;
}

export class BasePdfTemplate {
  /**
   * Recupera il logo aziendale convertito in data URI Base64
   */
  static getLogoBase64(): string {
    const candidates = [
      path.join(process.cwd(), '..', 'frontend', 'public', 'logo-dark-text.svg'),
      path.join(process.cwd(), 'frontend', 'public', 'logo-dark-text.svg'),
      path.join(process.cwd(), '..', 'frontend', 'public', 'logo.svg'),
      path.join(process.cwd(), 'frontend', 'public', 'logo.svg'),
      path.join(process.cwd(), '..', 'frontend', 'public', 'image1.jpeg'),
      path.join(process.cwd(), 'frontend', 'public', 'image1.jpeg'),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          const fileBuf = fs.readFileSync(p);
          const ext = path.extname(p).toLowerCase().replace('.', '');
          const mimeType = ext === 'svg' ? 'image/svg+xml' : ext === 'png' ? 'image/png' : 'image/jpeg';
          return `data:${mimeType};base64,${fileBuf.toString('base64')}`;
        } catch {
          // ignora errori di lettura
        }
      }
    }

    return '';
  }

  /**
   * Genera l'HTML completo e pronto per la stampa/PDF con CSS responsive e paginazione perfetta
   */
  static render(data: PdfTemplateData): string {
    const logoSrc = data.logoBase64 || this.getLogoBase64();
    const currentDate = new Date().toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const columnsHtml = data.columns
      .map((col) => {
        const isRight = col.type === 'number' || col.type === 'currency' || col.label.includes('(€)');
        return `<th class="${isRight ? 'text-right' : 'text-left'}">${this.escapeHtml(col.label)}</th>`;
      })
      .join('');

    const rowsHtml = data.rows
      .map((row, idx) => {
        const isZebra = idx % 2 === 0;
        const cells = data.columns
          .map((col) => {
            const val = row[col.key];
            const isRight = col.type === 'number' || col.type === 'currency' || col.label.includes('(€)');
            const isStatus = col.label.toLowerCase().includes('stato') || col.key.toLowerCase().includes('status');

            let formattedVal = this.formatValue(val, col.type);

            if (isStatus && val && val !== '—') {
              const statusStr = String(val);
              const statusClass = this.getStatusBadgeClass(statusStr);
              formattedVal = `<span class="badge ${statusClass}">${this.escapeHtml(statusStr)}</span>`;
            } else {
              formattedVal = this.escapeHtml(formattedVal);
            }

            return `<td class="${isRight ? 'text-right' : 'text-left'}">${formattedVal}</td>`;
          })
          .join('');

        return `<tr class="${isZebra ? 'bg-stripe' : ''}">${cells}</tr>`;
      })
      .join('');

    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>${this.escapeHtml(data.title)}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 15mm 12mm 15mm 12mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      font-size: 12px;
      line-height: 1.4;
      padding: 20px;
    }

    .report-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }

    /* HEADER STYLES */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 2.5px solid #3b82f6;
      margin-bottom: 16px;
    }

    .brand-logo {
      height: 38px;
      max-width: 200px;
      object-fit: contain;
    }

    .header-meta {
      text-align: right;
    }

    .report-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .report-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }

    /* TABLE STYLES */
    .data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }

    .data-table thead {
      display: table-header-group;
      background-color: #1e293b;
      color: #ffffff;
    }

    .data-table th {
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #0f172a;
      white-space: nowrap;
    }

    .data-table tr {
      height: 44px;
      page-break-inside: avoid;
    }

    .data-table td {
      padding: 12px 14px;
      font-size: 11px;
      color: #334155;
      border-bottom: 1.5px solid #cbd5e1;
      vertical-align: middle;
    }

    .data-table tbody tr:last-child td {
      border-bottom: none;
    }

    .bg-stripe {
      background-color: #f8fafc;
    }

    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }

    /* BADGE STYLES */
    .badge {
      display: inline-block;
      padding: 4px 10px;
      font-size: 10px;
      font-weight: 700;
      border-radius: 9999px;
      text-transform: capitalize;
      text-align: center;
      white-space: nowrap;
    }

    .badge-creato {
      background-color: #e0f2fe;
      color: #0369a1;
      border: 1px solid #7dd3fc;
    }

    .badge-confermato {
      background-color: #dbeafe;
      color: #1e40af;
      border: 1px solid #93c5fd;
    }

    .badge-completato {
      background-color: #d1fae5;
      color: #047857;
      border: 1px solid #6ee7b7;
    }

    .badge-annullato, .badge-cancellato {
      background-color: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fca5a5;
    }

    .badge-modificato {
      background-color: #fef3c7;
      color: #b45309;
      border: 1px solid #fde047;
    }

    .badge-spostato {
      background-color: #f3e8ff;
      color: #7e22ce;
      border: 1px solid #d8b4fe;
    }

    .badge-default {
      background-color: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    /* FOOTER STYLES */
    .report-footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="report-header">
      <div>
        ${logoSrc ? `<img src="${logoSrc}" alt="Demo-Nagma Logo" class="brand-logo" />` : '<h2 style="color: #3b82f6;">DEMO-NAGMA</h2>'}
      </div>
      <div class="header-meta">
        <h1 class="report-title">${this.escapeHtml(data.title)}</h1>
        <div class="report-subtitle">
          Esportato il ${currentDate} &bull; Totale Record: <strong>${data.totalRecords}</strong>
        </div>
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr>${columnsHtml}</tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="report-footer">
      <div>Nagma Management System</div>
      <div>Documento generato automaticamente</div>
    </div>
  </div>
</body>
</html>`;
  }

  private static getStatusBadgeClass(statusStr: string): string {
    const s = statusStr.toLowerCase();
    if (s.includes('conferm')) return 'badge-confermato';
    if (s.includes('creat')) return 'badge-creato';
    if (s.includes('complet')) return 'badge-completato';
    if (s.includes('annull') || s.includes('cancel')) return 'badge-annullato';
    if (s.includes('spost') || s.includes('modif')) return 'badge-spostato';
    return 'badge-default';
  }

  private static formatValue(val: unknown, type?: string): string {
    if (val === undefined || val === null || val === '') return '—';
    if (type === 'currency') {
      const num = Number(val);
      return isNaN(num) ? String(val) : `€ ${num.toFixed(2)}`;
    }
    if (type === 'boolean') {
      return val ? 'Sì' : 'No';
    }
    return String(val);
  }

  private static escapeHtml(str: string): string {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
