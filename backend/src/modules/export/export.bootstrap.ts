import { container } from '../../core/container';
import { ExportService } from './services/export.service';
import { ExportController } from './controllers/export.controller';

export function bootstrapExport(): void {
  const exportService = new ExportService();
  const exportController = new ExportController(exportService);

  container.register(ExportService, exportService);
  container.register(ExportController, exportController);
}
