import { Router } from 'express';
import { ConfigController } from './ConfigController';
import { authMiddleware, requireRoles } from '../../../middlewares/auth.middleware';

const router = Router();
const controller = new ConfigController();

router.get('/', authMiddleware, (req, res, next) => { controller.getConfig(req, res, next); });
router.post('/', authMiddleware, requireRoles('SUPER_ADMIN'), (req, res, next) => { controller.updateConfig(req, res, next); });
router.get('/backup', authMiddleware, requireRoles('SUPER_ADMIN'), (req, res, next) => { controller.downloadBackup(req, res, next); });

export default router;
