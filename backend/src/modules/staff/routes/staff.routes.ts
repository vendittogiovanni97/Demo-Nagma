import { Express, Router } from 'express';
import { container } from '../../../core/container';
import { StaffController } from '../controllers/staff.controller';
import { authMiddleware, adminOnly } from '../../../core/middleware/auth.middleware';

export function registerStaffRoutes(app: Express): void {
  const controller = container.get(StaffController);
  const router = Router();

  router.use(authMiddleware);

  router.get('/members', controller.getMembers);
  router.get('/members/list', controller.getMembersForSelect);
  router.get('/members/:id', controller.getMemberById);
  router.post('/members', adminOnly, controller.createMember);
  router.put('/members/:id', adminOnly, controller.updateMember);
  router.delete('/members/:id', adminOnly, controller.deleteMember);

  router.get('/shifts', controller.getAllShifts);
  router.get('/shifts/:staffId', controller.getStaffShifts);
  router.post('/shifts', adminOnly, controller.createNewShift);
  router.put('/shifts/:id', adminOnly, controller.updateExistingShift);
  router.delete('/shifts/:id', adminOnly, controller.deleteExistingShift);

  app.use('/api/staff', router);
}
