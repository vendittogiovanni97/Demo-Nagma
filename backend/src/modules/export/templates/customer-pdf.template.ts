import { BasePdfTemplate, type PdfTemplateData } from './base-pdf.template';

export class CustomerPdfTemplate {
  static render(title: string, rows: Record<string, unknown>[]): string {
    const columns = [
      { key: 'fullName', label: 'Nome Cliente' },
      { key: 'phone', label: 'Telefono' },
      { key: 'email', label: 'Email' },
      { key: 'createdAt', label: 'Data Registrazione' },
    ];

    const data: PdfTemplateData = {
      title: title || 'Report Elenco Clienti',
      totalRecords: rows.length,
      columns,
      rows,
    };

    return BasePdfTemplate.render(data);
  }
}
