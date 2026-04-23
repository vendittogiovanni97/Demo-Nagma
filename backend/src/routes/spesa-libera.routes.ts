import { Router } from 'express';
import { SpesaLiberaController } from '../controllers/spesa-libera.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new SpesaLiberaController();

router.use(authMiddleware);

/**
 * @swagger
 * /api/spese-libere:
 *   get:
 *     summary: Lista spese libere
 *     description: Restituisce una lista paginata di spese libere con filtro mese opzionale
 *     tags: [Spese Libere]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         description: Filtro mese (formato YYYY-MM)
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
 *         description: Lista spese libere
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', requireRoles('USER', 'ADMIN', 'SUPER_ADMIN'), controller.getAll);
router.post('/', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.create);
router.delete('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.delete);

export default router;
