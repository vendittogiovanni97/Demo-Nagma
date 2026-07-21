import { container } from '../../core/container';
import { MetricsService } from './services/metrics.service';
import { MetricsController } from './controllers/metrics.controller';

export function bootstrapMetrics(): void {
  const service = new MetricsService();
  const controller = new MetricsController(service);

  container.register(MetricsService, service);
  container.register(MetricsController, controller);
}
