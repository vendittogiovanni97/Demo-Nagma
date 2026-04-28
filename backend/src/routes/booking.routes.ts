import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();
const controller = new BookingController();

/**
 * @swagger
 * /api/bookings/export:
 *   get:
 *     summary: Esporta appuntamenti con filtri
 *     description: Recupera appuntamenti filtrati per l'esportazione in CSV, PDF, XLSX
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data inizio filtro (ISO 8601)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data fine filtro (ISO 8601)
 *       - in: query
 *         name: weekday
 *         schema:
 *           type: string
 *           enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *         description: Filtra per giorno della settimana
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CONFIRMED, CANCELLED, RESCHEDULED, COMPLETED]
 *         description: Filtra per stato appuntamento
 *       - in: query
 *         name: artistId
 *         schema:
 *           type: string
 *         description: Filtra per ID artista
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filtra per ID cliente
 *     responses:
 *       200:
 *         description: Dati per l'esportazione
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: Array di appuntamenti filtrati
 *                 count:
 *                   type: integer
 *                   description: Numero di appuntamenti
 *                 filters:
 *                   type: object
 *                   description: Filtri applicati
 *                 filtersLabel:
 *                   type: string
 *                   description: Descrizione leggibile dei filtri applicati
 */
router.get('/export', authMiddleware, controller.export);

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
router.post('/verify-password', authRateLimiter, authMiddleware, controller.verifyPassword);
router.get('/stats', authMiddleware, controller.getStats);
router.get('/available-artists', authMiddleware, controller.getAvailable);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Lista appuntamenti
 *     description: Lista paginata appuntamenti con filtro mese e date
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
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtra appuntamenti dal
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtra appuntamenti fino al
 *     responses:
 *       200:
 *         description: Lista appuntamenti
 */
router.get('/', authMiddleware, controller.getAll);

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
 *             required: [customerId, artistId, date, duration]
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
router.post('/', authMiddleware, controller.create);

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
router.get('/:id/history', authMiddleware, controller.getHistory);

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
router.put('/:id', authMiddleware, controller.update);

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
router.delete('/:id', authMiddleware, requireRoles('ADMIN', 'SUPER_ADMIN'), controller.delete);

export default router;
