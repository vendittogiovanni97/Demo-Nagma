import { Router } from 'express';
import { CreamController } from '../controllers/cream.controller';

import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new CreamController();

router.use(authMiddleware);

/**
 * @swagger
 * /api/creams:
 *   get:
 *     summary: Lista creme
 *     description: Restituisce una lista paginata di creme
 *     tags: [Creams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Testo di ricerca
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista creme
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/creams:
 *   post:
 *     summary: Crea crema
 *     description: Crea una nuova crema
 *     tags: [Creams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Crema Idratante
 *               brand:
 *                 type: string
 *                 example: Nagma
 *               price:
 *                 type: number
 *                 example: 29.99
 *               description:
 *                 type: string
 *                 example: Crema idratante per tutti i tipi di pelle
 *               stock:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       201:
 *         description: Crema creata con successo
 *       400:
 *         description: Dati non validi
 */
router.post('/', requireRoles('ADMIN', 'USER'), controller.create);

/**
 * @swagger
 * /api/creams/{id}:
 *   put:
 *     summary: Aggiorna crema
 *     description: Aggiorna i dati di una crema
 *     tags: [Creams]
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
 *               name:
 *                 type: string
 *               brand:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Crema aggiornata
 *       404:
 *         description: Crema non trovata
 */
router.put('/:id', requireRoles('ADMIN', 'USER'), controller.update);

/**
 * @swagger
 * /api/creams/{id}:
 *   delete:
 *     summary: Elimina crema
 *     description: Elimina una crema
 *     tags: [Creams]
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
 *         description: Crema eliminata
 *       404:
 *         description: Crema non trovata
 */
router.delete('/:id', requireRoles('ADMIN', 'USER'), controller.delete);

/**
 * @swagger
 * /api/creams/sales:
 *   get:
 *     summary: Vendite creme
 *     description: Restituisce le vendite delle creme
 *     tags: [Creams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data di inizio
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data di fine
 *     responses:
 *       200:
 *         description: Dati vendite creme
 */
router.get('/sales', controller.getSales);

/**
 * @swagger
 * /api/creams/sales:
 *   post:
 *     summary: Registra vendita
 *     description: Registra una nuova vendita di crema
 *     tags: [Creams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [creamId, quantity, totalPrice]
 *             properties:
 *               creamId:
 *                 type: string
 *                 example: cream_123
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               totalPrice:
 *                 type: number
 *                 example: 59.98
 *               customerId:
 *                 type: string
 *                 example: customer_456
 *               notes:
 *                 type: string
 *                 example: Vendita in negozio
 *     responses:
 *       201:
 *         description: Vendita registrata
 *       400:
 *         description: Dati non validi
 */
router.post('/sales', requireRoles('ADMIN', 'USER'), controller.registerSale);

export default router;
