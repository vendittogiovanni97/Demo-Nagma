import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';

import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new TeamController();

router.use(authMiddleware);

/**
 * @swagger
 * /api/team/users:
 *   get:
 *     summary: Lista utenti del team
 *     description: Restituisce la lista di tutti gli utenti del team
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista utenti del team
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/users', controller.getUsers);

/**
 * @swagger
 * /api/team/users:
 *   post:
 *     summary: Crea utente del team
 *     description: Crea un nuovo utente del team (solo admin)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Marco Bianchi
 *               email:
 *                 type: string
 *                 format: email
 *                 example: marco@nagma.it
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER, ARTIST]
 *                 example: ARTIST
 *               phone:
 *                 type: string
 *                 example: +39 333 987654
 *               color:
 *                 type: string
 *                 example: "#10b981"
 *     responses:
 *       201:
 *         description: Utente creato con successo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dati non validi
 *       403:
 *         description: Non autorizzato
 */
router.post('/users', requireRoles('ADMIN'), controller.createUser);

/**
 * @swagger
 * /api/team/users/{id}:
 *   delete:
 *     summary: Elimina utente del team
 *     description: Elimina un utente del team (solo admin)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'utente
 *     responses:
 *       204:
 *         description: Utente eliminato
 *       404:
 *         description: Utente non trovato
 *       403:
 *         description: Non autorizzato
 */
router.delete('/users/:id', requireRoles('ADMIN'), controller.deleteUser);

/**
 * @swagger
 * /api/team/shifts:
 *   get:
 *     summary: Lista turni
 *     description: Restituisce la lista dei turni del team
 *     tags: [Team]
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
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID dell'utente per filtrare
 *     responses:
 *       200:
 *         description: Lista turni
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shift'
 */
router.get('/shifts', controller.getShifts);

/**
 * @swagger
 * /api/team/shifts:
 *   post:
 *     summary: Crea turno
 *     description: Crea un nuovo turno
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, date, startTime, endTime]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: user_123
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-04-15
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "18:00"
 *               notes:
 *                 type: string
 *                 example: Turno mattutino
 *     responses:
 *       201:
 *         description: Turno creato con successo
 *       400:
 *         description: Dati non validi
 */
router.post('/shifts', requireRoles('ADMIN', 'USER'), controller.createShift);

/**
 * @swagger
 * /api/team/shifts/{id}:
 *   put:
 *     summary: Aggiorna turno
 *     description: Aggiorna un turno esistente
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del turno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Turno aggiornato
 *       404:
 *         description: Turno non trovato
 */
router.put('/shifts/:id', requireRoles('ADMIN', 'USER'), controller.updateShift);

/**
 * @swagger
 * /api/team/shifts/{id}:
 *   delete:
 *     summary: Elimina turno
 *     description: Elimina un turno
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del turno
 *     responses:
 *       204:
 *         description: Turno eliminato
 *       404:
 *         description: Turno non trovato
 */
router.delete('/shifts/:id', requireRoles('ADMIN', 'USER'), controller.deleteShift);

export default router;
