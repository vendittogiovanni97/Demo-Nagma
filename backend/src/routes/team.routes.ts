import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';

import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new TeamController();

router.use(authMiddleware);

/**
 * @swagger
 * /api/team/members:
 *   get:
 *     summary: Lista componenti del team
 *     description: Restituisce la lista di tutti i componenti dello staff (paginata)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filtro per nome
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtro per tipo staff (COLLABORATORE, APPRENDISTA)
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
 *         description: Risultati per pagina
 *     responses:
 *       200:
 *         description: Lista componenti del team
 */
router.get('/members/list', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getUsersForSelect);
router.get('/members', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getUsers);

/**
 * @swagger
 * /api/team/members:
 *   post:
 *     summary: Aggiungi membro al team
 *     description: Aggiunge un nuovo componente allo staff (solo admin)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, color]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Giuseppe Savoia
 *               type:
 *                 type: string
 *                 enum: [COLLABORATORE, APPRENDISTA]
 *               color:
 *                 type: string
 *                 example: "#3b82f6"
 *     responses:
 *       201:
 *         description: Membro creato con successo
 *       400:
 *         description: Dati non validi
 *       403:
 *         description: Non autorizzato
 */
router.post('/members', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.createUser);
router.get('/members/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getMemberById);
router.delete('/members/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.deleteUser);
router.put('/members/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.updateUser);
router.put('/members/:id/reset-password', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.resetPassword);
router.get('/shifts', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getAllShifts);
router.post('/shifts', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.createNewShift);
router.put('/shifts/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.updateShift);
router.delete('/shifts/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.deleteShiftById);

export default router;
