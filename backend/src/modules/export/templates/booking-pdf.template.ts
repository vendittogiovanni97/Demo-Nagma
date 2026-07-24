import { BasePdfTemplate, type PdfTemplateData } from './base-pdf.template';

export class BookingPdfTemplate {
  static render(title: string, rows: Record<string, unknown>[]): string {
    const columns = [
      { key: 'customerName', label: 'Cliente' },
      { key: 'artistName', label: 'Artista' },
      { key: 'date', label: 'Data & Ora' },
      { key: 'duration', label: 'Durata (min)', type: 'number' },
      { key: 'status', label: 'Stato' },
      { key: 'price', label: 'Prezzo (€)', type: 'currency' },
      { key: 'deposit', label: 'Acconto (€)', type: 'currency' },
      { key: 'notes', label: 'Note' },
    ];

    const data: PdfTemplateData = {
      title: title || 'Report Prenotazioni',
      totalRecords: rows.length,
      columns,
      rows,
    };

    return BasePdfTemplate.render(data);
  }
}
