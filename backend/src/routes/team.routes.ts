import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';

import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new TeamController();

router.use(authMiddleware);

router.get('/users', controller.getUsers);
router.post('/users', requireRoles('ADMIN'), controller.createUser);
router.delete('/users/:id', requireRoles('ADMIN'), controller.deleteUser);

router.get('/shifts', controller.getShifts);
router.post('/shifts', requireRoles('ADMIN', 'USER'), controller.createShift);
router.put('/shifts/:id', requireRoles('ADMIN', 'USER'), controller.updateShift);
router.delete('/shifts/:id', requireRoles('ADMIN', 'USER'), controller.deleteShift);

export default router;
