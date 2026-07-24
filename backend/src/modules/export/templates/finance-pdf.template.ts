import { BasePdfTemplate, type PdfTemplateData } from './base-pdf.template';

export class FinancePdfTemplate {
  static render(title: string, rows: Record<string, unknown>[]): string {
    const columns = [
      { key: 'date', label: 'Data' },
      { key: 'type', label: 'Tipo' },
      { key: 'category', label: 'Categoria' },
      { key: 'description', label: 'Descrizione' },
      { key: 'amount', label: 'Importo (€)', type: 'currency' },
    ];

    const data: PdfTemplateData = {
      title: title || 'Report Finanziario Transazioni',
      totalRecords: rows.length,
      columns,
      rows,
    };

    return BasePdfTemplate.render(data);
  }
}
