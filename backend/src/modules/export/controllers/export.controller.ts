import { Request, Response } from 'express';
import { ExportService } from '../services/export.service';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';
import { ExportRequestDto } from '../types/export.types';

export class ExportController {
  constructor(private exportService: ExportService) {}

  exportData = asyncHandler(async (req: Request, res: Response) => {
    const exportReq: ExportRequestDto = req.body;
    const format = exportReq.format || 'csv';
    const filenameBase = exportReq.filename || `export_${Date.now()}`;

    const rows = await this.exportService.resolveRows(exportReq);

    if (format === 'xlsx') {
      const excelBuffer = await this.exportService.generateExcel(exportReq, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
      res.send(excelBuffer);
      return;
    }

    if (format === 'pdf') {
      const pdfBuffer = await this.exportService.generatePdf(exportReq, rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
      res.send(pdfBuffer);
      return;
    }

    // Default: CSV
    const csvString = await this.exportService.generateCsv(exportReq, rows);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
    res.send(csvString);
  });
}
