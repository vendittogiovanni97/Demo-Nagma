import { container } from '../../core/container';
import { ReportsService } from './services/reports.service';
import { ReportsController } from './controllers/reports.controller';

export function bootstrapReports(): void {
  const reportsService = new ReportsService();
  const reportsController = new ReportsController(reportsService);

  container.register(ReportsService, reportsService);
  container.register(ReportsController, reportsController);
}
