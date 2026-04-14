import { Router } from 'express';
import { FormTemplateController } from '../controllers/form-template.controller';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware';

const router = Router();
const controller = new FormTemplateController();

router.use(authMiddleware);

/**
 * @swagger
 * /api/form-templates:
 *   get:
 *     summary: Lista template form
 *     tags: [FormTemplates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista template
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/form-templates/{id}:
 *   get:
 *     summary: Dettaglio template form
 *     tags: [FormTemplates]
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
 *         description: Template trovato
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/form-templates:
 *   post:
 *     summary: Crea template form (solo admin)
 *     tags: [FormTemplates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, schemaB64]
 *             properties:
 *               name:
 *                 type: string
 *               schemaB64:
 *                 type: string
 *     responses:
 *       201:
 *         description: Template creato
 */
router.post('/', adminOnly, controller.create);

/**
 * @swagger
 * /api/form-templates/{id}:
 *   put:
 *     summary: Aggiorna template form (solo admin)
 *     tags: [FormTemplates]
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
 *               schemaB64:
 *                 type: string
 *     responses:
 *       200:
 *         description: Template aggiornato
 */
router.put('/:id', adminOnly, controller.update);

/**
 * @swagger
 * /api/form-templates/{id}:
 *   delete:
 *     summary: Elimina template form (solo admin)
 *     tags: [FormTemplates]
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
 *         description: Template eliminato
 */
router.delete('/:id', adminOnly, controller.delete);

export default router;
