import { Router } from 'express';
import { AttachmentController } from '../controllers/attachment.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/attachments/upload:
 *   post:
 *     summary: Carica un allegato per un booking
 *     description: Carica un file allegato associato a un booking. Usa multipart/form-data.
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del booking
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File da caricare
 *     responses:
 *       200:
 *         description: File caricato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attachment'
 *       400:
 *         description: Errore validazione
 *       401:
 *         description: Non autenticato
 *       404:
 *         description: Booking non trovato
 */
router.post(
  '/upload',
  authMiddleware,
  AttachmentController.uploadAttachment.bind(AttachmentController),
);

/**
 * @swagger
 * /api/attachments/{attachmentId}/download:
 *   get:
 *     summary: Scarica un allegato
 *     description: Scarica il file originale di un allegato
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'allegato
 *     responses:
 *       200:
 *         description: File scaricato con successo
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Allegato non trovato
 */
router.get(
  '/:attachmentId/download',
  authMiddleware,
  AttachmentController.downloadAttachment.bind(AttachmentController),
);

/**
 * @swagger
 * /api/attachments/{attachmentId}/preview:
 *   get:
 *     summary: Ottiene una preview dell'allegato
 *     description: Ritorna una preview SVG dell'allegato
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'allegato
 *     responses:
 *       200:
 *         description: Preview ottenuta con successo
 *         content:
 *           image/svg+xml:
 *             schema:
 *               type: string
 *       404:
 *         description: Allegato non trovato
 */
router.get(
  '/:attachmentId/preview',
  authMiddleware,
  AttachmentController.getAttachmentPreview.bind(AttachmentController),
);

/**
 * @swagger
 * /api/attachments/booking/{bookingId}:
 *   get:
 *     summary: Recupera tutti gli allegati di un booking
 *     description: Ritorna la lista di tutti gli allegati associati a un booking
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del booking
 *     responses:
 *       200:
 *         description: Allegati recuperati con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttachmentDetail'
 *                 count:
 *                   type: integer
 *       404:
 *         description: Booking non trovato
 */
router.get(
  '/booking/:bookingId',
  authMiddleware,
  AttachmentController.getBookingAttachments.bind(AttachmentController),
);

/**
 * @swagger
 * /api/attachments/{attachmentId}:
 *   delete:
 *     summary: Elimina un allegato
 *     description: Elimina un allegato dal booking e dal filesystem
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'allegato
 *     responses:
 *       200:
 *         description: Allegato eliminato con successo
 *       404:
 *         description: Allegato non trovato
 */
router.delete(
  '/:attachmentId',
  authMiddleware,
  AttachmentController.deleteAttachment.bind(AttachmentController),
);

export default router;
