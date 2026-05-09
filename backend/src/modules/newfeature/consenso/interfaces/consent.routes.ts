import { Router } from 'express';
import { ConsentController } from './ConsentController';

const router = Router();
const controller = new ConsentController();

// All consensus-related endpoints are public to allow clients to sign from their personal phones
router.get('/config', (req, res, next) => { controller.getConfig(req, res, next); });
router.get('/booking/:id', (req, res, next) => { controller.getBookingPublic(req, res, next); });
router.post('/booking/:id/consent', (req, res, next) => { controller.submitConsent(req, res, next); });

export default router;
