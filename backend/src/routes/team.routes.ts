import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';

import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new TeamController();

router.use(authMiddleware);

router.get('/users', controller.getUsers);
router.post('/users', controller.createUser);

router.get('/shifts', controller.getShifts);
router.post('/shifts', controller.createShift);
router.put('/shifts/:id', controller.updateShift);
router.delete('/shifts/:id', controller.deleteShift);

export default router;
