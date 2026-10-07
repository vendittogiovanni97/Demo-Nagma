import { Request, Response } from 'express';
import { ReportsService } from '../services/reports.service';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';
import { ReportFilterDto, ReportType } from '../types/reports.types';
import { validate } from '../../../core/shared/utils/validation';
import { artistRevenueQuerySchema } from './reports.schemas';

export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const filters: ReportFilterDto = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      reportType: req.query.reportType as ReportType,
      staffId: req.query.staffId ? Number(req.query.staffId) : undefined,
    };

    const summary = await this.reportsService.getSummary(filters);
    res.json({
      success: true,
      data: summary,
    });
  });

  getDetails = asyncHandler(async (req: Request, res: Response) => {
    const filters: ReportFilterDto = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      reportType: req.query.reportType as ReportType,
      staffId: req.query.staffId ? Number(req.query.staffId) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 25,
      search: req.query.search as string,
    };

    const details = await this.reportsService.getDetails(filters);
    res.json({
      success: true,
      data: details.data,
      total: details.total,
      page: details.page,
      limit: details.limit,
      totalPages: details.totalPages,
    });
  });

  exportReport = asyncHandler(async (req: Request, res: Response) => {
    const format = (req.query.format as string)?.toLowerCase() || 'csv';
    const filters: ReportFilterDto = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      reportType: req.query.reportType as ReportType,
      staffId: req.query.staffId ? Number(req.query.staffId) : undefined,
    };

    if (format === 'pdf') {
      const pdfBuffer = await this.reportsService.exportPdf(filters);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="report_${Date.now()}.pdf"`);
      res.send(pdfBuffer);
      return;
    }

    const csvData = await this.reportsService.exportCsv(filters);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="report_${Date.now()}.csv"`);
    res.send(csvData);
  });

  getArtistRevenue = asyncHandler(async (req: Request, res: Response) => {
    const query = validate(artistRevenueQuerySchema, req.query);
    const data = await this.reportsService.getArtistRevenue(query);
    res.json({ success: true, data });
  });
}

