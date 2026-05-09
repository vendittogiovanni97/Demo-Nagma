import { Router } from 'express';
import { BookingPlacementController } from './BookingPlacementController';
import { BookingPlacementService } from '../application/BookingPlacementService';
import { PrismaBookingPlacementRepository } from '../infrastructure/PrismaBookingPlacementRepository';
import { authMiddleware } from '../../../../middlewares/auth.middleware';

const router = Router();

// Setup dependency injection
const repository = new PrismaBookingPlacementRepository();
const service = new BookingPlacementService(repository);
const controller = new BookingPlacementController(service);

// Secure body placement endpoints for logged in staff
router.get('/booking/:id/placement', authMiddleware, (req, res, next) => { controller.getPlacement(req, res, next); });
router.post('/booking/:id/placement', authMiddleware, (req, res, next) => { controller.upsertPlacement(req, res, next); });

export default router;
