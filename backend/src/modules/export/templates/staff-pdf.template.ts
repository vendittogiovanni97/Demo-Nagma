import { BasePdfTemplate, type PdfTemplateData } from './base-pdf.template';

export class StaffPdfTemplate {
  static render(title: string, rows: Record<string, unknown>[]): string {
    const columns = [
      { key: 'name', label: 'Nome Operatore' },
      { key: 'type', label: 'Ruolo / Specializzazione' },
      { key: 'createdAt', label: 'Data Inserimento' },
    ];

    const data: PdfTemplateData = {
      title: title || 'Report Elenco Staff',
      totalRecords: rows.length,
      columns,
      rows,
    };

    return BasePdfTemplate.render(data);
  }
}
