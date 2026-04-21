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
router.get('/members', controller.getUsers);

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
router.post('/members', requireRoles('ADMIN'), controller.createUser);

/**
 * @swagger
 * /api/team/members/{id}:
 *   get:
 *     summary: Dettaglio membro del team
 *     description: Restituisce i dati di un singolo componente dello staff
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID dello staff
 *     responses:
 *       200:
 *         description: Dati del membro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Membro non trovato
 */
router.get('/members/:id', authMiddleware, controller.getMemberById);

/**
 * @swagger
 * /api/team/members/{id}:
 *   delete:
 *     summary: Rimuovi membro dal team
 *     description: Elimina un componente dello staff (solo admin)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID dello staff
 *     responses:
 *       204:
 *         description: Membro rimosso
 *       404:
 *         description: Membro non trovato
 *       403:
 *         description: Non autorizzato
 */
router.delete('/members/:id', requireRoles('ADMIN'), controller.deleteUser);

/**
 * @swagger
 * /api/team/members/{id}:
 *   put:
 *     summary: Aggiorna un membro del team
 *     description: Aggiorna i dati di un componente dello staff (solo admin)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID dello staff
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Membro aggiornato con successo
 */
router.put('/members/:id', requireRoles('ADMIN'), controller.updateUser);

/**
 * @swagger
 * /api/team/members/{id}/reset-password:
 *   put:
 *     summary: Resetta password (se applicabile)
 *     description: Consente ad un admin di resettare la password (se il membro ha un account user collegato con lo stesso ID)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword]
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Operazione completata
 */
router.put('/members/:id/reset-password', requireRoles('ADMIN'), controller.resetPassword);

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
router.get('/shifts', controller.getAllShifts);

/**
 * @swagger
 * /api/team/shifts/{staffId}:
 *   get:
 *     summary: Turni di uno staff
 *     description: Restituisce i turni di uno specifico staff
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dello staff
 *     responses:
 *       200:
 *         description: Lista turni dello staff
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shift'
 */
router.get('/shifts/:staffId', controller.getStaffShifts);

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
router.post('/shifts', requireRoles('ADMIN'), controller.createNewShift);

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
router.put('/shifts/:id', requireRoles('ADMIN'), controller.updateShift);

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
router.delete('/shifts/:id', requireRoles('ADMIN'), controller.deleteShiftById);

export default router;
