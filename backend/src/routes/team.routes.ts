import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';

const router = Router();
const controller = new TeamController();

router.get('/users', controller.getUsers);
router.post('/users', controller.createUser);

router.get('/shifts', controller.getShifts);
router.post('/shifts', controller.createShift);
router.put('/shifts/:id', controller.updateShift);
router.delete('/shifts/:id', controller.deleteShift);

export default router;
