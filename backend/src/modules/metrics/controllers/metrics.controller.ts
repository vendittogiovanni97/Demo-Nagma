import { Request, Response } from 'express';
import { MetricsService } from '../services/metrics.service';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';

export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  getSummary = asyncHandler(async (_req: Request, res: Response) => {
    const summary = this.metricsService.getMetricsSummary();
    res.json(summary);
  });

  recordVitals = asyncHandler(async (req: Request, res: Response) => {
    this.metricsService.recordWebVitals(req.body);
    res.json({ success: true });
  });

  resetMetrics = asyncHandler(async (_req: Request, res: Response) => {
    this.metricsService.resetMetrics();
    res.json({ success: true, message: 'Buffer metriche azzerato' });
  });
}
