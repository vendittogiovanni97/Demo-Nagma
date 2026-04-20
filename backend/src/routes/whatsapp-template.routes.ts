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
router.get('/logs', requireRoles('ADMIN', 'USER'), controller.getLogs);

/**
 * @swagger
 * /api/whatsapp-templates/send:
 *   post:
 *     summary: Invia messaggio WhatsApp
 *     description: Invia manualmente un messaggio WhatsApp a un cliente
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, templateId]
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: customer_123
 *               templateId:
 *                 type: string
 *                 example: template_456
 *               variables:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 example:
 *                   name: "Giuseppe"
 *                   date: "15/04/2026"
 *               notes:
 *                 type: string
 *                 example: Promemoria appuntamento
 *     responses:
 *       200:
 *         description: Messaggio inviato con successo
 *       400:
 *         description: Dati non validi
 */
router.post('/send', requireRoles('ADMIN', 'USER'), controller.sendManual);

/**
 * @swagger
 * /api/whatsapp-templates/{id}/duplicate:
 *   post:
 *     summary: Duplica template
 *     description: Duplica un template WhatsApp esistente
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del template da duplicare
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nuovo template (copia)
 *     responses:
 *       201:
 *         description: Template duplicato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WhatsAppTemplate'
 *       404:
 *         description: Template non trovato
 */
router.post('/:id/duplicate', requireRoles('ADMIN', 'USER'), controller.duplicate);

/**
 * @swagger
 * /api/whatsapp-templates:
 *   post:
 *     summary: Crea template WhatsApp
 *     description: Crea un nuovo template WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, body]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Promemoria Appuntamento
 *               body:
 *                 type: string
 *                 example: "Ciao {{name}}, ti ricordiamo l'appuntamento del {{date}}."
 *               language:
 *                 type: string
 *                 example: it
 *               category:
 *                 type: string
 *                 enum: [UTILITY, MARKETING, OTP]
 *                 example: UTILITY
 *               variables:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["name", "date"]
 *     responses:
 *       201:
 *         description: Template creato con successo
 *       400:
 *         description: Dati non validi
 */
router.post('/', requireRoles('ADMIN', 'USER'), controller.create);

/**
 * @swagger
 * /api/whatsapp-templates/{id}:
 *   put:
 *     summary: Aggiorna template WhatsApp
 *     description: Aggiorna un template WhatsApp esistente
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               body:
 *                 type: string
 *               language:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [UTILITY, MARKETING, OTP]
 *               variables:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Template aggiornato
 *       404:
 *         description: Template non trovato
 */
router.put('/:id', requireRoles('ADMIN', 'USER'), controller.update);

/**
 * @swagger
 * /api/whatsapp-templates/{id}:
 *   delete:
 *     summary: Elimina template WhatsApp
 *     description: Elimina un template WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del template
 *     responses:
 *       204:
 *         description: Template eliminato
 *       404:
 *         description: Template non trovato
 */
router.delete('/:id', requireRoles('ADMIN', 'USER'), controller.delete);

export default router;
