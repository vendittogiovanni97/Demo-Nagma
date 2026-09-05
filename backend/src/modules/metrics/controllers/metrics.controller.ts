import { Request, Response } from 'express';
import { z } from 'zod';
import { MetricsService } from '../services/metrics.service';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';

const webVitalsSchema = z.object({
  name: z.string().max(50).optional(),
  value: z.number().optional(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
  id: z.string().max(100).optional(),
}).passthrough();

export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  getSummary = asyncHandler(async (_req: Request, res: Response) => {
    const summary = this.metricsService.getMetricsSummary();
    res.json(summary);
  });

  recordVitals = asyncHandler(async (req: Request, res: Response) => {
    const parsed = webVitalsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Payload non valido' });
      return;
    }
    this.metricsService.recordWebVitals(req.body);
    res.json({ success: true });
  });

  resetMetrics = asyncHandler(async (_req: Request, res: Response) => {
    this.metricsService.resetMetrics();
    res.json({ success: true, message: 'Buffer metriche azzerato' });
  });
}
