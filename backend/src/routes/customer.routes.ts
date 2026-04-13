import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';

import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new CustomerController();

router.use(authMiddleware);

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Lista clienti
 *     description: Restituisce una lista paginata di clienti con ricerca opzionale
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Testo di ricerca (nome, cognome, telefono)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Risultati per pagina
 *     responses:
 *       200:
 *         description: Lista clienti
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Dettaglio cliente
 *     description: Restituisce i dettagli di un cliente inclusi appuntamenti, vendite e log WhatsApp
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Dettaglio cliente con appuntamenti e vendite
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Cliente non trovato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/customers/{id}/summary:
 *   get:
 *     summary: Riepilogo cliente
 *     description: Restituisce un riepilogo con totale speso, appuntamenti futuri e ultimo servizio
 *     tags: [Customers]
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
 *         description: Riepilogo cliente
 */
router.get('/:id/summary', controller.getSummary);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Crea cliente
 *     description: Crea un nuovo cliente
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, phone]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Giuseppe
 *               lastName:
 *                 type: string
 *                 example: Verdi
 *               phone:
 *                 type: string
 *                 example: +39 340 111111
 *               email:
 *                 type: string
 *                 format: email
 *                 example: giuseppe@email.it
 *               notes:
 *                 type: string
 *                 example: Allergico al rosso
 *     responses:
 *       201:
 *         description: Cliente creato
 *       400:
 *         description: Dati non validi
 */
router.post('/', requireRoles('ADMIN', 'USER'), controller.create);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Aggiorna cliente
 *     description: Aggiorna i dati di un cliente
 *     tags: [Customers]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente aggiornato
 *       404:
 *         description: Cliente non trovato
 */
router.put('/:id', requireRoles('ADMIN', 'USER'), controller.update);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Elimina cliente (soft delete)
 *     description: Elimina logicamente un cliente
 *     tags: [Customers]
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
 *         description: Cliente eliminato
 *       404:
 *         description: Cliente non trovato
 */
router.delete('/:id', requireRoles('ADMIN', 'USER'), controller.delete);

export default router;
