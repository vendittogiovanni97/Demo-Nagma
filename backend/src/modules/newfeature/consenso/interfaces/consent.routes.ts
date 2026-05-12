import { Router } from 'express';
import { ConsentController } from './ConsentController';
import { ConsentService } from '../application/ConsentService';
import { authMiddleware, requireRoles } from '../../../../middlewares/auth.middleware';

const router = Router();
const service = new ConsentService();
const controller = new ConsentController(service);

// All consensus-related endpoints are public to allow clients to sign from their personal phones
router.get('/config', (req, res, next) => { controller.getConfig(req, res, next); });
router.post('/config', authMiddleware, requireRoles('SUPER_ADMIN'), (req, res, next) => { controller.updateConfig(req, res, next); });
router.get('/booking/:id', (req, res, next) => { controller.getBookingPublic(req, res, next); });
router.post('/booking/:id/consent', (req, res, next) => { controller.submitConsent(req, res, next); });

// Admin-only: list all signed consents
router.get('/consents', authMiddleware, (req, res, next) => { controller.listConsents(req, res, next); });

export default router;
