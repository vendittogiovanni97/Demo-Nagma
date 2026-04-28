import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new TransactionController();

router.use(authMiddleware);

/**
 * @swagger
 * /api/transactions/summary:
 *   get:
 *     summary: Riepilogo finanziario
 *     description: Totale entrate, uscite e bilancio per mese
 *     tags: [Transactions]
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
 *         description: Riepilogo finanziario
 */
router.get('/summary', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getSummary);
router.get('/trends', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getTrends);
router.get('/performance', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getArtistPerformance);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Lista transazioni
 *     description: Lista paginata transazioni con filtri opzionali
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: 2026-04
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Lista transazioni paginata
 */
router.get('/', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getAll);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Crea transazione
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, category, description, amount]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *                 example: Materiali
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *               artistId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transazione creata
 */
router.post('/', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.create);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Elimina transazione (soft delete)
 *     tags: [Transactions]
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
 *         description: Transazione eliminata
 */
router.delete('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.delete);

export default router;
