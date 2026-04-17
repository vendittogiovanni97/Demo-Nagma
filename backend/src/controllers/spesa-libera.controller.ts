import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import prisma from '../utils/prisma';
import { validate, createSpesaLiberaSchema } from '../schemas';
import { AppError } from '../utils/AppError';

export class SpesaLiberaController {
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const data = await prisma.spesaLibera.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const validated = validate(createSpesaLiberaSchema, req.body);
    const data = await prisma.spesaLibera.create({ data: validated });
    res.status(201).json({ data });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = await prisma.spesaLibera.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Spesa non trovata', 404, 'NOT_FOUND');
    }
    await prisma.spesaLibera.delete({ where: { id } });
    res.status(204).send();
  });
}
