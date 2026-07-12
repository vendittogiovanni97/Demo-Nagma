import { container } from '../../core/container';
import { StaffService } from './services/staffService';
import { StaffController } from './controllers/staff.controller';

export function bootstrapStaff(): void {
  const service = new StaffService();
  const controller = new StaffController(service);

  container.register(StaffService, service);
  container.register(StaffController, controller);
}
