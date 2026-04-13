import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';

import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new BookingController();

router.use(authMiddleware);

/**
 * @swagger
 * /api/bookings/stats:
 *   get:
 *     summary: Statistiche appuntamenti
 *     description: Statistiche mensili appuntamenti per stato
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: 2026-04
 *         description: Mese di riferimento (YYYY-MM)
 *     responses:
 *       200:
 *         description: Statistiche appuntamenti
 */
router.get('/stats', controller.getStats);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Lista appuntamenti
 *     description: Lista paginata appuntamenti con filtro mese
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: 2026-04
 *         description: Filtro per mese (YYYY-MM)
 *     responses:
 *       200:
 *         description: Lista appuntamenti
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Crea appuntamento
 *     description: Prenota un nuovo appuntamento
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, artistId, date, duration, type]
 *             properties:
 *               customerId:
 *                 type: string
 *               artistId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 description: Durata in minuti
 *                 example: 120
 *               type:
 *                 type: string
 *                 example: Tattoo
 *               price:
 *                 type: number
 *               deposit:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appuntamento creato
 */
router.post('/', controller.create);

/**
 * @swagger
 * /api/bookings/{id}/history:
 *   get:
 *     summary: Storico modifiche appuntamento
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Storico modifiche
 */
router.get('/:id/history', controller.getHistory);

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Aggiorna appuntamento
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, CANCELLED, RESCHEDULED, COMPLETED]
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *               deposit:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appuntamento aggiornato
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Elimina appuntamento (soft delete)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Appuntamento eliminato
 */
router.delete('/:id', controller.delete);

export default router;
