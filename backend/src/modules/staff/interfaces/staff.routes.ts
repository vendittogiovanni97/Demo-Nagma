import { Router } from 'express';
import { container } from '../../../container';
import { adminOnly, authMiddleware } from '../../../middlewares/auth.middleware';

const router = Router();
const controller = container.staffController;

router.use(authMiddleware);

// Staff members
router.get('/', controller.getMembers);
router.get('/members/list', controller.getMembersForSelect);
router.get('/members/:id', controller.getMemberById);
router.post('/', adminOnly, controller.createMember);
router.put('/:id', adminOnly, controller.updateMember);
router.delete('/:id', adminOnly, controller.deleteMember);
router.post('/:id/reset-password', adminOnly, controller.resetPassword);

// Shifts
router.get('/shifts', controller.getAllShifts);
router.get('/shifts/:staffId', controller.getStaffShifts);
router.post('/shifts', adminOnly, controller.createNewShift);
router.put('/shifts/:id', adminOnly, controller.updateExistingShift);
router.delete('/shifts/:id', adminOnly, controller.deleteExistingShift);

export default router;
