import { Router } from 'express';
import { WhatsAppTemplateController } from '../controllers/whatsapp-template.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new WhatsAppTemplateController();

router.use(authMiddleware);

/**
 * @swagger
 * /api/whatsapp-templates:
 *   get:
 *     summary: Lista template WhatsApp
 *     description: Restituisce la lista di tutti i template WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Testo di ricerca
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtra template creati dal
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtra template creati fino al
 *     responses:
 *       200:
 *         description: Lista template WhatsApp
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WhatsAppTemplate'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/whatsapp-templates/logs:
 *   get:
 *     summary: Log messaggi WhatsApp
 *     description: Restituisce i log dei messaggi WhatsApp inviati
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cerca per numero di telefono, nome cliente o template
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SENT, FAILED, PENDING, MANUAL_SENT]
 *         description: Filtra per stato del messaggio
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero della pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Risultati per pagina (max 100)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data di inizio (retrocompatibilità)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data di fine (retrocompatibilità)
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: ID del cliente per filtrare (retrocompatibilità)
 *     responses:
 *       200:
 *         description: Log messaggi WhatsApp paginati
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WhatsAppLog'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
router.get('/logs', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getLogs);
router.post('/send', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.sendManual);
router.post('/:id/duplicate', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.duplicate);
router.post('/', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.create);
router.put('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.update);
router.delete('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.delete);

export default router;
