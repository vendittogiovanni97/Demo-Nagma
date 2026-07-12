import { container } from '../../core/container';
import { CreamService } from './services/CreamService';
import { CreamController } from './controllers/CreamController';

export function bootstrapCream(): void {
  const creamService = new CreamService();
  const creamController = new CreamController(creamService);
  container.register(CreamService, creamService);
  container.register(CreamController, creamController);
}
